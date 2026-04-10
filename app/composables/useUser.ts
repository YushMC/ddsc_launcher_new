
/* quotations data */
const getAllUsers = async () => await window.api.users.get.all();
const getUserByID = async (id: number) => await window.api.users.get.byID(id);

const registerUser = async (username: string) =>
  await window.api.users.register(username);

const updateUsername = async (user: UserInterface) =>
  await window.api.users.update.username(user);

export const useUserApiElectron = () => {
  return {
    getAllUsers,
    //getAllQuotations,
    registerUser,
    getUserByID,
    updateUsername,
  };
};
