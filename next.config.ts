import withPWA from "next-pwa";

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [],
  buildExcludes: [/app-build-manifest\.json$/],
});
