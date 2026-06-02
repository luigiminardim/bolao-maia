export class Team {
  // 3 letters (BRA, ARG)
  id: string;
  name: string;
  flag: string;

  constructor(id: string, name: string, flag: string) {
    this.id = id;
    this.name = name;
    this.flag = flag;
  }
}
