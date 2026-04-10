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

  const registerMod = async (data: ModInterface) => {
    if (!window.api?.mods) {
      throw new Error("window.api.mods is not available");
    }
    return await window.api.mods.register(data);
  };

  const updateMod = async (data: ModInterface) => {
    if (!window.api?.mods) {
      throw new Error("window.api.mods is not available");
    }
    return await window.api.mods.update(data);
  };

  return {
    getAllMods,
    getModByID,
    registerMod,
    updateMod,
  };
};
