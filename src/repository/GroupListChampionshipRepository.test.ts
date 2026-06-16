import { FileGroupListChampionshipRepository } from "./GroupListChampionshipRepository";
import {
  GroupListChampionship,
  GroupListGroupChampionship,
} from "../entity/Championship";
import { Team } from "../entity/Team";
import { TeamRepository } from "./TeamRepository";
import { JsonStorage } from "../infra/JsonStorage";

describe("FileGroupListChampionshipRepository", () => {
  let mockStorage: jest.Mocked<JsonStorage>;
  let teamRepository: TeamRepository;
  let groupListRepository: FileGroupListChampionshipRepository;

  beforeEach(() => {
    mockStorage = {
      save: jest.fn(),
      load: jest.fn(),
    } as unknown as jest.Mocked<JsonStorage>;

    teamRepository = {
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id) return new Team(id, id);
        return null;
      }),
      save: jest.fn(),
      findAll: jest.fn(),
    } as unknown as TeamRepository;

    groupListRepository = new FileGroupListChampionshipRepository(
      mockStorage,
      teamRepository,
    );
  });

  describe("save", () => {
    it("should map GroupListChampionship to GroupListChampionshipDao and call save on storage", async () => {
      const brazil = new Team("brazil", "Brazil");
      const groupA = new GroupListGroupChampionship("group-a", [brazil, null]);
      const groupList = new GroupListChampionship(
        "2026-world-cup",
        "Test Group List",
        [groupA],
        [brazil],
        2,
        new Date("2026-06-11T12:00:00.000Z"),
      );

      await groupListRepository.save("2026-world-cup", groupList);

      expect(mockStorage.save).toHaveBeenCalledTimes(1);
      expect(mockStorage.save).toHaveBeenCalledWith(
        "/sweepstake/GroupListChampionship/2026-world-cup",
        {
          name: "Test Group List",
          groups: [{ id: "group-a", classification: ["brazil", null] }],
          extraQualifiedList: ["brazil"],
          maxRegularQualifiedPosition: 2,
          startDate: "2026-06-11T12:00:00.000Z",
        },
      );
    });
  });

  describe("findById", () => {
    it("should return null if the id is not 2026-world-cup", async () => {
      const result = await groupListRepository.findById("some-other-id");
      expect(result).toBeNull();
    });

    it("should map dao to entity for the mock 2026-world-cup", async () => {
      mockStorage.load.mockResolvedValueOnce({
        name: "Copa do Mundo FIFA 2026",
        groups: [
          {
            id: "A",
            classification: [
              "mexico",
              "south-korea",
              "czechia",
              "south-africa",
            ],
          },
          {
            id: "B",
            classification: [
              "switzerland",
              "canada",
              "qatar",
              "bosnia-herzegovina",
            ],
          },
          {
            id: "C",
            classification: ["scotland", "morocco", "brazil", "haiti"],
          },
          {
            id: "D",
            classification: ["usa", "australia", "turkiye", "paraguay"],
          },
          {
            id: "E",
            classification: ["germany", "ivory-coast", "ecuador", "curacao"],
          },
          {
            id: "F",
            classification: ["sweden", "japan", "netherlands", "tunisia"],
          },
          {
            id: "G",
            classification: ["new-zealand", "iran", "belgium", "egypt"],
          },
          {
            id: "H",
            classification: ["uruguay", "saudi-arabia", "spain", "cape-verde"],
          },
          {
            id: "I",
            classification: ["france", "senegal", "iraq", "norway"],
          },
          {
            id: "J",
            classification: ["argentina", "algeria", "austria", "jordan"],
          },
          {
            id: "K",
            classification: ["portugal", "dr-congo", "uzbekistan", "colombia"],
          },
          {
            id: "L",
            classification: ["england", "croatia", "ghana", "panama"],
          },
        ],
        extraQualifiedList: [
          "netherlands",
          "brazil",
          "belgium",
          "qatar",
          "spain",
          "austria",
          "uzbekistan",
          "iraq",
        ],
        maxRegularQualifiedPosition: 2,
        startDate: "2026-06-11T19:00:00Z",
      });

      const result = await groupListRepository.findById("2026-world-cup");

      expect(result).not.toBeNull();
      expect(result!.getId()).toBe("2026-world-cup");
      expect(result!.maxRegularQualifiedPosition).toBe(2);
      expect(result!.getStartDate()).toEqual(
        new Date("2026-06-11T19:00:00.000Z"),
      );

      const groups = result!.getGroups();
      expect(groups).toHaveLength(12); // A to L

      const groupA = groups[0]!;
      expect(groupA.getId()).toBe("A");
      expect(groupA.classification).toHaveLength(4);

      const extraQualified = result!.getExtraQualifiedList();
      expect(extraQualified).toHaveLength(8);
    });
  });
});
