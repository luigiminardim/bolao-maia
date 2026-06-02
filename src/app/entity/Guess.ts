import { BinaryTree } from "../utils/BinaryTree";
import { CupChampionship, LeagueChampionship } from "./Championship";
import { GroupAndCupSweepstake } from "./Sweepstake";
import { Team } from "./Team";
import { User } from "./User";

export class CupGuess {
  root: BinaryTree<Team>;
  thirdPlace: null | Team;

  private constructor(root: BinaryTree<Team>, thirdPlace: null | Team) {
    this.root = root;
    this.thirdPlace = thirdPlace;
  }

  teamPosition(team: Team): number | null {
    const height = this.root.findHeight((t) => t.id === team.id);
    if (height === null) return null;
    return Math.pow(2, height);
  }
}

export class LeagueGuess {
  classification: Team[];

  constructor(classification: Team[]) {
    this.classification = classification;
  }

  teamPosition(team: Team): number | null {
    const position = this.classification.indexOf(team);
    return position === -1 ? null : position + 1;
  }
}

export class GroupAndCupGuess {
  userId: User["email"];
  sweepstakeId: GroupAndCupSweepstake["id"];
  cup: null | CupChampionship;
  groupList: null | LeagueChampionship[];
  extraQualifiedList: null | Team[];

  constructor(
    userId: User["email"],
    sweepstakeId: GroupAndCupSweepstake["id"],
    cup: null | CupChampionship,
    groupList: null | LeagueChampionship[],
    extraQualifiedList: Team[],
  ) {
    this.userId = userId;
    this.sweepstakeId = sweepstakeId;
    this.cup = cup;
    this.groupList = groupList;
    this.extraQualifiedList = extraQualifiedList;
  }
}
