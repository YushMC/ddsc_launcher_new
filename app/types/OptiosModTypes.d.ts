const ENUMS_DURATION = {
  veryshort: {
    label: "Muy corto",
    value: "very_short",
  },
  short: {
    label: "Corto",
    value: "short",
  },
  medium: {
    label: "Medio",
    value: "medium",
  },
  long: {
    label: "Largo",
    value: "long",
  },
  veryLong: {
    label: "Muy largo",
    value: "very_long",
  },
  endless: {
    label: "Interminable",
    value: "endless",
  },
  unknown: {
    label: "Desconocido",
    value: "unknown",
  },
} as const;

const ENUMNS_TYPE_IMAGE = {
  portada: "main",
  logo: "logo",
  screenshot: "screenshot",
} as const;

const ENUMS_TYPE = {
  translation: {
    label: "Traducción",
    value: "translation",
  },
  original: {
    label: "Original",
    value: "original",
  },
} as const;

const ENUMS_STATUS = {
  underDevelopment: {
    label: "En desarrollo",
    value: "under_development",
  },
  demo: {
    label: "Demo",
    value: "beta",
  },
  stable: {
    label: "Terminado",
    value: "stable",
  },
  legacy: {
    label: "Legado",
    value: "legacy",
  },
  abandoned: {
    label: "Abandonado",
    value: "abandoned",
  },
  onIce: {
    label: "En pausa",
    value: "on_ice",
  },
  archived: {
    label: "Archivado",
    value: "archived",
  },
  unknown: {
    label: "Desconocido",
    value: "unknown",
  },
} as const;

const ENUMS_CHARACTER_FOCUS = {
  mc: { label: "MC", value: "mc" },
  sayori: { label: "Sayori", value: "sayori" },
  natsuki: { label: "Natsuki", value: "natsuki" },
  yuri: { label: "Yuri", value: "yuri" },
  monika: { label: "Monika", value: "monika" },
  oc: { label: "OC", value: "oc" },
} as const;

type DurationType = (typeof ENUMS_DURATION)[keyof typeof ENUMS_DURATION];

type ModType = (typeof ENUMS_TYPE)[keyof typeof ENUMS_TYPE];

type StatusType = (typeof ENUMS_STATUS)[keyof typeof ENUMS_STATUS];

type CharacterFocusType =
  (typeof ENUMS_CHARACTER_FOCUS)[keyof typeof ENUMS_CHARACTER_FOCUS];

type TypeImage = (typeof ENUMNS_TYPE_IMAGE)[keyof typeof ENUMNS_TYPE_IMAGE];

interface GenderMods {
  id: number;
  name: string;
  identifier: string;
}

interface GendersModsResponse {
  resource: GenderMods;
  info: InfoInterface;
}

interface GenderForOptions {
  label: string;
  value: string;
}

interface stringsOptionsAll {
  generes: GenderForOptions[];
  types: ModType[];
  focus: CharacterFocusType[];
  durations: DurationType[];
  status: StatusType[];
}

const ENUMS_DURATION_ONLY_VALUE = {
  veryshort: "very_short",
  short: "short",
  medium: "medium",
  long: "long",
  veryLong: "very_long",
  endless: "endless",
  unknown: "unknown",
} as const;

const ENUMNS_TYPE_IMAGE = {
  portada: "main",
  logo: "logo",
  screenshot: "screenshot",
} as const;

const ENUMS_TYPE_ONLY_VALUE = {
  translation: "translation",
  original: "original",
} as const;

const ENUMS_STATUS_ONLY_VALUE = {
  underDevelopment: "under_development",
  demo: "beta",
  stable: "stable",
  legacy: "legacy",
  abandoned: "abandoned",
  onIce: "on_ice",
  archived: "archived",
  unknown: "unknown",
} as const;

const ENUMS_CHARACTER_FOCUS_ONLY_VALUE = {
  mc: "mc",
  sayori: "sayori",
  natsuki: "natsuki",
  yuri: "yuri",
  monika: "monika",
  oc: "oc",
} as const;

type DurationTypeOnlyValue =
  (typeof ENUMS_DURATION_ONLY_VALUE)[keyof typeof ENUMS_DURATION_ONLY_VALUE];

type ModTypeOnlyValue =
  (typeof ENUMS_TYPE_ONLY_VALUE)[keyof typeof ENUMS_TYPE_ONLY_VALUE];

type StatusTypeOnlyValue =
  (typeof ENUMS_STATUS_ONLY_VALUE)[keyof typeof ENUMS_STATUS_ONLY_VALUE];

type CharacterFocusTypeOnlyValue =
  (typeof ENUMS_CHARACTER_FOCUS_ONLY_VALUE)[keyof typeof ENUMS_CHARACTER_FOCUS_ONLY_VALUE];
