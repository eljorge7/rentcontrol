import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: {}
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Solo activa PWA full en Producción (evita conflictos de cacheo al desarrollar)
});

export default withSerwist(config);
