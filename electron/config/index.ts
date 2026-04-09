const ENDPOINTS = {
  api: "api",
  settings: {
    getData: "settings/data/id",
    register: "settings/register",

    update: {
      username: "settings/update/username",
      developer_mode: "settings/update/developer_mode",
    },
  },
  mods: {
    register: "mods/insert",
    get: {
      all: "mods/get/all",
      id: "mods/get/id",
    },
    update: "mods/set/id",
    delete: "mods/delete/id",
  },
  statistics: {
    get: {
      id: "statistics/get/id",
    },
    register: "statistics/register",
    update: {
      total_played_by_id: "statistics/update/total_played/id",
      last_played_at_by_id: "statistics/update/last_played_at/id",
    },
  },
} as const;

export default ENDPOINTS;
