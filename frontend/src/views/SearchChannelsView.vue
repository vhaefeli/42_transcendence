<template>
  <NavBar :showProfile="true" :userStore="userStore"></NavBar>
  <div class="ft-chat-container">
    <ChatNavBar :whichTab="'search'"></ChatNavBar>
    <section class="ft-chat-inside-container flex flex-col items-center w-full pt-10">
      <div class="flex flex-row w-full">
        <div class="w-1/3" />
        <div class="w-1/3">
          <h1 class="mx-2">Search channels</h1>
          <div id="SearchAllChannels" class="flex flex-row space-x-0.4 w-full">
            <ModelListSelect
              :list="all_channels"
              v-model="selectedChannel"
              optionValue="id"
              optionText="name"
              placeholder="Select channel"
              class="w-full"
            />
            <div :class="{ 'cursor-not-allowed': !selectedChannel }">
              <a class="t-btn-pink ft-enable" @click="validateSelection"
                 :class="{ 'opacity-50 ft-disabled-btn searchan-noClick': !selectedChannel }">
                <button>Join</button>
              </a>
            </div>
          </div>
        </div>
        <div class="w-1/3/>" />
      </div>
      <div class="flex flex-row w-full">
        <div class="w-1/12" />
        <div id="ChannelList" class="mt-10 grid grid-cols-3 w-5/6">
          <div
            v-for="(channel, index) in all_channels"
            :key="channel.id"
            class="my-2 mx-1"
            :class="{
              'col-start-2':
                all_channels.length % 3 == 1 && index == all_channels.length - 1,
            }"
          >
            <div
              class="rounded border-gray-600 border space-x-4 p-3 items-center flex flex-row w-full"
              :class="{
                'searchan-first-col':
                  index % 3 == 0 &&
                  !(
                    all_channels.length % 3 == 1 &&
                    index == all_channels.length - 1
                  ),
                'searchan-second-col':
                  index % 3 == 1 ||
                  (all_channels.length % 3 == 1 &&
                    index == all_channels.length - 1),
                'searchan-third-col': index % 3 == 2,
              }"
            >
              <img
                :src="getTypeIcon(channel)"
                alt="icon"
                class="max-w-4 max-h-4"
                id="icon"
              />
              <h3 class="text-xl font-sans truncate">{{ channel.name }}</h3>
            </div>
          </div>
        </div>
        <div class="w-1/12" />
      </div>
    </section>
  </div>
</template>

<style>
/* .searchan-first-col {
  background-color: var(--red);
}
.searchan-second-col {
  background-color: var(--purple);
}
.searchan-third-col {
  background-color: var(--green);
} */
.searchan-noClick {
  pointer-events: none;
}
.searchan-btn {
  @apply font-bold py-2 px-4 rounded;
}
.searchan-btn-blue {
  @apply bg-blue-500 text-white;
}
.searchan-btn-blue:hover {
  @apply bg-blue-700;
}
</style>

<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "@/stores/UserStore";
import ChatNavBar from "../components/ChatNavBar.vue";
import axios from "axios";
import { useRoute, useRouter } from 'vue-router'
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

const router = useRouter()

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
  router.push({ name: 'channels', query: { channelId: selectedChannel.value } })
}

function getTypeIcon(channel: type_channel): string {
  return `../../src/assets/icons/chan_${channel.type.toLowerCase()}.png`;
}

  async function loadMyself() {
    if (sessionStore.isLoggedIn) {
      // get user infos
      await userStore.getMe(sessionStore.access_token);
      if (userStore.user.isLogged === false) {
        sessionStore.isLoggedIn = false;
        sessionStore.access_token = "";
        router.push({ name: 'login' })
      }
    }
  }

  loadMyself()

</script>
