import { NextResponse } from "next/server";
import { getPoolGuessListUsecase } from "@/usecase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ poolId: string }> },
) {
  const { poolId } = await params;
  const guessList = await getPoolGuessListUsecase.execute(poolId);

  if (guessList === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(guessList, { status: 200 });
}
