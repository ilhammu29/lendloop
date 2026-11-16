export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        "https://delicate-turkey-5071.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
