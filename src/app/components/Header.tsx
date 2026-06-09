"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Avatar } from "@heroui/react";
import { logoutAction } from "../actions";

interface HeaderProps {
  currentUser: {
    name: string;
    id: string;
  } | null;
}

export function Header({ currentUser }: HeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand/Logo */}
        <div className="flex items-center gap-3">
          <span
            onClick={() =>
              router.push("/sweepstake/pool-sweepstake/2026-world-cup")
            }
            className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent tracking-tight cursor-pointer"
          >
            Bolão Maia
          </span>
        </div>

        {/* User Info & Navigation Actions */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-r border-zinc-900 pr-4">
                <Avatar
                  size="sm"
                  aria-label={`Foto de perfil de ${currentUser.name}`}
                  className="size-8 ring-2 ring-emerald-500/20 font-bold bg-emerald-500/20 text-emerald-400"
                >
                  <Avatar.Fallback>
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-zinc-200">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-zinc-500">Logado</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                isDisabled={isPending}
                onPress={handleLogout}
                className="text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
              >
                {isPending ? "Saindo..." : "Sair"}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onPress={() => router.push("/login")}
              className="bg-emerald-500 text-zinc-950 font-bold px-4 py-2 hover:bg-emerald-400 transition-all rounded-xl text-xs"
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
