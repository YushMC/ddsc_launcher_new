import { SYSTEMS_NAMES, type SystemName } from "~/types/systemData.d";

const SYSTEM_OS = ref<SystemName>(SYSTEMS_NAMES.WINDOWS);
const idUser = ref<number>(0);

const getSystemOS = () => SYSTEM_OS.value;

const getIdUser = () => idUser.value;
const setIdUser = (id: number) => {
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
  };
}
