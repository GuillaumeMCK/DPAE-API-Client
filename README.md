# DPAEClient

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The **DPAEClient** is a TypeScript library that serves as an API client for Déclaration Préalable à l'Embauche (DPAE), allowing users to authenticate, send data DPAE, and retrieve responses from the server.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [License](#license)

## Installation

To install the DPAEClient library, run the following command:

```bash
npm install dpae-api-client
```

## Usage

Here's an example of how to use the DPAEClient library:

```typescript
const {DPAEClient} = require("dpae-api-client");

// Create DPAE attributes
const dpaeAttributes = {
    TestIndicator: 1, // 1 : test 2 : production
    Identifiants: {
        SIRET: '...',
        Nom: '...',
        Prenom: '...',
        MotDePasse: '',
        Service: '25', // '25' : declarant '98' : concentrateur
    },
    Employer: {
        Designation: "...",
        SIRET: "...",
        URSSAFCode: "...",
        HealthService: "...",
        APE: "...",
        Phone: "....",
        Adress: "....",
        Town: "....",
        Postal: "...."
    },
    Employee: {
        Surname: "...",
        ChristianName: "...",
        Sex: 2,
        NIR: "2...",
        NIRKey: "..",
        BirthDate: "1999-11-31",
        BirthTown: "...",
        BirthDepartment: "..."
    },
    Contract: {
        NatureCode: "CDD",
        StartContractDate: "2021-11-01",
        StartContractTime: "08:00:00",
        EndContractDate: "2021-12-31"
    },
};

// Create DPAEClient instance
const client = new DPAEClient(dpaeAttributes);

// Authenticate
try {
    await client.auth("your_password");
    console.log("Authentication successful!");
} catch (error) {
    console.error(`Authentication failed: ${error.message}`);
}

// Send data
try {
    await client.send();
    console.log("Data sent successfully!");
} catch (error) {
    console.error(`Failed to send data: ${error.message}`);
}

// Retrieve response
try {
    await client.retour();
    console.log("Response retrieved successfully!");
} catch (error) {
    console.error(`Failed to retrieve response: ${error.message}`);
}
```

## DPAEClient Class

### Constructor

- `new DPAEClient(attributes: DPAE, prod?: boolean)`: Creates a new DPAEClient instance.

  - `attributes`: DPAE attributes.
  - `prod`: Flag indicating whether it is a production environment (default is `false`).

### Methods

- `auth(pwd: string): Promise<boolean>`: Authenticates the DPAEClient with the provided password.

  - `pwd`: Password for authentication.
  - Returns a promise that resolves to `true` if authentication is successful, throws an error otherwise.

- `send(): Promise<boolean>`: Sends the DPAE data to the server.

  - Returns a promise that resolves to `true` if the data is sent successfully, throws an error otherwise.

- `retour(retry?: number): Promise<boolean>`: Retrieves the response from the server after sending data.

  - `retry`: Number of retries (default is `0`).
  - Returns a promise that resolves to `true` if the response is received successfully, throws an error otherwise.

- `ctx(): DPAE`: Returns the current state of DPAE attributes.

## Resources

- [Fonctionnement](https://telechargement.dpae-edi.urssaf.fr/5491-API-DPAE-Fonctionnement-2021.pdf)
- [Guide](https://www.dpae-edi.urssaf.fr/5492-API-DPAE-Guide-Implementation.pdf)
- [Q/A](https://www.dpae-edi.urssaf.fr/5493-API-DPAE-FAQ-v1.1.pdf)
- [Golang implementation](https://github.com/flibustenet/dpae)
