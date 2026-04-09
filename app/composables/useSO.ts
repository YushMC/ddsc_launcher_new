import { SYSTEMS_NAMES, type SystemName } from "~/types/systemData.d";

const SYSTEM_OS = ref<SystemName>(SYSTEMS_NAMES.WINDOWS);

const getSystemOS = () => SYSTEM_OS.value;

const setSystemOS = (os: SystemName) => {
  SYSTEM_OS.value = os;
};

export function useSO() {
  return {
    getSystemOS,
    setSystemOS,
  };
}
