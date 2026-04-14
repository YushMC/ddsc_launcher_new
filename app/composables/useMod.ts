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

  const getModByIdApi = async (id: number) => {
    try {
      const response = await $fetch<{
        data: ModResponseInterface;
        message: string;
      }>(`https://api-new.dokidokispanish.club/mod/${id}`);
      if (response.data) {
        return {
          sucess: true,
          data: response.data.resource,
          message: response.message,
        };
      }
    } catch (error) {
      return {
        sucess: false,
        data: null,
        message:
          (error as Error).message ||
          "An error occurred while fetching the mod.",
      };
    }
  };

  return {
    getAllMods,
    getModByID,
    registerMod,
    updateMod,
    getModByIdApi,
  };
};
