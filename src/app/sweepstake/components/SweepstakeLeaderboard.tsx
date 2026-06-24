import { Table, Avatar } from "@heroui/react";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import {
  GuessRankingDto,
  GuessRankingListDto,
} from "@/usecase/dto/GuessRankingDto";
import { UserDto } from "@/usecase/dto/UserDto";

export function SweepstakeLeaderboard({
  guessRankListDto,
  currentUser,
  getUserGuessLink,
}: {
  guessRankListDto: GuessRankingListDto;
  currentUser: UserDto | null;
  getUserGuessLink: (userId: string) => string;
}) {
  const guessRankList = guessRankListDto?.rankings ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-extrabold text-zinc-200 tracking-tight">
          Classificação dos Participantes
        </h3>
        <p className="text-zinc-500 text-xs mt-0.5">
          Acompanhe o ranking e a pontuação dos participantes.
        </p>
      </div>

      <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden mt-2">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Tabela de Ranking de Palpites"
              className="w-full"
            >
              <Table.Header className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-850 text-xs font-bold uppercase tracking-wider">
                <Table.Column
                  isRowHeader
                  className="w-10 sm:w-20 pl-4 sm:pl-6 py-3 sm:py-4"
                >
                  {" "}
                </Table.Column>
                <Table.Column className="py-3 sm:py-4">Usuário</Table.Column>
                <Table.Column className="text-right pr-4 sm:pr-6 py-3 sm:py-4">
                  Pts.
                </Table.Column>
              </Table.Header>
              <Table.Body className="text-sm font-semibold text-zinc-200">
                {guessRankList.map((entry, index) => (
                  <LeaderboardTableRow
                    key={entry.user.id}
                    guessRank={entry}
                    showPosition={
                      index === 0 ||
                      entry.position !== guessRankList[index - 1]?.position
                    }
                    isMe={entry.user.id === currentUser?.id}
                    userGuessLink={getUserGuessLink(entry.user.id)}
                  />
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );
}

function LeaderboardTableRow({
  guessRank: entry,
  showPosition,
  isMe,
  userGuessLink,
}: {
  guessRank: GuessRankingDto;
  showPosition: boolean;
  isMe: boolean;
  userGuessLink: string;
}) {
  const rank = entry.position;
  return (
    <Table.Row
      className={`border-b border-zinc-900 transition-all ${
        isMe ? "bg-emerald-500/5 font-bold" : ""
      }`}
    >
      <Table.Cell className="pl-4 sm:pl-6 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center justify-center size-6 rounded-full text-xs font-bold transition-opacity ${
              showPosition ? "opacity-100" : "opacity-0"
            } ${
              isMe
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-500"
            }`}
          >
            {rank}º
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className="py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <Avatar
            size="sm"
            className={`size-8 font-bold ${isMe ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"}`}
          >
            <Avatar.Fallback>
              {entry.user.name.substring(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <Link
            href={userGuessLink}
            className={`group flex items-center gap-1.5 transition-colors ${
              isMe
                ? "text-emerald-400 font-extrabold hover:text-emerald-300"
                : "text-zinc-200 hover:text-white"
            }`}
          >
            <span className="line-clamp-2">{entry.user.name}</span>
            <ExternalLinkIcon className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </Table.Cell>
      <Table.Cell className="text-right pr-4 sm:pr-6 py-3 sm:py-4 font-black">
        <span className={isMe ? "text-emerald-400" : "text-zinc-100"}>
          {entry.score != null ? `${entry.score} pts` : "-"}
        </span>
      </Table.Cell>
    </Table.Row>
  );
}
