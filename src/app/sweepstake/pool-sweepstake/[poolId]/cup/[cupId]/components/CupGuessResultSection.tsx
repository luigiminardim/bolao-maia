import { ReactNode } from "react";
import { CupGuessResultDto } from "@/usecase/dto/GuessResultDto";
import { CupSweepstakeDto } from "@/usecase/dto/SweepstakeDto";
import { Table, Card } from "@heroui/react";
import { getTeamFlagSvgUrl } from "@/app/utils/getTeamFlagSvgUrl";
import { getPhaseName, extractTeamsFromCupGuess } from "./CupGuessSection";

interface CupGuessResultSectionProps {
  result: CupGuessResultDto;
  sweepstake: CupSweepstakeDto;
  header?: ReactNode;
}

export function CupGuessResultSection({
  result,
  sweepstake,
  header,
}: CupGuessResultSectionProps) {
  const officialPositions = extractTeamsFromCupGuess(
    sweepstake.championship.root,
    sweepstake.championship.thirdPlace,
  );

  const officialPositionsMap = new Map<string, number>();
  officialPositions.forEach((op) => {
    officialPositionsMap.set(op.team.id, op.positionGuess);
  });

  return (
    <div className="flex flex-col gap-4">
      {header}
      <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md overflow-x-auto">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Resultados do Campeonato">
              <Table.Header>
                <Table.Column>Palpite</Table.Column>
                <Table.Column isRowHeader>Time</Table.Column>
                <Table.Column>Oficial</Table.Column>
                <Table.Column className="text-right">Pontuação</Table.Column>
              </Table.Header>
              <Table.Body>
                {result.list.map((g, index) => {
                  const prev = index > 0 ? result.list[index - 1] : null;
                  const isNewPhase =
                    prev && prev.guessPosition !== g.guessPosition;
                  const officialPos = officialPositionsMap.get(g.team.id);

                  return (
                    <Table.Row
                      key={g.team.id}
                      className={
                        isNewPhase
                          ? "border-t-[12px] border-zinc-950"
                          : "border-t border-zinc-900/40"
                      }
                    >
                      <Table.Cell className="whitespace-nowrap font-bold text-zinc-400 text-xs py-3">
                        {getPhaseName(g.guessPosition)}
                      </Table.Cell>
                      <Table.Cell className="py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getTeamFlagSvgUrl(g.team.id)}
                            alt={g.team.name}
                            className="shrink-0 w-6 h-4 object-cover rounded-[2px] shadow-sm"
                          />
                          <span className="font-bold text-sm text-zinc-200">
                            {g.team.name}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="py-3">
                        <span className="text-[10px] font-semibold text-zinc-500">
                          <span className="font-bold">
                            {officialPos ? getPhaseName(officialPos) : "-"}
                          </span>
                        </span>
                      </Table.Cell>
                      <Table.Cell className="py-3 text-right">
                        {g.score !== null && g.score > 0 ? (
                          <span className="text-emerald-400 font-extrabold text-xs">
                            +{g.score} pts
                          </span>
                        ) : g.score !== null ? (
                          <span className="text-zinc-600 font-bold text-xs">
                            0 pts
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-bold text-xs">
                            -
                          </span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Card>
    </div>
  );
}
