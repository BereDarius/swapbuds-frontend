// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production and not on localhost or CI
const isLocalhost =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    : process.env.HOSTNAME === "localhost" || process.env.CI === "true";

if (process.env.NODE_ENV === "production" && !isLocalhost) {
  Sentry.init({
    dsn: "https://5fc1e8f553d627d6278274557ba16a73@o4510399085608960.ingest.de.sentry.io/4510399098912848",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}
