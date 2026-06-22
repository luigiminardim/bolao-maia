import { ReactNode } from "react";
import {
  CupGuessResultDto,
  CupTeamGuessDto,
} from "@/usecase/dto/GuessResultDto";
import { CupSweepstakeDto } from "@/usecase/dto/SweepstakeDto";
import { Table, Card } from "@heroui/react";
import { getTeamFlagSvgUrl } from "@/app/utils/getTeamFlagSvgUrl";
import { getPhaseName, extractTeamsFromCupGuess } from "./CupGuessSection";
import { BinaryTreeDao } from "@/utils/BinaryTree";
import { TeamDto } from "@/usecase/dto/TeamDto";

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
  const guessesList: {
    team: TeamDto;
    positionGuess: number;
    score: number | null;
  }[] = [];

  function traverseResultForList(
    node: BinaryTreeDao<CupTeamGuessDto> | null | undefined,
  ) {
    if (!node) return;
    if (node.elem && node.elem.team && node.elem.team.id) {
      if (!guessesList.find((g) => g.team.id === node.elem.team!.id)) {
        guessesList.push({
          team: node.elem.team,
          positionGuess: node.elem.positionGuess ?? 999,
          score: node.elem.score,
        });
      }
    }
    if (node.children) {
      traverseResultForList(node.children[0]);
      traverseResultForList(node.children[1]);
    }
  }
  traverseResultForList(result.root);
  if (
    result.thirdPlace?.team?.id &&
    !guessesList.find((g) => g.team.id === result.thirdPlace!.team!.id)
  ) {
    guessesList.push({
      team: result.thirdPlace.team,
      positionGuess: result.thirdPlace.positionGuess ?? 3,
      score: result.thirdPlace.score,
    });
  }

  guessesList.sort(
    (a, b) => (a.positionGuess || 999) - (b.positionGuess || 999),
  );

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
                {guessesList.map((g, index) => {
                  const prev = index > 0 ? guessesList[index - 1] : null;
                  const isNewPhase =
                    prev && prev.positionGuess !== g.positionGuess;
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
                        {g.positionGuess ? getPhaseName(g.positionGuess) : "-"}
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
