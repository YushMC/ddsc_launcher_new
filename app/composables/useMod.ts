/* quotations data */
const getAllMods = async () => await window.api.mods.get.all();
const getModByID = async (id: number) => await window.api.mods.get.id(id);

const registerMod = async (data: Partial<ModDBInterface>) =>
  await window.api.mods.register(data as ModDBInterface);

const updateMod = async (id: number, data: Partial<ModDBInterface>) =>
  await window.api.mods.update(id, data);

export const useModApiElectron = () => {
  return {
    getAllMods,
    getModByID,
    registerMod,
    updateMod,
  };
};
