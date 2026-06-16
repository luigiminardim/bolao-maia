import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { getGroupListSweepstakeFromPoolUsecase } from "../../../../../../../usecase/index";
import { getLoggedInUser } from "../../../../../../actions";
import { GroupListGuessFormClient } from "./GroupListGuessFormClient";

interface PageProps {
  params: Promise<{
    poolId: string;
    groupListId: string;
  }>;
}

export default async function GuessWizardPage({ params }: PageProps) {
  const { poolId, groupListId } = await params;

  const user = await getLoggedInUser();
  if (!user) {
    redirect(
      `/login?callbackUrl=/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}/guess`,
    );
  }

  const groupListSweepstake =
    await getGroupListSweepstakeFromPoolUsecase.execute(poolId, groupListId);
  if (!groupListSweepstake) {
    notFound();
  }

  if (groupListSweepstake.status !== "open") {
    redirect(`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`);
  }

  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
      <div className="mb-6 w-full max-w-2xl mx-auto flex">
        <Link
          href={`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`}
        >
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-400 hover:text-zinc-100 rounded-xl text-xs pl-0"
          >
            ← Voltar para o Ranking
          </Button>
        </Link>
      </div>
      <GroupListGuessFormClient
        poolId={poolId}
        groupListId={groupListId}
        sweepstake={groupListSweepstake}
      />
    </main>
  );
}
