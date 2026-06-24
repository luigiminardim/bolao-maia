import {
  CupGuessResult,
  GroupListGuessResult,
  PoolGuessResult,
} from "@/entity/GuessResult";
import { GuessRankingList } from "@/entity/GuessRankingList";
import { toUserDto, UserDto } from "./UserDto";
import { UserRepository } from "@/repository/UserRepository";
import { PoolSweepstake } from "@/entity/Sweepstake";

export type GuessRankingDto = {
  user: UserDto;
  score: null | number;
  position: number;
};

export type GuessRankingListDto = {
  rankings: GuessRankingDto[];
};

export async function toGuessRankingListDtoFromGroupListGuessResultList(
  guessResultList: GroupListGuessResult[],
  userRepository: UserRepository,
): Promise<GuessRankingListDto> {
  const rankingList =
    GuessRankingList.fromGroupListGuessResultList(guessResultList);

  const rankings = await Promise.all(
    rankingList.items.map(async (item) => {
      const user = await userRepository.findById(item.userId);
      if (!user) {
        throw new Error(
          `toGuessRankingListDtoFromGroupListGuessResultList: user ${item.userId} not found`,
        );
      }
      return {
        user: toUserDto(user),
        score: item.score,
        position: item.position,
      };
    }),
  );

  return { rankings };
}

export async function toGuessRankingListDtoFromCupGuessResultList(
  guessResultList: CupGuessResult[],
  userRepository: UserRepository,
): Promise<GuessRankingListDto> {
  const rankingList = GuessRankingList.fromCupGuessResultList(guessResultList);

  const rankings = await Promise.all(
    rankingList.items.map(async (item) => {
      const user = await userRepository.findById(item.userId);
      if (!user) {
        throw new Error(
          `toGuessRankingListDtoFromCupGuessResultList: user ${item.userId} not found`,
        );
      }
      return {
        user: toUserDto(user),
        score: item.score,
        position: item.position,
      };
    }),
  );

  return { rankings };
}

export type PoolSubsweepstakeMetaDto =
  | { kind: "group"; id: string; name: string }
  | { kind: "cup"; id: string; name: string };

export type PoolGuessRankingSubResultDto =
  | { kind: "group"; sweepstakeId: string; score: number | null }
  | { kind: "cup"; sweepstakeId: string; score: number | null };

export type PoolGuessRankingDto = {
  user: UserDto;
  score: number | null;
  position: number;
  subResultList: PoolGuessRankingSubResultDto[];
};

export type PoolGuessRankingListDto = {
  rankings: PoolGuessRankingDto[];
  subsweepstakes: PoolSubsweepstakeMetaDto[];
};

export async function toPoolGuessRankingListDto(
  poolSweepstake: PoolSweepstake,
  guessResultList: PoolGuessResult[],
  userRepository: UserRepository,
): Promise<PoolGuessRankingListDto> {
  const rankingList = GuessRankingList.fromPoolGuessResultList(guessResultList);

  const subsweepstakes: PoolSubsweepstakeMetaDto[] =
    poolSweepstake.subSweepstakeList.map((item) => {
      if (item.kind === "group") {
        return {
          kind: "group",
          id: item.sweepstake.id,
          name: item.sweepstake.name,
        };
      }
      return {
        kind: "cup",
        id: item.sweepstake.id,
        name: item.sweepstake.name,
      };
    });

  const rankings = await Promise.all(
    rankingList.items.map(async (rankItem) => {
      const user = await userRepository.findById(rankItem.userId);
      if (!user) {
        throw new Error(
          `toPoolGuessRankingListDto: user ${rankItem.userId} not found`,
        );
      }

      const guessResult = guessResultList.find(
        (r) => r.user.id() === rankItem.userId,
      );

      const subResultList: PoolGuessRankingSubResultDto[] = subsweepstakes.map(
        (sub) => {
          const subResult = guessResult?.subResultList.find(
            (r) =>
              (r.kind === "group" &&
                sub.kind === "group" &&
                r.groupResult.sweepstakeId === sub.id) ||
              (r.kind === "cup" &&
                sub.kind === "cup" &&
                r.cupResult.sweepstakeId === sub.id),
          );

          if (sub.kind === "group") {
            const rawScore =
              subResult?.kind === "group" ? subResult.groupResult.score : null;
            const factor = subResult?.kind === "group" ? subResult.factor : 1;
            return {
              kind: "group",
              sweepstakeId: sub.id,
              score: rawScore !== null ? rawScore * factor : null,
            };
          }

          const rawScore =
            subResult?.kind === "cup" ? subResult.cupResult.score : null;
          const factor = subResult?.kind === "cup" ? subResult.factor : 1;
          return {
            kind: "cup",
            sweepstakeId: sub.id,
            score: rawScore !== null ? rawScore * factor : null,
          };
        },
      );

      return {
        user: toUserDto(user),
        score: rankItem.score,
        position: rankItem.position,
        subResultList,
      };
    }),
  );

  return { rankings, subsweepstakes };
}
