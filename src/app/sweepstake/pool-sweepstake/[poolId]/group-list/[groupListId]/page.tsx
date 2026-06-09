import React from "react";
import { notFound } from "next/navigation";
import {
  getPoolSweepstakeUsecase,
  getGroupListResultListFromPoolUsecase,
  getGroupListGuessFromPoolUsecase,
} from "../../../../../../usecase/index";
import { getLoggedInUser } from "../../../../../actions";
import { DashboardClient } from "./DashboardClient";

interface PageProps {
  params: Promise<{
    poolId: string;
    groupListId: string;
  }>;
}

export default async function GroupListSweepstakePage({ params }: PageProps) {
  const { poolId, groupListId } = await params;
  const user = await getLoggedInUser();
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

  // 1. User is already DTO
  const serializedUser = user;

  // 2. Sweepstake is already DTO
  const serializedSweepstake = sweepstakeItem.sweepstake;

  // 3. Serialize Existing Guess for current user
  let serializedGuess = null;
  if (user) {
    serializedGuess = await getGroupListGuessFromPoolUsecase.execute(
      user.id,
      poolId,
      groupListId,
    );
  }

  // 4. Serialize Leaderboard Scores & Participant Guess Details
  const serializedLeaderboard =
    (await getGroupListResultListFromPoolUsecase.execute(poolId)) || [];

  return (
    <DashboardClient
      poolId={poolId}
      groupListId={groupListId}
      currentUser={serializedUser}
      sweepstake={serializedSweepstake}
      existingGuess={serializedGuess}
      leaderboard={serializedLeaderboard}
    />
  );
}
