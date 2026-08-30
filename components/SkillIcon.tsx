"use client";

import {
  IconActivity,
  IconAdjustments,
  IconArrowBackUp,
  IconArrowsRightLeft,
  IconArrowsShuffle,
  IconBatteryCharging,
  IconBolt,
  IconEar,
  IconEye,
  IconEyeSearch,
  IconFocus2,
  IconMapPin,
  IconMessage2,
  IconRefresh,
  IconRoute,
  IconRun,
  IconShieldCheck,
  IconTarget,
  IconUsers,
  IconUsersGroup,
  IconYoga,
  IconBallFootball,
  type Icon,
} from "@tabler/icons-react";

/**
 * The workbook names an icon per sub-skill. This map is written out explicitly
 * rather than resolved dynamically so the bundler can tree-shake to just these
 * 21 - a dynamic lookup would pull in the entire Tabler set.
 */
const ICONS: Record<string, Icon> = {
  "arrow-back-up": IconArrowBackUp,
  "arrows-right-left": IconArrowsRightLeft,
  run: IconRun,
  eye: IconEye,
  target: IconTarget,
  "map-pin": IconMapPin,
  "eye-search": IconEyeSearch,
  route: IconRoute,
  users: IconUsers,
  "arrows-shuffle": IconArrowsShuffle,
  yoga: IconYoga,
  adjustments: IconAdjustments,
  activity: IconActivity,
  bolt: IconBolt,
  "battery-charging": IconBatteryCharging,
  "shield-check": IconShieldCheck,
  refresh: IconRefresh,
  "focus-2": IconFocus2,
  "message-2": IconMessage2,
  "users-group": IconUsersGroup,
  ear: IconEar,
};

export function SkillIcon({
  name,
  size = 22,
  stroke = 2,
  className,
}: {
  name: string;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  // An unrecognised name means new content arrived with an icon we do not bundle;
  // fall back rather than render a hole.
  const Cmp = ICONS[name] ?? IconBallFootball;
  return <Cmp size={size} stroke={stroke} className={className} aria-hidden="true" />;
}

export const KNOWN_ICON_NAMES = Object.keys(ICONS);
