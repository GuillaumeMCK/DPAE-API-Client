export interface BilanError {
    Bilan: string;
}

export class URSSAFError extends Error {
    constructor(message: string, public readonly err: Error | null) {
        super(`URSSAF: ${message} ${err !== null ? err.message : ''}`);
    }
}

export function UErr(err: Error | null, s: string): URSSAFError {
    return new URSSAFError(s, err);
}
