const ENDPOINTS = {
    api: "api",
    users: {
        get: {
            byID: "settings/data/id",
            all: "settings/data/all",
        },
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
    files: {
        check: "files/check",
        joinPaths: "files/join-paths",
        copy: {
            file: "files/copy/file",
            directory: "files/copy/directory",
            internal: {
                file: "files/copy/internal/file",
                directory: "files/copy/internal/directory",
                toInternal: "files/copy/internal/to-internal",
            },
        },
        create: {
            directory: "files/create/directory",
        },
        select: {
            zipFile: "files/select/zip-file",
            zipFiles: "files/select/zip-files",
            folder: "files/select/folder",
            zipOrFolder: "files/select/zip-or-folder",
        },
        unzip: {
            file: "files/unzip/file",
        },
        run: {
            macos: "files/run/macos",
            windows: "files/run/windows",
            linux: "files/run/linux",
        },
    },
};
export default ENDPOINTS;
