import { BinaryTree } from "../utils/BinaryTree.ts";
import { Team } from "./Team.ts";

export type ChampionshipStatus = "draft" | "waiting" | "running";

export class GroupListGroupChampionship {
  private id: string;
  classification: (Team | null)[];

  constructor(id: string, classification: (Team | null)[]) {
    this.id = id;
    this.classification = classification;
  }

  getId(): string {
    return this.id;
  }

  numTeams() {
    return this.classification.length;
  }

  teamPosition(team: Team): null | number {
    const position = this.classification.findIndex((t) => t?.id === team.id);
    return position === -1 ? null : position + 1;
  }
}

export class GroupListChampionship {
  private id: string;
  private name: string;
  private groups: GroupListGroupChampionship[];
  private extraQualifiedList: (null | Team)[];
  readonly maxRegularQualifiedPosition: number;
  private startDate: Date;

  constructor(
    id: string,
    name: string,
    groups: GroupListGroupChampionship[],
    extraQualifiedList: (null | Team)[],
    maxRegularQualifiedPosition: number,
    startDate: Date,
  ) {
    this.id = id;
    this.name = name;
    this.groups = groups;
    this.extraQualifiedList = extraQualifiedList;
    this.maxRegularQualifiedPosition = maxRegularQualifiedPosition;
    this.startDate = startDate;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getStatus(): ChampionshipStatus {
    if (this.groups.some((g) => g.classification.some((t) => t === null))) {
      return "draft";
    }
    if (new Date() < this.startDate) {
      return "waiting";
    }
    return "running";
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

  getTeamGroup(team: Team): GroupListGroupChampionship | null {
    return (
      this.groups.find((group) => group.teamPosition(team) !== null) ?? null
    );
  }

  getGroups(): GroupListGroupChampionship[] {
    return this.groups;
  }

  getExtraQualifiedList(): (null | Team)[] {
    return this.extraQualifiedList;
  }

  getGroup(groupId: string): GroupListGroupChampionship | null {
    return this.groups.find((g) => g.getId() === groupId) ?? null;
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
  private id: string;
  private name: string;
  root: BinaryTree<null | Team>;
  hasThirdPlaceMatch: boolean;
  thirdPlace: null | Team;
  private startDate: Date;

  constructor(
    id: string,
    name: string,
    root: BinaryTree<null | Team>,
    hasThirdPlaceMatch: boolean,
    thirdPlace: null | Team,
    startDate: Date,
  ) {
    this.id = id;
    this.name = name;
    this.root = root;
    this.hasThirdPlaceMatch = hasThirdPlaceMatch;
    this.thirdPlace = thirdPlace;
    this.startDate = startDate;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getStartDate(): Date {
    return this.startDate;
  }

  listTeam(): (Team | null)[] {
    return this.root.listLeaf();
  }

  getStatus(): ChampionshipStatus {
    if (this.listTeam().includes(null)) {
      return "draft";
    }
    if (new Date() < this.startDate) {
      return "waiting";
    }
    return "running";
  }

  numTeams(): number {
    return this.root.numLeafs();
  }

  teamPosition(team: Team): null | number {
    if (this.thirdPlace !== null && team.id === this.thirdPlace.id) {
      return 3;
    }
    const height = this.root.findHeight((t) => t !== null && t.id === team.id);
    if (height === null) return null;
    return Math.pow(2, height);
  }
}
