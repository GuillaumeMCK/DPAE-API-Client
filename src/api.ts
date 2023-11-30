import * as m from "./models";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as zlib from "zlib";
import { generateAuthXml, generateDpaeXml } from "./utils/fmt";
import { DPAEError } from "./utils/error";
import {
  RetryNb,
  RetryTempo,
  RetryTempoFirst,
  TimeOut,
  UrlAuth,
  UrlConsultation,
  UrlDepot,
} from "./utils/constants";

/**
 * Class representing a DPAE (Déclaration Préalable à l'Embauche) API client.
 */
export class DPAEClient {
  public TestIndicator: number;
  public Identifiants: m.Identifiants;
  public Employer: m.Employer;
  public Employee: m.Employee;
  public Contract: m.Contract;
  public IdFlux: string;
  public Sended: string;
  private Token: string;
  public Certificat: string;
  public CertifError: string;

  /**
   * Constructor for DPAEClient.
   * @param attributes - DPAE attributes.
   * @param prod - Flag indicating whether it is a production environment (default is false).
   */
  constructor(attributes: m.Dpae, prod: boolean = false) {
    this.TestIndicator = prod ? 120 : 1;
    this.Identifiants = attributes.Identifiants;
    this.Employer = attributes.Employer;
    this.Employee = attributes.Employee;
    this.Contract = attributes.Contract;
    this.IdFlux = attributes.IdFlux;
    this.Sended = attributes.Sended;
    this.Certificat = attributes.Certificat;
    this.CertifError = attributes.CertifError;
    this.Token = attributes.Token;
  }

  /**
   * Returns the current state of DPAE attributes.
   * @returns DPAE attributes.
   */
  public ctx(): m.Dpae {
    return {
      TestIndicator: this.TestIndicator,
      Identifiants: this.Identifiants,
      Employer: this.Employer,
      Employee: this.Employee,
      Contract: this.Contract,
      Token: this.Token,
      IdFlux: this.IdFlux,
      Sended: this.Sended,
      Certificat: this.Certificat,
      CertifError: this.CertifError,
    };
  }

  /**
   * Authenticates the DPAEClient with the provided password.
   * @param pwd - Password for authentication.
   * @returns A promise that resolves to true if authentication is successful, throws an error otherwise.
   */
  public async auth(pwd: string): Promise<boolean> {
    if (!this.Identifiants.SIRET || pwd === "") {
      throw new DPAEError("Informations non renseignées");
    }

    if (this.Token && this.Token.length > 10) {
      return true;
    }

    this.Identifiants.MotDePasse = pwd;
    const xmlAuth = generateAuthXml(this.Identifiants);

    const config: AxiosRequestConfig = {
      method: "POST",
      url: UrlAuth,
      headers: {
        "Content-Type": "application/xml",
      },
      timeout: TimeOut,
      data: xmlAuth,
    };

    const response: AxiosResponse = await axios(config);

    if (response.status === 422) {
      throw new DPAEError("Authentification incorrecte");
    }

    if (response.status !== 200) {
      throw new DPAEError(`Erreur réseau status: ${response.status}`);
    }

    this.Identifiants.MotDePasse = ""; // Clear password to avoid logging
    this.Token = response.data.toString();

    if (this.Token.length < 10) {
      this.Token = "";
      throw new DPAEError(`Erreur jeton: ${this.Token}`);
    }

    return true;
  }

  /**
   * Sends the DPAE data to the server.
   * @returns A promise that resolves to true if the data is sent successfully, throws an error otherwise.
   */
  public async send(): Promise<boolean> {
    if (!this.Token || this.Token.length === 0) {
      throw new DPAEError("Empty token");
    }

    if (!this.Employer.HealthService) {
      this.Employer.HealthService = "01";
    }

    // If the birth department is not set or eq "00", set it to 99 (overseas)
    if (
      this.Employee.BirthDepartment === "00" ||
      !this.Employee.BirthDepartment
    ) {
      this.Employee.BirthDepartment = "99";
    }
    if (this.Employee.BirthDepartment.length > 2) {
      this.Employee.BirthDepartment = this.Employee.BirthDepartment.substring(
        0,
        2
      );
    }

    const bUTF = Buffer.from(generateDpaeXml(this.ctx()), "utf-8");
    this.Sended = bUTF.toString();
    const bISO = Buffer.from(this.Sended, "latin1");
    const bufgz = zlib.gzipSync(bISO);

    const config: AxiosRequestConfig = {
      method: "POST",
      url: UrlDepot,
      headers: {
        "Content-Type": "application/xml",
        Authorization: `DSNLogin jeton=${this.Token}`,
        "Content-Encoding": "gzip",
      },
      timeout: TimeOut,
      data: bufgz,
    };

    const response: AxiosResponse = await axios(config);

    const data: Buffer = Buffer.from(response.data, "binary");

    const reIdFlux = /idflux>(.*)<\/idflux/;
    const fd = reIdFlux.exec(data.toString());
    if (!fd || fd.length !== 2) {
      throw new DPAEError(`DPAE: idflux not found in ${data.toString()}`);
    }

    this.IdFlux = fd[1];

    if (this.IdFlux.length !== 23) {
      throw new DPAEError(`idflux length should be 23 : ${this.IdFlux}`);
    }
    return true;
  }

