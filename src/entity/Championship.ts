import { BinaryTree } from "../utils/BinaryTree";
import { Team } from "./Team";

export class LeagueChampionship {
  id: string;
  maxQualifiedPosition: number;
  classification: Team[];

  constructor(
    id: string,
    maxQualifiedPosition: number,
    classification: Team[],
  ) {
    this.id = id;
    this.maxQualifiedPosition = maxQualifiedPosition;
    this.classification = classification;
  }

  numTeams() {
    return this.classification.length;
  }

  teamPosition(team: Team): null | number {
    const position = this.classification.indexOf(team);
    return position === -1 ? null : position + 1;
  }
}

export class CupChampionship {
  id: string;
  root: BinaryTree<Team>;
  hasThirdPlaceMatch: boolean;
  thirdPlace: null | Team;

  constructor(
    id: string,
    root: BinaryTree<Team>,
    hasThirdPlaceMatch: boolean,
    thirdPlace: null | Team,
  ) {
    this.id = id;
    this.root = root;
    this.hasThirdPlaceMatch = hasThirdPlaceMatch;
    this.thirdPlace = thirdPlace;
  }

  numTeams(): number {
    return this.root.numLeafs();
  }

  teamPosition(team: Team): null | number {
    if (this.thirdPlace !== null && team.id === this.thirdPlace.id) {
      return 3;
    }
    const height = this.root.findHeight((t) => t.id === team.id);
    if (height === null) return null;
    return Math.pow(2, height);
  }
}

export class GroupAndCupChampionship {
  id: string;
  cup: CupChampionship;
  groups: LeagueChampionship[];
  // Number of extra group classifications to be considered (best of those who didn't qualify).
  extraQualifiedList: (null | Team)[];

  constructor(
    id: string,
    cup: CupChampionship,
    groups: LeagueChampionship[],
    extraQualifiedList: (null | Team)[],
  ) {
    this.id = id;
    this.cup = cup;
    this.groups = groups;
    this.extraQualifiedList = extraQualifiedList;
  }

  group(groupId: string): LeagueChampionship | null {
    return this.groups.find((g) => g.id === groupId) ?? null;
  }
}
