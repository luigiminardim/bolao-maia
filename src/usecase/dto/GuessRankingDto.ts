import { CupGuessResult, GroupListGuessResult } from "@/entity/GuessResult";
import { toUserDto, UserDto } from "./UserDto";
import { UserRepository } from "@/repository/UserRepository";

export type GuessRankingDto = {
  user: UserDto;
  score: null | number;
};

export async function toGuessRankingDtoFromGroupListGuessResult(
  guessResult: GroupListGuessResult,
  userRepository: UserRepository,
): Promise<GuessRankingDto> {
  const user = await userRepository.findById(guessResult.userId);
  if (!user) {
    throw new Error(
      `toGuessRankingDtoFromGroupListGuessResult: user ${guessResult.userId} not found`,
    );
  }
  return {
    user: toUserDto(user),
    score: guessResult.score,
  };
}

export async function toGuessRankingDtoFromCupGuessResult(
  guessResult: CupGuessResult,
  userRepository: UserRepository,
): Promise<GuessRankingDto> {
  const user = await userRepository.findById(guessResult.userId);
  if (!user) {
    throw new Error(
      `toGuessRankingDtoFromCupGuessResult: user ${guessResult.userId} not found`,
    );
  }
  return {
    user: toUserDto(user),
    score: guessResult.score,
  };
}
