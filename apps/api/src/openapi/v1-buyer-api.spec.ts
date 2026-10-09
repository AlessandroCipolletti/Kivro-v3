/** §322 — OpenAPI stub for buyer REST v1 (served at GET /v1/openapi.json). */
export const v1BuyerOpenApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Kivro Buyer API v1",
    version: "1.0.0",
    description:
      "Programmatic buyer access (Bearer API key). Same job/payment semantics as the web UI.",
  },
  servers: [{ url: "/v1" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Buyer API key (mk_live_…)",
      },
    },
  },
  paths: {
    "/capabilities": {
      get: {
        summary: "List published capabilities",
        responses: { "200": { description: "OK" }, "401": { description: "INVALID_API_KEY" } },
      },
    },
    "/capabilities/{id}": {
      get: {
        summary: "Capability detail",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" }, "404": { description: "NOT_FOUND" } },
      },
    },
    "/capabilities/{id}/jobs": {
      post: {
        summary: "Create job (credits)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          {
            name: "Idempotency-Key",
            in: "header",
            schema: { type: "string" },
            description: "Strongly recommended",
          },
        ],
        responses: {
          "201": { description: "Job created" },
          "402": { description: "INSUFFICIENT_FUNDS" },
          "409": { description: "Conflict / idempotency reuse" },
        },
      },
    },
    "/jobs": {
      get: {
        summary: "List buyer jobs",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", maximum: 100 } },
          { name: "cursor", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/jobs/{id}": {
      get: {
        summary: "Job detail",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "404": { description: "NOT_FOUND" } },
      },
    },
    "/jobs/{id}/cancel": {
      post: {
        summary: "Cancel queued/scheduled job",
        responses: { "200": { description: "Cancelled" }, "409": { description: "Not cancellable" } },
      },
    },
    "/assets/upload-intents": {
      post: {
        summary: "Create upload intent for job inputs",
        responses: { "201": { description: "Upload URL" } },
      },
    },
    "/assets/{id}/finalize": {
      post: { summary: "Confirm upload completed", responses: { "200": { description: "OK" } } },
    },
    "/assets/{id}": {
      get: { summary: "Asset metadata", responses: { "200": { description: "OK" } } },
    },
  },
} as const;
