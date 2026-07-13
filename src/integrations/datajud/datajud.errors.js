export class DataJudError extends Error {
  constructor(code, message, status = 400, details = null) {
    super(message);
    this.name = "DataJudError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function dataJudErrorPayload(error) {
  if (error instanceof DataJudError) {
    return {
      ok: false,
      error: error.code,
      message: error.message,
      details: error.details || undefined,
    };
  }

  return {
    ok: false,
    error: "datajud_error",
    message: error?.message || "Falha controlada no conector DataJud.",
  };
}
