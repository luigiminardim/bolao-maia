import { Card } from "@heroui/react";
import Link from "next/link";

export function LoginCard({ loginHref }: { loginHref: string }) {
  return (
    <Card className="max-w-xl w-full bg-zinc-900/40 border border-zinc-900 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center">
      <span className="text-5xl mb-4 opacity-50 grayscale">🔒</span>
      <h2 className="text-2xl font-extrabold text-white tracking-tight">
        Faça Login para Participar / Acompanhar
      </h2>
      <p className="text-zinc-400 text-sm mt-3 leading-relaxed text-center">
        Você precisa estar logado para ver seus palpites ou participar do bolão.
      </p>
      <div className="mt-8 w-full">
        <Link
          href={loginHref}
          className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 hover:bg-emerald-400 transition-all rounded-xl text-sm flex items-center justify-center"
        >
          Entrar
        </Link>
      </div>
    </Card>
  );
}
