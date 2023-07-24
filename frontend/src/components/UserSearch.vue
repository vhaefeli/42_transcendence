<template>
      <h1>Search users</h1>
      <ModelListSelect
        :list="userList"
        v-model="selectedUser"
        optionValue="id"
        optionText="username"
        placeholder="Select user"
      >
      </ModelListSelect>
      <button v-if="selectedUser" @click="validateSelection">Add</button>
</template>
  
<script setup lang="ts">
  import axios from "axios";
  import { ref, watch } from "vue";
  import { ModelListSelect } from "vue-search-select";
  import "vue-search-select/dist/VueSearchSelect.css";
  
  type type_user = {
    id: number;
    username: string;
  };

  const emits = defineEmits(['addRecipient'])

  const props = defineProps({
    recipients: Array<number>,
    userStore: Object,
  })
  
  const userList = ref<Array<type_user>>([]);
  const selectedUser = ref<number>();
  
  
  async function loadUserList() {
    let users = new Array<type_user>();
  
    await axios({
      url: "/api/user/all",
      method: "get",
    })
      .then((response) => {
        users = response.data;
      })
      .catch((error) => {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
        return;
      });
      userList.value = users.filter((user) => user.id != props.userStore.user.id);
      userList.value = userList.value.filter((user) => {
        return !props.recipients.find((recipient) => recipient === user.id);
      });
  }
  loadUserList();

  watch(props.recipients, () => {
    loadUserList()
  })
  
  async function validateSelection() {
    emits('addRecipient', userList.value.find((element) => element.id === selectedUser.value)
          ?.username)
  }
</script>
  