  /**
   * Retrieves the response from the server after sending data.
   * @param retry - Number of retries (default is 0).
   * @returns A promise that resolves to true if the response is received successfully, throws an error otherwise.
   */
  public async retour(retry: number = 0): Promise<boolean> {
    if (!this.Token || this.Token.length === 0) {
      throw new DPAEError("Empty token");
    }

    if (!this.IdFlux) {
      throw new DPAEError("No IdFlux");
    }

    await this.delay(retry === 0 ? RetryTempoFirst : RetryTempo);

    if (retry > RetryNb) {
      throw new DPAEError(
        `No answer with idflux ${this.IdFlux} after ${RetryNb} tries`
      );
    }

    retry++;

    const config: AxiosRequestConfig = {
      method: "GET",
      url: `${UrlConsultation}${this.IdFlux}`,
      headers: { Authorization: `DSNLogin jeton=${this.Token}` },
      timeout: TimeOut,
    };

    try {
      const response: AxiosResponse = await axios(config);

      const consultation: m.Consultation = response.data;
      const urls = this.extractUrls(consultation);

      if (urls.length === 0) {
        return this.retour(retry);
      }

      const conformityResult = await this.parseCertificat(urls);

      if (conformityResult) {
        return true;
      } else {
        return this.retour(retry);
      }
    } catch (error) {
      return this.retour(retry);
    }
  }

  /**
   * Delays execution for the specified timeout.
   * @param timeout - Time to delay in milliseconds.
   * @returns A promise that resolves after the specified timeout.
   */
  private async delay(timeout: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }

  /**
   * Extracts URLs from the consultation response.
   * @param consultation - Consultation response.
   * @returns Array of URLs.
   * @throws DPAEError if the required information is not found in the response.
   */
  private extractUrls(consultation: m.Consultation): string[] {
    if (!consultation.retours || !consultation.retours.flux) {
      throw new DPAEError("Retours or Flux is undefined in the response");
    }

    const urls: string[] = [];
    consultation.retours.flux.forEach((flux) => {
      if (flux.retour) {
        flux.retour.forEach((retour) => {
          urls.push(retour.url);
        });
      }
    });

    return urls;
  }

  /**
   * Parses the certificate from the provided URLs.
   * @param urls - Array of URLs to parse.
   * @returns A promise that resolves to true if the certificate is parsed successfully, false otherwise.
   */
  private async parseCertificat(urls: string[]): Promise<boolean> {
    const reCertificatConformite =
      /<certificat_conformite>(.*)<\/certificat_conformite>/;
    const reCertificatNonConformite = /<message>([\s\S]*)<\/message>/;

    for (const url of urls) {
      const response: AxiosResponse = await axios.get(url, {
        headers: { Authorization: `DSNLogin jeton=${this.Token}` },
      });

      const str = response.data.toString();

      if (!str.includes('profil="DPAE"')) {
        continue;
      }

      if (str.includes("<etat_conformite>KO</etat_conformite>")) {
        const bilan = reCertificatNonConformite.exec(str);
        if (!bilan || bilan.length !== 2) {
          throw new DPAEError(
            `DPAE: no description for non-conformity ${JSON.stringify(
              this
            )}\n${str}`
          );
        }
        this.CertifError = bilan[1];
        throw new DPAEError(`Non conforme: ${this.CertifError}`);
      }

      if (!str.includes("<etat_conformite>OK</etat_conformite>")) {
        throw new DPAEError(
          `Should contain conformite ${JSON.stringify(this)}\n${str}`
        );
      }

      const certif = reCertificatConformite.exec(str);
      if (!certif || certif.length !== 2) {
        throw new DPAEError(
          `Cannot find certificat ${JSON.stringify(this)} : ${certif}\n${str}`
        );
      }

      this.Certificat = certif[1];

      if (this.Certificat.length < 10) {
        throw new DPAEError(
          `Incorrect certificat ${JSON.stringify(this)} \n${str}`
        );
      }

      return true;
    }

    return false;
  }
}
