import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import {
  getPoolSweepstakeUsecase,
  getGroupListGuessFromPoolUsecase,
} from "../../../../../../../usecase/index";
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

  const pool = await getPoolSweepstakeUsecase.execute(poolId);

  if (!pool) {
    notFound();
  }

  // Find the specific group list sweepstake
  const sweepstakeItem = pool.subSweepstakeList.find(
    (item) => item.kind === "group" && item.sweepstake.id === groupListId,
  );

  if (!sweepstakeItem || sweepstakeItem.kind !== "group") {
    notFound();
  }

  const serializedSweepstake = sweepstakeItem.sweepstake;

  // If the championship has already started, guessing is not allowed. Redirect back.
  const officialHasStarted =
    new Date() >= new Date(serializedSweepstake.startDate);
  if (officialHasStarted) {
    redirect(`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`);
  }

  // Check if there is an existing guess
  const serializedGuess = await getGroupListGuessFromPoolUsecase.execute(
    user.id,
    poolId,
    groupListId,
  );

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
        sweepstake={serializedSweepstake}
        existingGuess={serializedGuess}
      />
    </main>
  );
}
