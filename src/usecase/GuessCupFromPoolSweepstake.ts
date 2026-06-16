import { Team } from "../entity/Team";
import { PoolGuess, CupGuess } from "../entity/Guess";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { TeamRepository } from "../repository/TeamRepository";
import { BinaryTree, BinaryTreeDao } from "../utils/BinaryTree";

export interface GuessCupFromPoolSweepstakeParam {
  poolSweepstake: string;
  cupSweepstake: string;
  root: BinaryTreeDao<string>;
  thirdPlace: string | null;
}

export class GuessCupFromPoolSweepstake {
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
    params: GuessCupFromPoolSweepstakeParam,
  ): Promise<void> {
    let poolGuess = await this.poolGuessRepository.findByUserAndSweepstake(
      userId,
      params.poolSweepstake,
    );

    if (!poolGuess) {
      poolGuess = new PoolGuess(userId, params.poolSweepstake, []);
    }

    if (poolGuess.getCupGuess(params.cupSweepstake)) {
      throw new Error(
        `Guess for cup sweepstake ${params.cupSweepstake} already exists and cannot be overwritten.`,
      );
    }

    const root = await BinaryTree.fromDtoAsync(params.root, async (teamId) => {
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new Error(`Team ${teamId} not found`);
      }
      return team;
    });

    let thirdPlace: Team | null = null;
    if (params.thirdPlace) {
      thirdPlace = await this.teamRepository.findById(params.thirdPlace);
      if (!thirdPlace) {
        throw new Error(`Team ${params.thirdPlace} not found`);
      }
    }

    const cupGuess = new CupGuess(
      userId,
      params.cupSweepstake,
      root,
      thirdPlace,
    );

    poolGuess.addCupGuess(cupGuess);

    await this.poolGuessRepository.save(poolGuess);
  }
}
