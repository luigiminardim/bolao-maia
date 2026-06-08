export function getTeamFlagSvgUrl(teamId: string): string {
  if (!teamId) return "";
  return `/Team/flag/${teamId.toLowerCase()}.svg`;
}
