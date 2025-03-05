/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar ESM para permitir que o node-cron funcione corretamente
  experimental: {
    serverComponentsExternalPackages: ["node-cron"],
  },
  // Aumentar o limite de tamanho da carga útil para permitir mais dados
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

module.exports = nextConfig;
