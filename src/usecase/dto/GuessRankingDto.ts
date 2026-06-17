import { CupGuessResult, GroupListGuessResult } from "@/entity/GuessResult";
import { GuessRankingList } from "@/entity/GuessRankingList";
import { toUserDto, UserDto } from "./UserDto";
import { UserRepository } from "@/repository/UserRepository";

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
