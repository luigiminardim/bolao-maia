import { ReactNode } from "react";
import { CupGuessDto } from "@/usecase/dto/GuessDto";
import { Table, Card } from "@heroui/react";
import { getTeamFlagSvgUrl } from "@/app/utils/getTeamFlagSvgUrl";
import { BinaryTreeDao } from "@/utils/BinaryTree";
import { TeamDto } from "@/usecase/dto/TeamDto";

export function getPhaseName(position: number): string {
  if (position === 1) return "1º";
  if (position === 2) return "2º";
  if (position === 3) return "3º";
  if (position === 4) return "4º";
  if (position === 8) return "QUARTAS";
  if (position === 16) return "OITAVAS";
  return `${position / 2} AVOS`;
}

export interface ExtractedGuess {
  team: TeamDto;
  positionGuess: number;
}

export function extractTeamsFromCupGuess(
  root: BinaryTreeDao<TeamDto | null> | null | undefined,
  thirdPlace: TeamDto | null | undefined,
): ExtractedGuess[] {
  const depthMap = new Map<string, { team: TeamDto; minDepth: number }>();

  function traverse(
    node: BinaryTreeDao<TeamDto | null> | null | undefined,
    depth: number,
  ) {
    if (!node) return;
    if (node.elem && node.elem.id) {
      const existing = depthMap.get(node.elem.id);
      if (!existing || depth < existing.minDepth) {
        depthMap.set(node.elem.id, { team: node.elem, minDepth: depth });
      }
    }
    if (node.children) {
      traverse(node.children[0], depth + 1);
      traverse(node.children[1], depth + 1);
    }
  }

  traverse(root, 0);

  const result: ExtractedGuess[] = [];
  depthMap.forEach(({ team, minDepth }) => {
    let positionGuess = Math.pow(2, minDepth);
    if (thirdPlace && team.id === thirdPlace.id) {
      positionGuess = 3;
    } else if (minDepth === 2 && thirdPlace && team.id !== thirdPlace.id) {
      positionGuess = 4;
    }
    result.push({ team, positionGuess });
  });

  return result.sort((a, b) => a.positionGuess - b.positionGuess);
}

interface CupGuessSectionProps {
  guess: CupGuessDto;
  header?: ReactNode;
}

export function CupGuessSection({ guess, header }: CupGuessSectionProps) {
  const guesses = extractTeamsFromCupGuess(guess.root, guess.thirdPlace);

  return (
    <div className="flex flex-col gap-4">
      {header}
      <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md overflow-x-auto">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Palpites do Campeonato">
              <Table.Header>
                <Table.Column>Palpite</Table.Column>
                <Table.Column isRowHeader>Time</Table.Column>
              </Table.Header>
              <Table.Body>
                {guesses.map((g, index) => {
                  const prev = index > 0 ? guesses[index - 1] : null;
                  const isNewPhase =
                    prev && prev.positionGuess !== g.positionGuess;

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
                        {getPhaseName(g.positionGuess)}
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
