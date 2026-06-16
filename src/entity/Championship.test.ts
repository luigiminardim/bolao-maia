import {
  GroupListGroupChampionship,
  GroupListChampionship,
} from "./Championship";
import { Team } from "./Team";

describe("Championship", () => {
  describe("GroupListChampionship", () => {
    describe("getTeamGroup", () => {
      it("should return the group containing the team", () => {
        const team1 = new Team("t1", "Team 1");
        const team2 = new Team("t2", "Team 2");
        const team3 = new Team("t3", "Team 3");

        const groupA = new GroupListGroupChampionship("gA", [team1, team2]);
        const groupB = new GroupListGroupChampionship("gB", [team3]);

        const championship = new GroupListChampionship(
          "c1",
          "Champ 1",
          [groupA, groupB],
          [],
          1,
          new Date(),
        );

        expect(championship.getTeamGroup(team1)).toBe(groupA);
        expect(championship.getTeamGroup(team3)).toBe(groupB);
      });

      it("should return null if the team is not in any group", () => {
        const team1 = new Team("t1", "Team 1");
        const team2 = new Team("t2", "Team 2");

        const groupA = new GroupListGroupChampionship("gA", [team1]);

        const championship = new GroupListChampionship(
          "c1",
          "Champ 1",
          [groupA],
          [],
          1,
          new Date(),
        );

        expect(championship.getTeamGroup(team2)).toBeNull();
      });
    });
  });
});
