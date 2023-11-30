import { Dpae, Identifiants } from "../models";
import { authXml, dpaeXml } from "../templates/templates";
import * as Handlebars from "handlebars";
import moment from "moment";

const employerRgx = /[^a-zA-Z0-9éèêëâàäöôûüîïç°²!#$%&'()*+,-./:;<=>?@ ]/g;
const employeeRgx = /[^A-Z' .&-]/g;
const townRgx = /[^A-Z0-9 .'-]/g;

// Format a time to HH:mm:ss
const fmtTime = (time: string): string => {
  return moment(time, ["HH:mm:ss", "HH:mm", "HHmmss", "HHmm", "HH"]).format(
    "HH:mm:ss"
  );
};

// Format a date to yyyy-MM-dd
const fmtDate = (date: string): string => {
  return moment(date, [
    "YYYY-MM-DD",
    "YYYY/MM/DD",
    "DD-MM-YYYY",
    "DD/MM/YYYY",
    "YYYYMMDD",
    "YYYY-MM",
    "YYYYMM",
    "YYYY",
    "DD/MM/YYYY HH:mm",
    "DD-MM-YYYY HH:mm",
    "DD/MM/YYYY HH:mm:ss",
    "DD-MM-YYYY HH:mm:ss",
    "YY-MM-DD HH:mm:ss",
    "YY-MM-DD HH:mm",
  ]).format("YYYY-MM-DD");
};

const fmtString = (str: string, regex: RegExp, upperCase?: boolean): string => {
  if (upperCase) {
    str = str.toUpperCase();
  }

  let cleanedStr = str.replace(regex, "");

  if (cleanedStr.length > 32) {
    cleanedStr = cleanedStr.substring(0, 32);
  }
  return cleanedStr;
};

// Compile a Handlebars template with data and format the result
function compileAndFormatTemplate(
  template: string,
  data: Dpae | Identifiants
): string {
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(data);
}

// Generate XML for authentication with provided Identifiants data
export const generateAuthXml = (data: Identifiants): string => {
  if (data.Service !== "25" && data.Service !== "98") {
    throw new Error("Service must be 25 or 98");
  }
  return compileAndFormatTemplate(authXml, data);
};

// Generate XML for Dpae with provided Dpae data
export const generateDpaeXml = (data: Dpae): string => {
  if (data.TestIndicator != 1 && data.TestIndicator != 120) {
    throw new Error("TestIndicator must be 1 or 120");
  }

  if (data.Identifiants.Service != "25" && data.Identifiants.Service != "98") {
    throw new Error("Service must be 25 or 98");
  }

  if (
    data.Contract.NatureCode != "CDD" &&
    data.Contract.NatureCode != "CDI" &&
    data.Contract.NatureCode != "CTT"
  ) {
    throw new Error("NatureCode must be CDD, CDI or CTT");
  }

  data.Employee.BirthDate = fmtDate(data.Employee.BirthDate);
  data.Contract.StartContractDate = fmtDate(data.Contract.StartContractDate);
  data.Contract.StartContractTime = fmtTime(data.Contract.StartContractTime);
  data.Contract.EndContractDate = fmtDate(data.Contract.EndContractDate);

  data.Employer.Designation = fmtString(data.Employer.Designation, employerRgx);
  data.Employer.Address = fmtString(data.Employer.Address, employerRgx);

  data.Employer.Town = fmtString(data.Employer.Town, employerRgx);
  data.Employer.Postal = fmtString(data.Employer.Postal, employerRgx);

  data.Employee.Surname = fmtString(data.Employee.Surname, employeeRgx, true);
  data.Employee.ChristianName = fmtString(data.Employee.ChristianName, employeeRgx, true);

  data.Employee.BirthTown = fmtString(data.Employee.BirthTown, townRgx, true);

  return compileAndFormatTemplate(dpaeXml, data);
};
