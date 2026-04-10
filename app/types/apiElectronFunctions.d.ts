interface Window {
  api: {
    files: FilesApi;
    users: UsersApi;
  };
}

interface FilesApi {
  check: (path: string) => Promise<ApiResponseDB<boolean>>;
  joinPaths: (...paths: string[]) => Promise<string>;
  copy: {
    file: (source: string, destination: string) => Promise<ApiResponseDB>;
    internal: (source: string, destination: string) => Promise<ApiResponseDB>;
    internalDirectory: (source: string, destination: string) => Promise<ApiResponseDB>;
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
