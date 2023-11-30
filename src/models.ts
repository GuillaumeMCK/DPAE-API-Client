export interface Identifiants {
  SIRET?: string;
  Nom?: string;
  Prenom?: string;
  MotDePasse?: string;
  Service?: string;
}

export interface Employer {
  Designation?: string;
  SIRET?: string;
  APE?: string;
  URSSAFCode?: string;
  Address?: string;
  Town?: string;
  Postal?: string;
  Phone?: string;
  HealthService?: string;
}

export interface Employee {
  Surname?: string;
  ChristianName?: string;
  Sex?: number;
  NIR?: string;
  NIRKey?: string;
  BirthDate?: string;
  BirthTown?: string;
  BirthDepartment?: string;
}

export interface Contract {
  StartContractDate?: string;
  StartContractTime?: string;
  EndContractDate?: string;
  NatureCode?: string;
}

export interface Dpae {
  TestIndicator?: number;
  Identifiants?: Identifiants;
  Employer?: Employer;
  Employee?: Employee;
  Contract?: Contract;
  Token?: string;
  IdFlux?: string;
  Sended?: string;
  Certificat?: string;
  CertifError?: string;
}

export interface Retour {
  publication: string;
  production: string;
  nature: string;
  statut: string;
  id: string;
  url: string;
}

export interface Flux {
  id: string;
  retour: Retour[];
}

export interface Retours {
  flux: Flux[];
}

export interface Consultation {
  retours: Retours;
}
