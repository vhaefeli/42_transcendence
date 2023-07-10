<template>
  <NavBar />
  <div id="SearchAllChannels" class="flex">
    <h1>Search channels</h1>
    <ModelListSelect
      :list="all_channels"
      v-model="selectedChannel"
      optionValue="id"
      optionText="name"
      placeholder="Select channel"
      class="flex-none"
    >
    </ModelListSelect>
    <br />
    <button
      v-if="selectedChannel"
      @click="validateSelection"
      class="btn btn-blue"
    >
      Add
    </button>
  </div>
  <div id="NotMemberChannels">
    <div v-for="channel in not_member_channels" :key="channel.id">
      <div class="flex w-2/3 h-2/3">
        <img :src="getTypeIcon(channel)" alt="icon" class="w-1/10 h-1/10" id="icon"/>
        <p class="col-span-1">{{ channel.name }}</p>
      </div>
    </div>
  </div>
</template>

<style>
#SearchAllChannels {
  max-width: 50%;
}
.btn {
  @apply font-bold py-2 px-4 rounded;
}
.btn-blue {
  @apply bg-blue-500 text-white;
}
.btn-blue:hover {
  @apply bg-blue-700;
}
</style>

<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "@/stores/UserStore";
import axios from "axios";
import { ref } from "vue";
import { ModelListSelect } from "vue-search-select";
import "vue-search-select/dist/VueSearchSelect.css";

enum ChannelTypes {
  PROTECTED = "PROTECTED",
  PUBLIC = "OFFLINE",
  PRIVATE = "PRIVATE",
}

type type_channel = {
  id: number;
  name: string;
  type: ChannelTypes;
  owner: boolean;
  admin: boolean;
  member: boolean;
};

const sessionStore = useSessionStore();
const userStore = useUserStore();

const member_channels = ref(new Array<type_channel>());
const not_member_channels = ref(new Array<type_channel>());
const all_channels = ref(new Array<type_channel>());

const selectedChannel = ref<number>();

const loadChannels = loadAllChannels();
filterChannels();

async function loadAllChannels(): Promise<void> {
  await axios({
    url: "/api/chat/channel/all",
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      all_channels.value = response.data;
    })
    .catch((error) => {
      console.error(
        `unexpected error: ${error.response.status} ${error.response.statusText}`
      );
      return;
    });
}

async function filterChannels(): Promise<void> {
  await loadChannels;
  all_channels.value.forEach((channel) => {
    if (channel.admin || channel.owner || channel.member)
      member_channels.value.push(channel);
    else not_member_channels.value.push(channel);
  });
}

async function validateSelection() {
  console.log(
    `selected: ${
      all_channels.value.find((element) => element.id === selectedChannel.value)
        ?.name
    }`
  );
}

function getTypeIcon(channel: type_channel): string {
  return `../../src/assets/icons/chan_${channel.type.toLowerCase()}.png`;
}
</script>
