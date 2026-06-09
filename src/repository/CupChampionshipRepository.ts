import { CupChampionship } from "../entity/Championship";
import { TeamRepository } from "./TeamRepository";
import { JsonStorage } from "../infra/JsonStorage";
import {
  CupChampionshipDao,
  CupChampionshipDaoBuilder,
} from "./dao/CupChampionshipDao";

export interface CupChampionshipRepository {
  save(championship: CupChampionship): Promise<void>;
  findById(id: string): Promise<CupChampionship | null>;
}

export class FileCupChampionshipRepository implements CupChampionshipRepository {
  private static readonly CUP_CHAMPIONSHIP_MOCK_DAO_LIST: CupChampionshipDao[] =
    [
      {
        id: "2026-world-cup",
        name: "Copa do Mundo FIFA 2026",
        startDate: "2026-06-28T19:00:00Z",
        hasThirdPlaceMatch: true,
        thirdPlace: null,
        root: {
          elem: null,
          children: [
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ];

  private readonly storage: JsonStorage;
  private readonly teamRepository: TeamRepository;

  constructor(storage: JsonStorage, teamRepository: TeamRepository) {
    this.storage = storage;
    this.teamRepository = teamRepository;
  }

  async save(championship: CupChampionship): Promise<void> {
    const dao = new CupChampionshipDaoBuilder().toDao(championship);
    await this.storage.save<CupChampionshipDao>(
      `/sweepstake/CupChampionship/${championship.getId()}`,
      dao,
    );
  }

  async findById(id: string): Promise<CupChampionship | null> {
    const dao =
      FileCupChampionshipRepository.CUP_CHAMPIONSHIP_MOCK_DAO_LIST.find(
        (d) => d.id === id,
      );
    if (!dao) {
      return null;
    }

    return new CupChampionshipDaoBuilder().toCupChampionship(
      dao,
      this.teamRepository,
    );
  }
}

const _1MonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;

export class MockCupChampionshipRepository implements CupChampionshipRepository {
  private static readonly CUP_CHAMPIONSHIP_MOCK_DAO_LIST: CupChampionshipDao[] =
    [
      {
        id: "test-status-draft",
        name: "Copa do Mundo FIFA 2026",
        startDate: new Date(Date.now() + _1MonthInMilliseconds).toISOString(),
        hasThirdPlaceMatch: true,
        thirdPlace: null,
        root: {
          elem: null,
          children: [
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: null,
                              children: [null, null],
                            },
                            {
                              elem: null,
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        id: "test-status-waiting",
        name: "Copa do Mundo FIFA 2026",
        startDate: new Date(Date.now() + _1MonthInMilliseconds).toISOString(),
        hasThirdPlaceMatch: true,
        thirdPlace: null,
        root: {
          elem: null,
          children: [
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "mexico",
                              children: [null, null],
                            },
                            {
                              elem: "south-korea",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "canada",
                              children: [null, null],
                            },
                            {
                              elem: "switzerland",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "brazil",
                              children: [null, null],
                            },
                            {
                              elem: "morocco",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "usa",
                              children: [null, null],
                            },
                            {
                              elem: "australia",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "germany",
                              children: [null, null],
                            },
                            {
                              elem: "ecuador",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "netherlands",
                              children: [null, null],
                            },
                            {
                              elem: "japan",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "belgium",
                              children: [null, null],
                            },
                            {
                              elem: "egypt",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "spain",
                              children: [null, null],
                            },
                            {
                              elem: "uruguay",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "south-africa",
                              children: [null, null],
                            },
                            {
                              elem: "czechia",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "qatar",
                              children: [null, null],
                            },
                            {
                              elem: "bosnia-herzegovina",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "scotland",
                              children: [null, null],
                            },
                            {
                              elem: "haiti",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "paraguay",
                              children: [null, null],
                            },
                            {
                              elem: "turkiye",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "ivory-coast",
                              children: [null, null],
                            },
                            {
                              elem: "curacao",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "tunisia",
                              children: [null, null],
                            },
                            {
                              elem: "sweden",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "iran",
                              children: [null, null],
                            },
                            {
                              elem: "new-zealand",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "saudi-arabia",
                              children: [null, null],
                            },
                            {
                              elem: "cape-verde",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        id: "test-status-running",
        name: "Copa do Mundo FIFA 2026",
        startDate: new Date(Date.now() - _1MonthInMilliseconds).toISOString(),
        hasThirdPlaceMatch: true,
        thirdPlace: null,
        root: {
          elem: null,
          children: [
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "mexico",
                              children: [null, null],
                            },
                            {
                              elem: "south-korea",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "canada",
                              children: [null, null],
                            },
                            {
                              elem: "switzerland",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "brazil",
                              children: [null, null],
                            },
                            {
                              elem: "morocco",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "usa",
                              children: [null, null],
                            },
                            {
                              elem: "australia",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "germany",
                              children: [null, null],
                            },
                            {
                              elem: "ecuador",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "netherlands",
                              children: [null, null],
                            },
                            {
                              elem: "japan",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "belgium",
                              children: [null, null],
                            },
                            {
                              elem: "egypt",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "spain",
                              children: [null, null],
                            },
                            {
                              elem: "uruguay",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              elem: null,
              children: [
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "south-africa",
                              children: [null, null],
                            },
                            {
                              elem: "czechia",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "qatar",
                              children: [null, null],
                            },
                            {
                              elem: "bosnia-herzegovina",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "scotland",
                              children: [null, null],
                            },
                            {
                              elem: "haiti",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "paraguay",
                              children: [null, null],
                            },
                            {
                              elem: "turkiye",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  elem: null,
                  children: [
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "ivory-coast",
                              children: [null, null],
                            },
                            {
                              elem: "curacao",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "tunisia",
                              children: [null, null],
                            },
                            {
                              elem: "sweden",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      elem: null,
                      children: [
                        {
                          elem: null,
                          children: [
                            {
                              elem: "iran",
                              children: [null, null],
                            },
                            {
                              elem: "new-zealand",
                              children: [null, null],
                            },
                          ],
                        },
                        {
                          elem: null,
                          children: [
                            {
                              elem: "saudi-arabia",
                              children: [null, null],
                            },
                            {
                              elem: "cape-verde",
                              children: [null, null],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ];

  private readonly teamRepository: TeamRepository;

  constructor(teamRepository?: TeamRepository) {
    this.teamRepository = teamRepository || new TeamRepository();
  }

  async save(_championship: CupChampionship): Promise<void> {
    // Mock save does nothing
  }

  async findById(id: string): Promise<CupChampionship | null> {
    const dao =
      MockCupChampionshipRepository.CUP_CHAMPIONSHIP_MOCK_DAO_LIST.find(
        (c) => c.id === id,
      );
    if (!dao) {
      return null;
    }
    return new CupChampionshipDaoBuilder().toCupChampionship(
      dao,
      this.teamRepository,
    );
  }
}
