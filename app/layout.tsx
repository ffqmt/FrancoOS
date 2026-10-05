import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrancoTech",
  description: "Tecnologia para contabilidade e gestão: AUTAX, Contai e consultoria.",
  metadataBase: new URL("https://francotech.com.br"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
