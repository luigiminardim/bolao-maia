import { GroupListGuessResultSection } from "../../components/GroupListGuessResultSection";
import { getLoggedInUser } from "@/app/actions";
import { getGroupListGuessResultFromPoolUsecase } from "@/usecase";
import { GuessResultEmptyState } from "@/app/sweepstake/pool-sweepstake/components/GuessResultEmptyState";
import { GuessResultHeader } from "@/app/sweepstake/pool-sweepstake/components/GuessResultHeader";

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

  const backLink = `/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`;

  if (!groupListGuessResult) {
    return (
      <GuessResultEmptyState
        backLink={backLink}
        backText="Voltar para o Bolão"
      />
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
      <GuessResultHeader
        backLink={backLink}
        userName={groupListGuessResult.user.name}
        subtitle="Confira o palpite deste participante na fase de grupos."
      />

      <GroupListGuessResultSection result={groupListGuessResult} />
    </main>
  );
}
