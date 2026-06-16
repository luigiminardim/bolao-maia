import { ReactNode } from "react";
import { GroupListGuessDto } from "@/usecase/dto/GuessDto";
import { GroupListView } from "./GroupListView";

interface GroupListGuessSectionProps {
  guess: GroupListGuessDto;
  header?: ReactNode;
}

export function GroupListGuessSection({
  guess,
  header,
}: GroupListGuessSectionProps) {
  return (
    <GroupListView.Container header={header}>
      {guess.groupGuesses.map((groupGuess, groupIdx) => (
        <GroupListView.Group
          key={groupIdx}
          groupName={`Grupo ${groupGuess.id}`}
        >
          {groupGuess.classification.map((teamGuess, index) => (
            <GroupListView.Team
              key={index}
              team={teamGuess.team}
              position={teamGuess.guessPosition}
              isQualified={teamGuess.guessQualified}
            />
          ))}
        </GroupListView.Group>
      ))}
    </GroupListView.Container>
  );
}
