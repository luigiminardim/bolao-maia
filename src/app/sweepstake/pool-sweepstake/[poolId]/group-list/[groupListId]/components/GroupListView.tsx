import React, { ReactNode } from "react";
import { Card } from "@heroui/react";
import { getTeamFlagSvgUrl } from "@/app/utils/getTeamFlagSvgUrl";

export const GroupListView = {
  Container: function Container({
    header,
    children,
  }: {
    header?: ReactNode;
    children: ReactNode;
  }) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
      </div>
    );
  },

  Group: function Group({
    groupName,
    topRightContent,
    children,
  }: {
    groupName: string;
    topRightContent?: ReactNode;
    children: ReactNode;
  }) {
    return (
      <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-950">
            <h4 className="font-extrabold text-sm text-zinc-300">
              {groupName}
            </h4>
            {topRightContent}
          </div>
          <div className="space-y-3">{children}</div>
        </div>
      </Card>
    );
  },

  Team: function Team({
    team,
    position,
    isQualified,
    TopRightComponent,
    BottomRightComponent,
  }: {
    team: { id: string; name: string };
    position: number;
    isQualified: boolean;
    TopRightComponent?: ReactNode;
    BottomRightComponent?: ReactNode;
  }) {
    const positionBadgeColor = isQualified
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
      : "bg-zinc-950/80 text-zinc-500 border border-zinc-900";

    return (
      <div className="flex flex-col gap-1 p-4 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-2xl group transition-all">
        {/* Row 1: Position + Flag + Team Name + TopRightComponent */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-xl ${positionBadgeColor}`}
            >
              {position}º
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getTeamFlagSvgUrl(team?.id || "tbd")}
              alt={team?.name || "TBD"}
              className="shrink-0 w-6 h-4 object-cover rounded-[2px] shadow-sm"
            />
            <span className="truncate font-bold text-sm text-zinc-200">
              {team.name}
            </span>
          </div>

          <div className="shrink-0">{TopRightComponent}</div>
        </div>

        {/* Row 2: Status Badge + BottomRightComponent */}
        <div className="flex items-center justify-between border-t border-dashed border-zinc-900/40 pt-1 mt-1">
          <div className="flex items-center">
            {isQualified ? (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Classificado
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800/50 text-zinc-500 border border-zinc-800">
                Eliminado
              </span>
            )}
          </div>

          {BottomRightComponent && (
            <div className="flex items-center gap-1">
              {BottomRightComponent}
            </div>
          )}
        </div>
      </div>
    );
  },
};
