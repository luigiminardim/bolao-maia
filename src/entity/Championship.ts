import { BinaryTree } from "../utils/BinaryTree";
import { Team } from "./Team";

export class GroupChampionship {
  id: string;
  classification: Team[];

  constructor(id: string, classification: Team[]) {
    this.id = id;
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

export class GroupListChampionship {
  private groups: GroupChampionship[];
  private extraQualifiedList: (null | Team)[];
  readonly maxRegularQualifiedPosition: number;

  constructor(
    groups: GroupChampionship[],
    extraQualifiedList: (null | Team)[],
    maxRegularQualifiedPosition: number,
  ) {
    this.groups = groups;
    this.extraQualifiedList = extraQualifiedList;
    this.maxRegularQualifiedPosition = maxRegularQualifiedPosition;
  }

  numTeams(): number {
    return this.groups.reduce((acc, group) => acc + group.numTeams(), 0);
  }

  numGroups(): number {
    return this.groups.length;
  }

  teamPosition(team: Team): null | number {
    for (const group of this.groups) {
      const position = group.teamPosition(team);
      if (position !== null) {
        return position;
      }
    }
    return null;
  }

  getGroups(): GroupChampionship[] {
    return this.groups;
  }

  getExtraQualifiedList(): (null | Team)[] {
    return this.extraQualifiedList;
  }

  getGroup(groupId: string): GroupChampionship | null {
    return this.groups.find((g) => g.id === groupId) ?? null;
  }

  positionIsRegularQualified(position: number): boolean {
    return position <= this.maxRegularQualifiedPosition;
  }

  teamIsRegularQualified(team: Team): boolean {
    const position = this.teamPosition(team);
    if (position == null) return false;
    return this.positionIsRegularQualified(position);
  }

  teamIsExtraQualified(team: Team): boolean {
    return this.getExtraQualifiedList().includes(team);
  }

  teamIsQualified(team: Team): boolean {
    return this.teamIsRegularQualified(team) || this.teamIsExtraQualified(team);
  }

  numQualifiedTeams(): number {
    return (
      this.groups.length * this.maxRegularQualifiedPosition +
      this.getExtraQualifiedList().length
    );
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
