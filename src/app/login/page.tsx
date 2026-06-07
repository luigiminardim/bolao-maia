"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input, Alert, Spinner } from "@heroui/react";
import { loginAction } from "../actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/sweepstake/pool-sweepstake/2026-world-cup";

  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username || !username.trim()) {
      setErrorMessage("Por favor, digite seu nome.");
      return;
    }

    startTransition(async () => {
      const result = await loginAction(username);
      if (result.success) {
        // Redirect back to callbackUrl or sweepstake dashboard
        router.push(callbackUrl);
        router.refresh();
      } else {
        setErrorMessage(result.error || "Ocorreu um erro ao tentar entrar.");
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden px-4">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl mb-3 animate-bounce">🏆</span>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent tracking-tight">
            Bolão Maia
          </h1>
          <p className="text-zinc-400 text-xs text-center mt-2 leading-relaxed">
            O bolão definitivo de futebol. Digite seu nome abaixo para entrar ou criar seu cadastro instantaneamente.
          </p>
        </div>

        {errorMessage && (
          <Alert
            status="danger"
            className="mb-6 bg-red-950/20 border border-red-900/30 text-red-400 text-xs"
          >
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex flex-col gap-1.5 w-full text-left">
            <label className="text-zinc-300 font-semibold text-xs pl-1">Seu Nome</label>
            <Input
              required
              type="text"
              placeholder="Ex: Luigi Minardi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
              className="w-full bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus-within:border-emerald-500 rounded-xl px-4 py-2.5 text-zinc-100 font-medium text-sm placeholder:text-zinc-600 focus:outline-none transition-all"
            />
          </div>

          <Button
            type="submit"
            isDisabled={isPending}
            className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 hover:bg-emerald-400 transition-all rounded-xl shadow-lg shadow-emerald-500/10 text-sm"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-zinc-950" />
                <span>Entrando...</span>
              </div>
            ) : (
              "Entrar / Cadastrar"
            )}
          </Button>
        </form>

        <div className="text-center mt-8 border-t border-zinc-900 pt-6">
          <p className="text-zinc-500 text-[10px]">
            Ao prosseguir, você concorda com o regulamento do bolão.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center bg-zinc-950">
        <Spinner size="lg" className="text-emerald-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
