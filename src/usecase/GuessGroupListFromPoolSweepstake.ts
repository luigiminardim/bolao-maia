import { Team } from "../entity/Team";
import { PoolGuess, GroupListGuess, GroupGuess } from "../entity/Guess";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { TeamRepository } from "../repository/TeamRepository";

export interface GuessGroupListFromPoolSweepstakeParam {
  poolSweepstake: string;
  groupListSweepstake: string;
  groupGuesses: { classification: string[] }[];
  extraQualifiedListGuess: string[];
}

export class GuessGroupListFromPoolSweepstake {
  private readonly poolGuessRepository: PoolGuessRepository;
  private readonly teamRepository: TeamRepository;

  constructor(
    poolGuessRepository: PoolGuessRepository,
    teamRepository: TeamRepository,
  ) {
    this.poolGuessRepository = poolGuessRepository;
    this.teamRepository = teamRepository;
  }

  async execute(
    userId: string,
    params: GuessGroupListFromPoolSweepstakeParam,
  ): Promise<void> {
    let poolGuess = await this.poolGuessRepository.findByUserAndSweepstake(
      userId,
      params.poolSweepstake,
    );

    if (!poolGuess) {
      poolGuess = new PoolGuess(userId, params.poolSweepstake, []);
    }

    if (poolGuess.getGroupListGuess(params.groupListSweepstake)) {
      throw new Error(
        `Guess for group list sweepstake ${params.groupListSweepstake} already exists and cannot be overwritten.`,
      );
    }

    const groupGuesses: GroupGuess[] = [];
    for (const group of params.groupGuesses) {
      const classification: Team[] = [];
      for (const teamId of group.classification) {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
          throw new Error(`Team ${teamId} not found`);
        }
        classification.push(team);
      }
      groupGuesses.push(new GroupGuess(classification));
    }

    const extraQualifiedListGuess: Team[] = [];
    for (const teamId of params.extraQualifiedListGuess) {
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new Error(`Team ${teamId} not found`);
      }
      extraQualifiedListGuess.push(team);
    }

    const groupListGuess = new GroupListGuess(
      userId,
      params.groupListSweepstake,
      groupGuesses,
      extraQualifiedListGuess,
    );

    poolGuess.addGroupListGuess(groupListGuess);

    await this.poolGuessRepository.save(poolGuess);
  }
}
