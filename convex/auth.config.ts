export default {
  providers: [
    {
      // Email + password — validates JWTs issued by @convex-dev/auth
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
