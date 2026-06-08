import { redirect, notFound } from "next/navigation";
import { getSweepstakeListUsecase } from "../usecase/index";

export default async function Home() {
  const sweepstakes = await getSweepstakeListUsecase.execute();
  
  if (sweepstakes.length === 0) {
    notFound();
  }
  
  if (sweepstakes.length > 1) {
    console.warn("Multiple sweepstakes found, redirecting to the first one.");
  }
  
  const first = sweepstakes[0];
  if (first.kind === "pool") {
    redirect(`/sweepstake/pool-sweepstake/${first.pool.id}`);
  } else if (first.kind === "cup") {
    redirect(`/sweepstake/cup-sweepstake/${first.cup.id}`);
  } else if (first.kind === "groupList") {
    redirect(`/sweepstake/group-list-sweepstake/${first.groupList.id}`);
  }
}
