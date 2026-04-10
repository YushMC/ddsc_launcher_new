export const useModApiElectron = () => {
  const getAllMods = async () => {
    if (!window.api?.mods) {
      throw new Error("window.api.mods is not available");
    }
    return await window.api.mods.get.all();
  };

  const getModByID = async (id: number) => {
    if (!window.api?.mods) {
      throw new Error("window.api.mods is not available");
    }
    return await window.api.mods.get.id(id);
  };

  const registerMod = async (data: Partial<ModDBInterface>) => {
    if (!window.api?.mods) {
      throw new Error("window.api.mods is not available");
    }
    return await window.api.mods.register(data as ModDBInterface);
  };

  const updateMod = async (id: number, data: ModDBInterface) => {
    if (!window.api?.mods) {
      throw new Error("window.api.mods is not available");
    }
    return await window.api.mods.update(id, data);
  };

  return {
    getAllMods,
    getModByID,
    registerMod,
    updateMod,
  };
};
