<template>
  <div
    class="flex w-full h-full items-center gap-5 p-1 justify-center flex-col"
  >
    <h1 class="text-2xl font-bold">¿Quíen Jugará Hoy?</h1>
    <div
      class="w-fit h-fit p-0 m-0 flex max-w-[90%] max-h-[90%] items-center gap-5 justify-center flex-wrap"
    >
      <UTooltip
        v-for="(value, index) in profiles"
        :key="index"
        :text="value.username"
      >
        <UAvatar
          class="object-cover cursor-pointer rounded-md"
          size="3xl"
          :alt="value.username"
          @click="goToHome(value.id)"
        />
      </UTooltip>
      <UModal title="Crear Nuevo Perfil">
        <UTooltip text="Nuevo Perfil">
          <UAvatar
            alt="+"
            size="3xl"
            class="object-cover cursor-pointer rounded-md"
          />
        </UTooltip>
        <template #body>
          <div class="flex flex-col gap-4">
            <UFormField label="Nombre de Usuario">
              <UInput
                v-model="newProfileName"
                placeholder="Nombre de Usuario"
                class="rounded-md w-full"
              />
            </UFormField>

            <UButton
              variant="soft"
              icon="i-lucide-user-plus"
              @click="handleRegisterUser"
            >
              Crear Perfil</UButton
            >
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast();
const { setIdUser } = useSO();
const { getAllUsers, registerUser } = useUserApiElectron();

definePageMeta({
  layout: "profile",
});
const newProfileName = ref("");

const goToHome = (id: number) => {
  setIdUser(id);
  navigateTo("/home");
};

const profiles = ref<{ username: string; id: number }[]>([]);

const handleRegisterUser = async () => {
  try {
    const response = await registerUser(newProfileName.value);
    if (response.success && response.data) {
      toast.add({
        title: "Usuario registrado",
        description: `El usuario ${newProfileName.value} ha sido registrado exitosamente.`,
        color: "success",
      });
    } else {
      toast.add({
        title: "Error al registrar el usuario",
        description: String(response.message),
        color: "error",
      });
    }
  } catch (error) {
    toast.add({
      title: "Error al registrar el usuario",
      description: `Error: ${String(error)}`,
      color: "error",
    });
  } finally {
    newProfileName.value = "";
  }
};

onMounted(async () => {
  try {
    const response = await getAllUsers();
    if (response.success && response.data) {
      profiles.value = response.data.map((user) => ({
        username: user.username,
        id: user.id,
      }));
    } else {
      console.error("Error al obtener los usuarios:", response.message);
    }
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
  }
});
</script>

<style scoped></style>
