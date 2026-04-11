interface Window {
  api: {
    files: FilesApi;
    users: UsersApi;
    mods: ModsApi;
    statistics: StatisticsApi;
  };
}

interface FilesApi {
  check: (path: string) => Promise<ApiResponseDB<boolean>>;
  joinPaths: (...paths: string[]) => Promise<string>;
  copy: {
    file: (source: string, destination: string) => Promise<ApiResponseDB>;
    internal: {
      file: (source: string, destination: string) => Promise<ApiResponseDB>;
      directory: (
        source: string,
        destination: string,
      ) => Promise<ApiResponseDB>;
      toInternal: (
        source: string,
        destination: string,
      ) => Promise<ApiResponseDB>;
    };
    directory: (source: string, destination: string) => Promise<ApiResponseDB>;
  };
  create: {
    directory: (path: string) => Promise<ApiResponseDB>;
  };
  unzip: {
    file: (source: string, destination: string) => Promise<ApiResponseDB>;
  };
  run: {
    macos: (filePath: string) => Promise<ApiResponseDB>;
    windows: (filePath: string) => Promise<ApiResponseDB>;
    linux: (filePath: string) => Promise<ApiResponseDB>;
  };
  select: {
    zipFile: () => Promise<string | undefined>;
    zipFiles: () => Promise<string[]>;
    folder: () => Promise<string | undefined>;
    zipOrFolder: () => Promise<string | undefined>;
  };
}

interface UsersApi {
  get: {
    byID: (id: number) => Promise<ApiResponseDB<UserInterface>>;
    all: () => Promise<ApiResponseDB<UserInterface[]>>;
  };
  register: (username: string) => Promise<ApiResponseDB<{ exist: boolean }>>;

  update: {
    username: (data: UserInterface) => Promise<ApiResponseDB>;
  };
}

interface ModsApi {
  register: (data: ModDBInterface) => Promise<ApiResponseDB>;
  get: {
    all: () => Promise<ApiResponseDB<ModDBInterface[]>>;
    id: (id: number) => Promise<ApiResponseDB<ModDBInterface>>;
  };
  update: (id: number, data: Partial<ModDBInterface>) => Promise<ApiResponseDB>;
  delete: (id: number) => Promise<ApiResponseDB>;
}

interface StatisticsApi {
  get: {
    byID: (id: number) => Promise<ApiResponseDB<StatisticsInterface>>;
  };
  register: (data: StatisticsInterface) => Promise<ApiResponseDB>;
  update: {
    total_played_by_id: (
      id: number,
      total_played: number,
    ) => Promise<ApiResponseDB>;
    last_played_at_by_id: (
      id: number,
      last_played_at: string,
    ) => Promise<ApiResponseDB>;
  };
}
