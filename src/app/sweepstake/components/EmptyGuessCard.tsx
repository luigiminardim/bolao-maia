import { Card } from "@heroui/react";

export function EmptyGuessCard() {
  return (
    <Card className="max-w-xl w-full bg-zinc-900/40 border border-zinc-900 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center">
      <span className="text-5xl mb-4 opacity-50 grayscale">📭</span>
      <h2 className="text-2xl font-extrabold text-white tracking-tight">
        Nenhum palpite encontrado
      </h2>
      <p className="text-zinc-400 text-sm mt-3 leading-relaxed text-center">
        Você não fez um palpite a tempo para este campeonato.
      </p>
    </Card>
  );
}
