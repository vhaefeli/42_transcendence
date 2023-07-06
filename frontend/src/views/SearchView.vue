<template>
  <NavBar/>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "@/stores/UserStore";
import axios from "axios";
import { ref } from "vue";
import { ModelListSelect } from "vue-search-select";
import "vue-search-select/dist/VueSearchSelect.css";

type type_user = {
  id: number;
  username: string;
};

const userList = ref<Array<type_user>>([]);
const selectedUser = ref<number>();

const sessionStore = useSessionStore();
const userStore = useUserStore();

loadUserList();

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

  await axios({
    url: "/api/user/friend/all",
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      users = users.filter(
        (user) => !response.data?.find((friend) => friend.id === user.id)
      );
    })
    .catch((error) => {
      console.error(
        `unexpected error: ${error.response.status} ${error.response.statusText}`
      );
      return;
    });
  userList.value = users.filter((user) => user.id != userStore.user.id);
}

async function validateSelection() {
  console.log(
    `selected: ${
      userList.value.find((element) => element.id === selectedUser.value)
        ?.username
    }`
  );
}
</script>
