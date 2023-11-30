export class DPAEError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DPAEError";
  }
}
