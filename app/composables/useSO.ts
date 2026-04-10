import { type SystemName } from "~/types/systemData.d";

const SYSTEM_OS = ref<SystemName | null>(null);
const idUser = ref<number | null>(null);
const directoryName = ref<string | null>(null);

const getSystemOS = () => SYSTEM_OS.value;
const getDirectoryName = () => directoryName.value;
const getIdUser = () => idUser.value;

const setIdUser = (id: number) => {
  idUser.value = id;
};
const setDirectoryName = (name: string) => {
  directoryName.value = name;
};
const setSystemOS = (os: SystemName) => {
  SYSTEM_OS.value = os;
};

export function useSO() {
  return {
    getSystemOS,
    setSystemOS,
    getIdUser,
    setIdUser,
    getDirectoryName,
    setDirectoryName,
  };
}
