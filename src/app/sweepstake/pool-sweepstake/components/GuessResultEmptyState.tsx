import Link from "next/link";

interface GuessResultEmptyStateProps {
  backLink: string;
  backText: string;
}

export function GuessResultEmptyState({
  backLink,
  backText,
}: GuessResultEmptyStateProps) {
  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center max-w-5xl text-center">
      <span className="text-5xl mb-4 opacity-50 grayscale">📭</span>
      <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">
        Palpite Indisponível
      </h2>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-md">
        O palpite deste usuário não foi encontrado ou não está disponível para
        visualização no momento.
      </p>
      <Link
        href={backLink}
        className="bg-zinc-800 text-white font-bold py-3 px-6 hover:bg-zinc-700 transition-all rounded-xl text-sm inline-flex items-center justify-center"
      >
        {backText}
      </Link>
    </main>
  );
}
