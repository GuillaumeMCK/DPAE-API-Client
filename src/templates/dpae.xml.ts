export const dpaeXml = `
<?xml version="1.0" encoding="ISO-8859-1" ?>
<FR_DUE_Upload xmlns:cct="urn:oasis:names:tc:ubl:corecomponentTypes:1.0:0.70"
    xmlns:rxdt="http://www.repxml.org/DataTypes"
    xmlns:rxorg="http://www.repxml.org/Organization"
    xmlns:rxpadr="http://www.repxml.org/PostalAddress"
    xmlns:rxpers="http://www.repxml.org/Person_Identity"
    xmlns:rxphadr="http://www.repxml.org/PhoneAddress"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >
    <FR_DUE_Upload.Test.Indicator> {{TestIndicator}} </FR_DUE_Upload.Test.Indicator>
    <FR_DuesGroup>
        <FR_Employer>
            <FR_EmployerIdentity>
                <rxorg:FR_Organization.SIRET.Identifier> {{Employer.SIRET}} </rxorg:FR_Organization.SIRET.Identifier>
                <rxorg:FR_Organization.Designation.Text> {{Employer.Designation}} </rxorg:FR_Organization.Designation.Text>
                <rxorg:FR_Organization.APE.Code> {{Employer.APE}} </rxorg:FR_Organization.APE.Code>
            </FR_EmployerIdentity>
            <FR_Employer.URSSAF.Code> {{Employer.URSSAFCode}} </FR_Employer.URSSAF.Code>
            <FR_EmployerAddress>
                <rxpadr:FR_PostalAddress.StreetDesignation.Text> {{Employer.Address}} </rxpadr:FR_PostalAddress.StreetDesignation.Text>
                <rxpadr:FR_PostalAddress.Town.Text> {{Employer.Town}} </rxpadr:FR_PostalAddress.Town.Text>
                <rxpadr:FR_PostalAddress.Postal.Code> {{Employer.Postal}} </rxpadr:FR_PostalAddress.Postal.Code>
            </FR_EmployerAddress>
            <FR_EmployerContact>
                <FR_PhoneNumber>
                    <rxphadr:FR_PhoneAddress.PhoneNumber.Text> {{Employer.Phone}} </rxphadr:FR_PhoneAddress.PhoneNumber.Text>
                </FR_PhoneNumber>
            </FR_EmployerContact>
        </FR_Employer>
        <FR_EmployeeGroup>
            <FR_Employee>
                <FR_EmployeeIdentity>
                    <rxpers:FR_PersonIdentity.Surname.Text> {{Employee.Surname}} </rxpers:FR_PersonIdentity.Surname.Text>
                    <rxpers:FR_PersonIdentity.ChristianName.Text> {{Employee.ChristianName}} </rxpers:FR_PersonIdentity.ChristianName.Text>
                    <rxpers:FR_PersonIdentity.Sex.Code> {{Employee.Sex}} </rxpers:FR_PersonIdentity.Sex.Code>
                    <rxpers:FR_NNI>
                        <rxpers:FR_NNI.NIR.Identifier> {{Employee.NIR}} </rxpers:FR_NNI.NIR.Identifier>
                        <rxpers:FR_NNI.NIRKey.Text> {{Employee.NIRKey}} </rxpers:FR_NNI.NIRKey.Text>
                    </rxpers:FR_NNI>
                    <rxpers:FR_Birth>
                        <rxpers:FR_Birth.Date> {{Employee.BirthDate}} </rxpers:FR_Birth.Date>
                        <rxpers:FR_Birth.Town.Text> {{Employee.BirthTown}} </rxpers:FR_Birth.Town.Text>
                    </rxpers:FR_Birth>
                </FR_EmployeeIdentity>
                <FR_EmployeeComplement>
                    <FR_EmployeeComplement.Birth_Department.Code> {{Employee.BirthDepartment}} </FR_EmployeeComplement.Birth_Department.Code>
                </FR_EmployeeComplement>
            </FR_Employee>
            <FR_Contract>
                <FR_Contract.StartContract.Date>{{Contract.StartContractDate}}</FR_Contract.StartContract.Date>
                <FR_Contract.StartContract.Time>{{Contract.StartContractTime}}</FR_Contract.StartContract.Time>
                <FR_Contract.EndContract.Date>{{Contract.EndContractDate}}</FR_Contract.EndContract.Date>
                <FR_Contract.Nature.Code>{{Contract.NatureCode}}</FR_Contract.Nature.Code>
                <FR_Contract.HealthService.Text>{{Employer.HealthService}}</FR_Contract.HealthService.Text>
            </FR_Contract>
        </FR_EmployeeGroup>
    </FR_DuesGroup>
</FR_DUE_Upload>
`.trim();
