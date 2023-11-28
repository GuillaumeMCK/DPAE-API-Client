import * as m from "./models";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as zlib from "zlib";
import { generateAuthXml, generateDpaeXml } from "./utils/fmt";
import {
  RetryNb,
  RetryTempo,
  RetryTempoFirst,
  TimeOut,
  UrlAuth,
  UrlConsultation,
  UrlDepot,
} from "./utils/constants";

export class DPAEApiClient {
  /// environment (testing : 1, production : 120)
  public TestIndicator: number;
  /// information for authentication
  public Identifiants: m.Identifiants;
  /// information for DPAE
  public Employer: m.Employer;
  public Employee: m.Employee;
  public Contract: m.Contract;
  /// answer from URSSAF
  public IdFlux: string; // the idflux returned by URSSAF (used to get the certificat)
  public Sended: string; // the xml sended
  private Token: string; // token for authentication
  /// return from URSSAF
  public Certificat: string; // the certificat
  public CertifError: string; // the error message if the certificat is not valid
  public constructor(attributes: m.Dpae, prod: boolean = false) {
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
   * @name mode
   * @description set the mode (testing or production)
   * @param {boolean} prod - true for production, false for testing
   * @return {void}
   */
  public mode(prod: boolean): void {
    this.TestIndicator = prod ? 120 : 1;
  }

  /**
   * @name dpae
   * @description return the DPAE object with the current values
   * @return {Promise<boolean>}
   */
  public dpae(): m.Dpae {
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
   * @name auth
   * @description define the Token
   * @param {string} pwd - Password for authentication
   * @return {Promise<boolean>} - Returns a promise resolving to a boolean indicating the success of authentication
   */
  public async auth(pwd: string): Promise<boolean> {
    if (!this.Identifiants.SIRET || pwd === "") {
      throw new Error("Informations non renseignées");
    }

    if (this.Token && this.Token.length > 10) {
      return true;
    }

    this.Identifiants.MotDePasse = pwd;
    const xmlAuth = generateAuthXml(this.Identifiants);

    const config: AxiosRequestConfig = {
      method: "post",
      url: UrlAuth,
      headers: {
        "Content-Type": "application/xml",
      },
      timeout: TimeOut,
      data: xmlAuth,
    };

    try {
      const response: AxiosResponse = await axios(config);

      if (response.status === 422) {
        throw new Error("Authentification incorrecte");
      }

      if (response.status !== 200) {
        throw new Error(`Erreur réseau status: ${response.status}`);
      }

      this.Identifiants.MotDePasse = ""; // Clear password to avoid logging

      this.Token = response.data.toString();

      if (this.Token.length < 10) {
        this.resetToken();
        throw new Error(`Erreur jeton: ${this.Token}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Error during authentication: ${JSON.stringify(error)}`);
    }
  }

  /**
   * @name resetToken
   * @description reset the token to empty
   * @return {void}
   */
  public resetToken(): void {
    this.Token = "";
  }

  /**
   * @name send
   * @description generate the xml and send the DPAE to URSSAF
   * @return {Promise<boolean>}
   */
  public async send(): Promise<boolean> {
    if (!this.Token || this.Token.length === 0) {
      throw new Error("Empty token");
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

    const bUTF = Buffer.from(generateDpaeXml(this.dpae()), "utf-8");
    this.Sended = bUTF.toString();
    const bISO = Buffer.from(this.Sended, "latin1");

    // zip in bufgz
    const bufgz = zlib.gzipSync(bISO);

    // send ziped bufgz
    const config: AxiosRequestConfig = {
      method: "post",
      url: UrlDepot,
      headers: {
        "Content-Type": "application/xml",
        Authorization: `DSNLogin jeton=${this.Token}`,
        "Content-Encoding": "gzip",
      },
      timeout: TimeOut,
      data: bufgz,
    };

    // send gzipped xml
    try {
      const response: AxiosResponse = await axios(config);

      const data: Buffer = Buffer.from(response.data, "binary");

      // parse idflux
      const reIdFlux = /idflux>(.*)<\/idflux/;
      const fd = reIdFlux.exec(data.toString());
      if (!fd || fd.length !== 2) {
        throw new Error(`DPAE: idflux not found in ${data.toString()}`);
      }

      this.IdFlux = fd[1];

      if (this.IdFlux.length !== 23) {
        throw new Error(`idflux length should be 23 : ${this.IdFlux}`);
      }
      return true;
    } catch (error) {
      throw new Error(`Error during sending DPAE: ${JSON.stringify(error)}`);
    }
  }

  /**
   * @name retour
   * @description get the retour and the certificat
   * @param {number} retry - The current retry count
   * @return {Promise<boolean>}
   */
  public async retour(retry: number = 0): Promise<boolean> {
    if (retry === 0) {
      await new Promise((resolve) => setTimeout(resolve, RetryTempoFirst));
    } else {
      await new Promise((resolve) => setTimeout(resolve, RetryTempo));
    }

    if (retry > RetryNb) {
      new Error(`No answer with idflux ${this.IdFlux} after ${RetryNb} tries`);
      return false;
    }

    retry++;

    if (!this.IdFlux) {
      throw new Error("No IdFlux");
    }

    const config: AxiosRequestConfig = {
      method: "get",
      url: `${UrlConsultation}${this.IdFlux}`,
      headers: { Authorization: `DSNLogin jeton=${this.Token}` },
      timeout: TimeOut,
    };

    try {
      const response: AxiosResponse = await axios(config);

      const data: Buffer = Buffer.from(response.data, "binary");

      const consultation: m.Consultation = JSON.parse(data.toString());

      const urls: string[] = [];
      consultation.Retours.Flux.forEach((flux) => {
        flux.Retour.forEach((retour) => {
          urls.push(retour.URL);
        });
      });

      if (urls.length === 0) {
        return this.retour(retry);
      }

      const reCertificatConformite =
        /<certificat_conformite>(.*)<\/certificat_conformite>/;
      const reCertificatNonConformite = /(?s)<message>(.*)<\/message>/;

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
            throw new Error(
              `DPAE: no description for non-conformity ${JSON.stringify(
                this
              )}\n${str}`
            );
          }
          this.CertifError = bilan[1];
          throw new Error(`Non conforme: ${this.CertifError}`);
        }

        if (!str.includes("<etat_conformite>OK</etat_conformite>")) {
          throw new Error(
            `Should contain conformite ${JSON.stringify(this)}\n${str}`
          );
        }

        const certif = reCertificatConformite.exec(str);
        if (!certif || certif.length !== 2) {
          throw new Error(
            `Cannot find certificat ${JSON.stringify(this)} : ${certif}\n${str}`
          );
        }

        this.Certificat = certif[1];

        if (this.Certificat.length < 10) {
          throw new Error(
            `Incorrect certificat ${JSON.stringify(this)} \n${str}`
          );
        }

        break;
      }

      if (this.Certificat.length === 0) {
        return this.retour(retry);
      }

      if (this.Certificat.length < 10) {
        throw new Error(`No certificat on ${JSON.stringify(this)}`);
      }

      return true;
    } catch (error) {
      return this.retour(retry);
    }
  }
}
