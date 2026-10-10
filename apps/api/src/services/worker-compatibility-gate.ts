import { evaluateCloudWorkerHandshake } from "@kivro/compatibility";

export function gateWorkerCloudHandshake(input: {
  protocolVersion?: number;
  workerVersion?: string;
}):
  | { ok: true }
  | {
      ok: false;
      body: {
        error: string;
        code: string;
        message: string;
        remediation: string;
      };
      httpStatus: 426 | 403;
    } {
  const result = evaluateCloudWorkerHandshake(input);
  if (result.ok) {
    return { ok: true };
  }
  return {
    ok: false,
    httpStatus: result.httpStatus,
    body: {
      error: result.code,
      code: result.code,
      message: result.message,
      remediation: result.remediation,
    },
  };
}
