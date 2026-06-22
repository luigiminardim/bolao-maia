import Link from "next/link";

interface GuessResultHeaderProps {
  backLink: string;
  userName: string;
  subtitle?: string;
}

export function GuessResultHeader({
  backLink,
  userName,
  subtitle,
}: GuessResultHeaderProps) {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <Link
          href={backLink}
          className="text-zinc-400 hover:text-zinc-100 rounded-xl text-xs py-1 inline-flex items-center transition-colors"
        >
          ← Voltar para Classificação
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Palpite de <span className="text-emerald-400">{userName}</span>
        </h1>
        {subtitle && <p className="text-zinc-400 text-sm mt-2">{subtitle}</p>}
      </div>
    </>
  );
}
