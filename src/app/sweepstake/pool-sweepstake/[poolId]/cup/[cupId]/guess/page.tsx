import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { getCupSweepstakeFromPoolUsecase } from "../../../../../../../usecase/index";
import { getLoggedInUser } from "../../../../../../actions";
import { CupGuessFormClient } from "./CupGuessFormClient";

interface PageProps {
  params: Promise<{
    poolId: string;
    cupId: string;
  }>;
}

export default async function CupGuessWizardPage({ params }: PageProps) {
  const { poolId, cupId } = await params;

  const user = await getLoggedInUser();
  if (!user) {
    redirect(
      `/login?callbackUrl=/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}/guess`,
    );
  }

  const cupSweepstake = await getCupSweepstakeFromPoolUsecase.execute(
    poolId,
    cupId,
  );
  if (!cupSweepstake) {
    notFound();
  }

  if (cupSweepstake.status !== "open") {
    redirect(`/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}`);
  }

  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
      <div className="mb-6 w-full max-w-2xl mx-auto flex">
        <Link href={`/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}`}>
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-400 hover:text-zinc-100 rounded-xl text-xs pl-0"
          >
            ← Voltar para o Ranking
          </Button>
        </Link>
      </div>
      <CupGuessFormClient
        poolId={poolId}
        cupId={cupId}
        sweepstake={cupSweepstake}
      />
    </main>
  );
}
