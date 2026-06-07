import React from "react";
import { notFound, redirect } from "next/navigation";
import {
  getPoolSweepstakeUsecase,
  getGroupListGuessFromPoolUsecase,
} from "../../../../../../../usecase/index";
import { getLoggedInUser } from "../../../../../../actions";
import { GuessWizardClient } from "./GuessWizardClient";

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
    redirect(`/login?callbackUrl=/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}/guess`);
  }

  const pool = await getPoolSweepstakeUsecase.execute(poolId);

  if (!pool) {
    notFound();
  }

  // Find the specific group list sweepstake
  const sweepstakeItem = pool.subSweepstakeList.find(
    item => item.kind === "group" && item.sweepstake.id === groupListId
  );

  if (!sweepstakeItem || sweepstakeItem.kind !== "group") {
    notFound();
  }

  const serializedSweepstake = sweepstakeItem.sweepstake;
  
  // If the championship has already started, guessing is not allowed. Redirect back.
  const officialHasStarted = new Date() >= new Date(serializedSweepstake.startTime);
  if (officialHasStarted) {
    redirect(`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`);
  }

  // Check if there is an existing guess
  const serializedGuess = await getGroupListGuessFromPoolUsecase.execute(user.id, poolId, groupListId);

  return (
    <GuessWizardClient
      poolId={poolId}
      groupListId={groupListId}
      currentUser={user}
      sweepstake={serializedSweepstake}
      existingGuess={serializedGuess}
    />
  );
}
