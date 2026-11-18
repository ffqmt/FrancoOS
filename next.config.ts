import type { NextConfig } from "next";

// O ERP contábil (repositório erpcontabil) roda com basePath /erp e é servido aqui pelo mesmo endereço,
// para usar o mesmo cookie do Supabase: quem entra no FrancoOS já entra no ERP.
const ERP_ORIGEM = process.env.ERP_ORIGEM ?? "https://erpcontabil.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/erp", destination: `${ERP_ORIGEM}/erp` },
      { source: "/erp/:path*", destination: `${ERP_ORIGEM}/erp/:path*` },
    ];
  },
};

export default nextConfig;
