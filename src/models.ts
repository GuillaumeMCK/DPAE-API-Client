export interface Identifiants {
  SIRET: string;
  Nom: string;
  Prenom: string;
  MotDePasse: string;
  Service: string;
}

export interface Employer {
  Designation: string;
  SIRET: string;
  APE: string;
  URSSAFCode: string;
  Address: string;
  Town: string;
  Postal: string;
  Phone: string;
  HealthService: string;
}

export interface Employee {
  Surname: string;
  ChristianName: string;
  Sex: number;
  NIR: string;
  NIRKey: string;
  BirthDate: string;
  BirthTown: string;
  BirthDepartment: string;
}

export interface Contract {
  StartContractDate: string;
  StartContractTime: string;
  EndContractDate: string;
  NatureCode: string;
}

export interface Dpae {
  TestIndicator: number;
  Identifiants: Identifiants;
  Employer: Employer;
  Employee: Employee;
  Contract: Contract;
  Token: string;
  IdFlux: string;
  Sended: string;
  Certificat: string;
  CertifError: string;
}

export interface Retour {
  Publication: string;
  Production: string;
  Nature: string;
  Statut: string;
  ID: string;
  URL: string;
}

export interface Flux {
  ID: string;
  Retour: Retour[];
}

export interface Retours {
  Flux: Flux[];
}

export interface Consultation {
  Retours: Retours;
}
