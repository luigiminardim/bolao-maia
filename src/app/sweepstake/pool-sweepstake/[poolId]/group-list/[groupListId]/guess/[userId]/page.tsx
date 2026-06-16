import Link from "next/link";
import { GroupListGuessResultSection } from "../../components/GroupListGuessResultSection";
import { getLoggedInUser } from "@/app/actions";
import { getGroupListGuessResultFromPoolUsecase } from "@/usecase";

interface PageProps {
  params: Promise<{
    poolId: string;
    groupListId: string;
    userId: string;
  }>;
}

export default async function GroupListGuessResultFromPoolPage({
  params,
}: PageProps) {
  const { poolId, groupListId, userId } = await params;
  const loggedUser = await getLoggedInUser();
  const groupListGuessResult =
    await getGroupListGuessResultFromPoolUsecase.execute(
      poolId,
      groupListId,
      userId,
      loggedUser?.id ?? null,
    );

  if (!groupListGuessResult) {
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
          href={`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`}
          className="bg-zinc-800 text-white font-bold py-3 px-6 hover:bg-zinc-700 transition-all rounded-xl text-sm inline-flex items-center justify-center"
        >
          Voltar para o Bolão
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href={`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`}
          className="text-zinc-400 hover:text-zinc-100 rounded-xl text-xs py-1 inline-flex items-center transition-colors"
        >
          ← Voltar para Classificação
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Palpite de{" "}
          <span className="text-emerald-400">
            {groupListGuessResult.user.name}
          </span>
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Confira o palpite deste participante na fase de grupos.
        </p>
      </div>

      <GroupListGuessResultSection result={groupListGuessResult} />
    </main>
  );
}
