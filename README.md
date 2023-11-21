# DPAE API Client

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)
![WIP](https://img.shields.io/badge/status-WIP-yellow.svg)

## Overview

This is a TypeScript library for interacting with the URSSAF (Union de Recouvrement des Cotisations de Sécurité Sociale et d'Allocations Familiales), specifically for handling Déclaration Préalable à l'Embauche (DPAE) submissions.

## Installation

```bash
npm install
```

## Usage

```typescript
import { DPAEApiClient } from 'path-to-api';
import * as models from 'path-to-models';

// Create DPAE object
const dpae = new DPAEApiClient({
  TestIndicator: 1, // Set to 1 for testing or 120 for production
  Identifiants: {
    SIRET: 'your-siret-number',
    Nom: 'Your Company Name',
    Prenom: 'Your Company FirstName',
    MotDePasse: 'your-password',
    Service: '25', // Set to '25' for declarant or '98' for concentrateur
  },
  Employer: {
    // ... Employer details
  },
  Employee: {
    // ... Employee details
  },
  Contract: {
    // ... Contract details
  },
  // ... Additional attributes
});

// Authenticate
try {
  await dpae.auth('your-password');
} catch (error) {
  console.error(error.message);
}

// Send DPAE
try {
  await dpae.send();
} catch (error) {
  console.error(error.message);
}

// Retrieve response and certificate
try {
  await dpae.retour();
  console.log(`Certificate: ${dpae.Certificat}`);
} catch (error) {
  console.error(error.message);
}
```

## API Reference

### `DPAEApiClient` Class

#### Methods:

- **`dpae(): models.Dpae`**
    - Returns the current state of the DPAE object.

- **`auth(pwd: string): Promise<boolean>`**
    - Authenticates the user with the provided password.
    - Returns a Promise resolving to `true` if authentication is successful.

- **`resetToken(): Promise<void>`**
    - Resets the authentication token.

- **`send(): Promise<boolean>`**
    - Generates the XML and sends the DPAE to URSSAF.
    - Returns a Promise resolving to `true` if the submission is successful.

- **`retour(retry: number = 0): Promise<boolean>`**
    - Retrieves the response and certificate from URSSAF.
    - Takes an optional `retry` parameter for the current retry count.
    - Returns a Promise resolving to `true` if the retrieval is successful.

#### Properties:

- **`TestIndicator: number`**
    - Indicates the environment (testing: 1, production: 120).

- **`Identifiants: models.Identifiants`**
    - Contains information for authentication.

- **`Employer: models.Employer`**
    - Contains information for the employer.

- **`Employee: models.Employee`**
    - Contains information for the employee.

- **`Contract: models.Contract`**
    - Contains information for the employment contract.

- **`IdFlux: string`**
    - The idFlux returned by the send request to fetch the certificate.

- **`Sended: string`**
    - The XML sent to URSSAF.

- **`Token: string`**
    - The authentication token.

- **`Certificat: string`**
    - The certificate returned by URSSAF.

- **`CertifError: string`**
    - The error message if the certificate is not valid.

#### Constructor:

- **`constructor(attributes: models.Dpae, prod: boolean = false)`**
    - Initializes the `DPAEApiClient` object with the provided attributes and environment.

### Models

- **`Identifiants`**
- **`Employer`**
- **`Employee`**
- **`Contract`**
- **`Dpae`**
- **`Retour`**
- **`Flux`**
- **`Retours`**
- **`Consultation`**

### Official Documentation

- [Guide Implementation](https://www.dpae-edi.urssaf.fr/5492-API-DPAE-Guide-Implementation.pdf)
- [Q/A](https://www.dpae-edi.urssaf.fr/5493-API-DPAE-FAQ-v1.1.pdf)

