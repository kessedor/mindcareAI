const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://8525d27af55e6c1cf475d339862f9cd2@o4509443228303360.ingest.de.sentry.io/4509453491568720",
  sendDefaultPii: true,
});