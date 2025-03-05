import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Utilizando a nova configuração para pacotes externos
  serverExternalPackages: ["node-cron"],

  // Configuração padrão para limites da API
  api: {
    // Você pode manter isso ou removê-lo se quiser usar o padrão
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default nextConfig;
