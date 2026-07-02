/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Steam avatars + Dota 2 hero portraits (OpenDota image URLs)
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "**.akamaihd.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
