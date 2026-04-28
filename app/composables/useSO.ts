import { type SystemName } from "~/types/systemData.d";

const SYSTEM_OS = ref<SystemName | null>(null);
const idUser = ref<number | null>(null);

const getSystemOS = () => SYSTEM_OS.value;
const getDirectoryName = () => ref("ddsc_launcher_user_data");
const getIdUser = () => idUser.value;

const setIdUser = (id: number | null) => {
  idUser.value = id;
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
  };
}
