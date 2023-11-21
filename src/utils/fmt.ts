import { Identifiants, Dpae } from "@/models";
import { authXml, dpaeXml } from "@/templates/templates";
import * as Handlebars from 'handlebars';
import moment from 'moment';

// Format a time to HH:mm:ss
const fmtTime = (time: string): string => {
    return moment(time, ["HH:mm:ss", "HH:mm", "HHmmss", "HHmm", "HH"]).format("HH:mm:ss");
}

// Format a date to yyyy-MM-dd
const fmtDate = (date: string): string => {
    return moment(date, ["YYYY-MM-DD", "YYYYMMDD", "YYYY-MM", "YYYYMM", "YYYY"]).format("YYYY-MM-DD");
}

// Compile a Handlebars template with data and format the result
function compileAndFormatTemplate(template: string, data: Dpae | Identifiants): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
}

// Generate XML for authentication with provided Identifiants data
export const generateAuthXml = (data: Identifiants): string => {

    // Pour un déclarant ou tiers déclarant, il convient de paramétrer le service 25.
    // Pour un concentrateur, le service 98 doit être paramétré.
    if (data.Service !== "25" && data.Service !== "98") {
        throw new Error('Service must be 25 or 98');
    }

    return compileAndFormatTemplate(authXml, data);
}

// Generate XML for Dpae with provided Dpae data
export const generateDpaeXml = (data: Dpae): string => {
    if (data.TestIndicator != 1 && data.TestIndicator != 120) {
        throw new Error('TestIndicator must be 1 or 120');
    }

    if (data.Identifiants.Service != "25" && data.Identifiants.Service != "98") {
        throw new Error('Service must be 25 or 98');
    }

    if (data.Contract.NatureCode != "CDD" && data.Contract.NatureCode != "CDI") {
        throw new Error('NatureCode must be CDD or CDI');
    }

    data.Employee.BirthDate = fmtDate(data.Employee.BirthDate);
    data.Contract.StartContractDate = fmtDate(data.Contract.StartContractDate);
    data.Contract.StartContractTime = fmtTime(data.Contract.StartContractTime);
    data.Contract.EndContractDate = fmtDate(data.Contract.EndContractDate);

    return compileAndFormatTemplate(dpaeXml, data);
}
