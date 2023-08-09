<template>
  <NavBar :showProfile="true" :userStore="userStore"></NavBar>
  <div v-if="showJoinModal" id="ft-add-chan-modal" class="w-screen h-screen absolute bg-black/60 flex items-center justify-center">
    <div id="ft-add-chan-modal-inside" class="w-[30vw] p-6 relative">
      <button class="absolute top-0 right-0"><a class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor" @click="closeModal()"><img src="../assets/icons/xmark-solid.svg" alt="quit"></a></button>
      <p class="truncate text-xl">Join {{ channelToJoin?.name }}</p><br>
      <p v-if="joinTextError.length" class="mb-2">{{ joinTextError }}</p>
      <p class="">Channel type: {{ channelToJoin?.type }}</p>
      <div v-if="channelToJoin?.type === ChannelTypes.PROTECTED">
        <p class="text-sm mb-2">Please enter the password for the channel:</p>
        <input
          type="password"
          v-model="channel_password"
          placeholder="password"
          class="rounded-xl p-2 border-black mb-2"
        /><br />
      </div>
      <div v-else>
      </div>
      <div :class="{ 'cursor-not-allowed': !(channelToJoin?.type == ChannelTypes.PUBLIC || channel_password.length) }">
        <a class="t-btn-pink ft-enable" @click="joinChannel(channelToJoin?.id)"
           :class="{ 'opacity-50 ft-disabled-btn searchan-noClick': !(channelToJoin?.type == ChannelTypes.PUBLIC || channel_password.length) }">
          <button>{{ joinViewButtonText }}</button>
        </a>
      </div>
    </div>
  </div>
  <div class="ft-chat-container">
    <ChatNavBar :whichTab="'search'"></ChatNavBar>
    <section class="ft-chat-inside-container flex flex-col items-center w-full pt-10">
      <div class="flex flex-row w-full">
        <div class="w-1/3"></div>
        <div class="w-1/3">
          <h1 class="ft-text mx-2">Search channels</h1>
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
              <a class="t-btn-pink ft-enable" @click="viewOrJoinChannel(selectedChannel)"
                 :class="{ 'opacity-50 ft-disabled-btn searchan-noClick': !selectedChannel }">
                <button>{{ joinViewButtonText }}</button>
              </a>
            </div>
          </div>
        </div>
        <div class="w-1/3"></div>
      </div>
      <div class="flex flex-col w-full items-center">
        <div class="mt-10 ft-title flex flex-row w-full justify-center" id="channels-title">All channels</div>
        <div id="ChannelList" class="grid grid-cols-3 w-5/6">
          <div
            v-for="(channel, index) in all_channels"
            :key="channel.id"
            class="my-2 mx-1"
            id="channel"
            :class="{
              'col-start-2':
                all_channels.length % 3 == 1 && index == all_channels.length - 1,
            }"
          >
            <div
              class="ft-channels-list space-x-4 p-3 items-center flex flex-row w-full"
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
              :title="getTitleForChannel(channel.id)"
              @click="viewOrJoinChannel(channel.id)"
            >
            <!-- changer le click ci-dessus -->
              <img
                :src="getTypeIcon(channel)"
                alt="icon"
                class="max-w-4 max-h-4"
                id="icon"
              />
              <h3 class="ft-text truncate w-full">{{ channel.name }}</h3>
              <p v-if="isMemberInChannel(channel.id)" class="ft-channel-join-view">View</p>
              <p v-else class="ft-channel-join-view">Join</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.searchan-noClick {
  pointer-events: none;
}

.ft-title#channels-title {
  color: var(--dark-pink);
}

.ft-channels-list {
  background: var(--light-gray);
  border-radius: 0.8rem;
}

.ft-channels-list:hover {
  background: var(--dark-pink);
  mix-blend-mode: hard-light;
  cursor: pointer;
}

.ft-channel-join-view {
  visibility: hidden;
}

#channel:hover .ft-channel-join-view{
  visibility: visible;
}

#ft-add-chan-modal {
  z-index: 9999999;
}
#ft-add-chan-modal-inside {
  background: var(--middle-gray);
}
</style>

<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "@/stores/UserStore";
import ChatNavBar from "../components/ChatNavBar.vue";
import axios from "axios";
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from "vue";
import { ModelListSelect } from "vue-search-select";
import "vue-search-select/dist/VueSearchSelect.css";

enum ChannelTypes {
  PROTECTED = "PROTECTED",
  PUBLIC = "PUBLIC",
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
const joinViewButtonText = ref<string>("Join");
const showJoinModal = ref(false);
const channelToJoin = ref<type_channel>();
const channel_password = ref<string>("");
const joinTextError = ref<string>("");

const loadChannels = loadAllChannels();
filterChannels();

const getTitleForChannel = (channelId: number) => {
  return isMemberInChannel(channelId) ? 'View' : 'Join';
};

watch(selectedChannel, () => {
  if (selectedChannel.value && isMemberInChannel(selectedChannel.value))
    joinViewButtonText.value = "View";
  else joinViewButtonText.value = "Join";
});

function isMemberInChannel(channelId: number) {
  return (member_channels.value.find((chan) => chan.id === channelId) != null);
}

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

async function viewOrJoinChannel(channelId: number) {
  if (isMemberInChannel(channelId)) {
    router.push({ name: 'channels', query: { channelId: channelId } })
  } else {
    console.log('Join');
    channelToJoin.value = not_member_channels.value.find((chan) => chan.id === channelId);
    showJoinModal.value = true;
  }
}

async function joinChannel(channelId: number) {
  await axios({
    url: '/api/chat/channel/join',
    method: 'patch',
    headers: { Authorization: `Bearer ${sessionStore.access_token}`, 'Content-Type': 'application/json' },
    data: { channelId: channelId, password: channel_password.value },
  }).then(() => {
    closeModal();
    router.push({ name: 'channels', query: { channelId: channelId } });
  }).catch((error) => {
    const msg: string | undefined =
      typeof error.response?.data?.message === "string"
        ? error.response?.data?.message
        : error.response?.data?.message[0];
    joinTextError.value = msg || "";
    channel_password.value = "";
  });
}

function closeModal() {
  showJoinModal.value = false;
  channel_password.value = "";
  joinTextError.value = "";
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
