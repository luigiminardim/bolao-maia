import { GroupAndCupChampionship } from "./Championship";
import { CupScorePolicy, LeagueScorePolicy } from "./ScorePolicy";

export class GroupAndCupSweepstake {
  id: string;
  championship: GroupAndCupChampionship;
  leagueScorePolicy: LeagueScorePolicy;
  cupScorePolicy: CupScorePolicy;
  groupStartDate: Date;
  groupEndDate: Date;
  cupStartDate: Date;

  constructor(
    id: string,
    groupAndCupChampionship: GroupAndCupChampionship,
    groupStartDate: Date,
    groupEndDate: Date,
    leagueScorePolicy: LeagueScorePolicy,
    cupStartDate: Date,
    cupScorePolicy: CupScorePolicy,
  ) {
    this.id = id;
    this.championship = groupAndCupChampionship;
    this.leagueScorePolicy = leagueScorePolicy;
    this.cupScorePolicy = cupScorePolicy;
    this.groupStartDate = groupStartDate;
    this.groupEndDate = groupEndDate;
    this.cupStartDate = cupStartDate;
  }
}
