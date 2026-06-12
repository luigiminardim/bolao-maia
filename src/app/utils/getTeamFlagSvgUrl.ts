export function getTeamFlagSvgUrl(teamId: string): string {
  if (!teamId) return "/Team/flag/tbd.svg";
  return `/Team/flag/${teamId.toLowerCase()}.svg`;
}
