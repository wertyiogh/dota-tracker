import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'api.opendota.com',                  // Данные и старые иконки OpenDota
      'cdn.cloudflare.steamstatic.com',    // Официальный CDN Valve (Герои, скиллы, айтемы)
      'cdn.akamai.steamstatic.com',        // Зеркало Valve
      'steamcdn-a.akamaihd.net',           // Старый архивный сервер Valve
      'cdn.stratz.com',                    // Иконки рангов и расширенная стата
      'static.wikia.nocookie.net',         // Dota 2 Wiki (на случай если CDN Valve упадет)
    ],
  },
};

export default nextConfig;