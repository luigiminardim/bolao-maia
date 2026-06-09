import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getLoggedInUser } from "./actions";
import { Header } from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolão Maia - Palpites de Futebol",
  description:
    "Participe do bolão definitivo de futebol, dê seus palpites para a fase de grupos e mata-mata e suba no ranking!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLoggedInUser();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
        <Providers>
          <Header currentUser={user} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
