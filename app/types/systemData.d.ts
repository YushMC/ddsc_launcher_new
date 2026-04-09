export const SYSTEMS_NAMES = {
  WINDOWS: "Windows",
  LINUX: "Linux",
  MACOS: "MacOS",
} as const;

export type SystemName = (typeof SYSTEMS_NAMES)[keyof typeof SYSTEMS_NAMES];
