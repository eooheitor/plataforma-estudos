import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizIA — Aprenda com questões geradas por IA",
  description: "Plataforma de estudos com geração automática de questões de múltipla escolha usando inteligência artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
