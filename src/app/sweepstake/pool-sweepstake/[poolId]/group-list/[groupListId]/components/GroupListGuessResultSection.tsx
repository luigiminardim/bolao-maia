import { Chip } from "@heroui/react";
import {
  GroupListGroupGuessResultDto,
  GroupListGuessResultDto,
  GroupListTeamGuessResultDto,
} from "@/usecase/dto/GuessResultDto";
import { GroupListView } from "./GroupListView";

interface GroupListGuessResultSectionProps {
  result: GroupListGuessResultDto;
}

export function GroupListGuessResultSection({
  result,
}: GroupListGuessResultSectionProps) {
  return (
    <GroupListView.Container
      header={
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 mb-2">
          <div>
            <h3 className="font-extrabold text-lg text-zinc-200">
              Resultados dos Grupos
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              Confira a pontuação obtida em cada palpite da fase de grupos.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl shadow-inner">
              <span className="text-xs text-emerald-400 font-bold">Total:</span>
              <span className="text-lg text-white font-black">
                {result.score != null ? `${result.score} pts` : "--"}
              </span>
            </div>
          </div>
        </div>
      }
    >
      {result.groupList.map((groupResult, groupIdx) => (
        <GroupListGroupResultSection key={groupIdx} result={groupResult} />
      ))}
    </GroupListView.Container>
  );
}

interface GroupResultListProps {
  result: GroupListGroupGuessResultDto;
}

function GroupListGroupResultSection({ result }: GroupResultListProps) {
  return (
    <GroupListView.Group
      groupName={`Grupo ${result.group.id}`}
      topRightContent={
        result.score != null && (
          <Chip size="sm" color="success" className="text-[10px] font-bold">
            {result.score} pts
          </Chip>
        )
      }
    >
      {result.classification.map((teamResult, index) => (
        <GroupListTeamGuessResultArticle key={index} result={teamResult} />
      ))}
    </GroupListView.Group>
  );
}

interface GroupListTeamGuessResultArticleProps {
  result: GroupListTeamGuessResultDto;
}

function GroupListTeamGuessResultArticle({
  result,
}: GroupListTeamGuessResultArticleProps) {
  return (
    <GroupListView.Team
      team={result.team}
      position={result.guessPosition}
      isQualified={result.guessQualified}
      TopRightComponent={
        result.score != null ? (
          result.score > 0 ? (
            <span className="text-emerald-400 font-extrabold text-xs">
              +{result.score} pts
            </span>
          ) : (
            <span className="text-zinc-600 font-bold text-xs">0 pts</span>
          )
        ) : (
          <span className="text-zinc-500 font-bold text-xs">-</span>
        )
      }
      BottomRightComponent={
        <span className="text-[10px] font-semibold text-zinc-500">
          Oficial:{" "}
          <span className="font-bold">
            {result.teamPosition}º {result.teamQualified ? "classificado" : ""}
          </span>
        </span>
      }
    />
  );
}
