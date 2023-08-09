<template>
  <NavBar :showProfile="true" :userStore="userStore"></NavBar>

  <!-- Modal to create a new channel -->
  <div
    v-if="showAddChanModal"
    id="ft-add-chan-modal"
    class="w-screen h-screen absolute bg-black/60 flex items-center justify-center"
  >
    <div id="ft-add-chan-modal-inside" class="w-[50vw] p-6 relative">
      <button class="absolute top-0 right-0">
        <a
          class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor"
          @click="toggleModal()"
          ><img src="../assets/icons/xmark-solid.svg" alt="quit"
        /></a>
      </button>
      <AddChannelModal
        :sessionStore="sessionStore"
        @addToMyChannels="addToMyChannels"
      />
    </div>
  </div>

  <!-- Modal to quit a channel channel -->
  <div
    v-if="showQuitChanModal != null"
    id="ft-add-chan-modal"
    class="w-screen h-screen absolute bg-black/60 flex items-center justify-center"
  >
    <div id="ft-add-chan-modal-inside" class="w-[50vw] p-6 relative">
      <button class="absolute top-0 right-0">
        <a
          class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor"
          @click="showQuitChanModal = null"
          ><img src="../assets/icons/xmark-solid.svg" alt="quit"
        /></a>
      </button>
      <QuitChanModal
        :sessionStore="sessionStore"
        :userStore="userStore"
        :chanToQuit="showQuitChanModal"
        @removeChan="removeChannel"
      />
    </div>
  </div>
  <div class="ft-chat-container">
    <ChatNavBar :whichTab="'channels'"></ChatNavBar>
    <section class="ft-chat-inside-container flex p-6">
      <!-- column 1 with profile -->
      <div id="dm-profile-col" class="w-[18em]">
        <div
          class="h-[76vh]"
          :class="
            currentProfileToShow.username.length === 0
              ? 'position-cible'
              : 'position-origine'
          "
        >
          <MemberList
            :key="showAdmin"
            :channelName="currentChannel?.name"
            :username="user.username"
            :channelType="currentChannel?.type"
            :isAdmin="currentChannel?.Admin != null"
            :MemberList="currentMembers"
            :userStore="userStore"
            :sessionStore="sessionStore"
            @set-profile-to-show="
              (username) => (currentProfileToShow.username = username)
            "
            :showAdmin="showAdmin ? 'close admin panel' : 'Admin panel'"
            @show-admin-panel="showAdmin = !showAdmin"
          />
        </div>
        <div
          class="h-[76vh]"
          :class="
            currentProfileToShow.username.length > 0
              ? 'position-cible'
              : 'position-origine'
          "
        >
        <OtherUserProfile
        :key="currentProfileToShow.username"
        :username="currentProfileToShow.username"
            :currentProfile="currentProfileToShow"
            :currentChannel="currentChannel"
            :userStore="userStore"
            :sessionStore="sessionStore"
            @adminAction="manageAdminAction"
            />
          <button
            title="Back to member list"
            id="ft-back-to-list"
            class="t-btn-pink ft-bg-color-chat"
            @click="currentProfileToShow.username = ''"
          >
            &lt;&lt;&lt;&lt;&lt;
          </button>
        </div>
      </div>

      <!-- column 2 with messages -->
      <div v-if="currentChannel?.Admin && showAdmin" class="flex grow">
        <!-- admin panel -->
        <div id="ft-admin-panel" class="w-full h-full relative p-11">
          <button class="absolute top-0 right-0">
            <a
              class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor"
              @click="showAdmin = false"
              ><img src="../assets/icons/xmark-solid.svg" alt="quit"
            /></a>
          </button>
          <AdminPanel
            :currentChannel="currentChannel"
            :sessionStore="sessionStore"
            @updateTypeOfChan="(type) => (currentChannel.type = type)"
            @adminAction="manageAdminActionFromPanel"
          ></AdminPanel>
        </div>
      </div>
      <div v-else class="flex grow">
        <div id="dm-msg-col" class="grow relative">
          <div
            id="ft-scroller"
            ref="scroller"
            class="ft-chat-box p-6 overflow-scroll"
          >
            <div v-for="message in messages" :key="message.id">
              <div v-if="currentChannel?.channelId === message.channelId">
                <div v-if="message.senderId === user.id" class="grid">
                  <div class="ft-msg-container justify-self-end">
                    <p class="text-xs ft-chat-date">{{ message.date }}</p>
                    <p class="ft-chat-my-msg">{{ message.message }}</p>
                  </div>
                </div>
                <div v-else>
                  <div class="ft-msg-container">
                    <div class="flex items-center">
                      <div
                        v-if="isCurrentMembersLoaded && isAllBannedLoaded"
                        class="ft-profile-pic ft-profile-pic-small mr-3 ft-chat-profile-pic"
                        :style="{
                          background: 'url(' + message.avatar_url + ')',
                        }"
                      ></div>
                      <div class="mb-3">
                        <a
                          v-if="isCurrentMembersLoaded && isAllBannedLoaded"
                          class="cursor-pointer"
                          @click="
                            currentProfileToShow.username = message.username
                          "
                          >{{ message.username }}</a
                        >
                        <p class="text-xs ft-chat-date">{{ message.date }}</p>
                        <div
                          class="ft-banned-user-text"
                          v-if="checkIfBanned(message.senderId)"
                        >
                          This user is banned!
                        </div>
                      </div>
                    </div>
                    <div class="ml-[3.8rem]">
                      <div
                        v-if="checkIfBlocked(message.senderId)"
                        class="opacity-50 flex"
                      >
                        <img
                          class="w-9 h-9 mr-3"
                          src="../assets/icons/person-circle-minus-solid.svg"
                          alt="block them"
                        />
                        You blocked this user.<br />
                        Unblock he/her to see this message
                      </div>
                      <div v-else>
                        <p class="text-base mb-1 ft-chat-recipient-msg">
                          {{ message.message }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="ft-bg-dark-gray flex p-2 pl-8 absolute w-full bottom-0">
            <input
              v-model="message"
              @keyup.enter="handleSubmitNewMessage"
              placeholder="blabla..."
              class="p-1 mr-4 ft-input"
            />
            <a
              href="#"
              class="t-btn-pink ft-bg-color-chat"
              :class="message.length === 0 ? 'ft-disabled-btn' : ''"
              ><button @click="handleSubmitNewMessage">send</button></a
            >
          </div>
        </div>

        <!-- column 3 with list of recipients -->
        <div id="dm-recipientList-col" class="w-[16rem] relative">
          <div class="mb-6 max-h-[54vh] overflow-scroll">
            <div class="p-3">
              <button @click="toggleModal()">+ add channel</button>
            </div>
            <div v-if="isAllMyChanLoaded">
              <div v-if="myChannels.length === 0">No channels yet</div>
              <div v-for="channel in myChannels" :key="channel">
                <div
                  :class="currentChannelClasses(channel)"
                  class="ft-channel-name flex justify-between"
                >
                  <div @click="changeCurrentChannel(channel.name)" class="grow">
                    {{ channel.name }}
                  </div>
                  <a
                    title="quit channel"
                    href="#"
                    class="ft-quit-channel hidden"
                    @click="showQuitChanModal = channel"
                    >x</a
                  >
                </div>
              </div>
            </div>
            <div v-else>Loading...</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import ChatNavBar from "../components/ChatNavBar.vue";
import OtherUserProfile from "../components/OtherUserProfile.vue";
import {
  ref,
  onUpdated,
  watchEffect,
  watch,
  computed,
  onBeforeUnmount,
} from "vue";
import { storeToRefs } from "pinia";
import axios from "axios";
import { useRouter, useRoute, LocationQuery } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "../stores/UserStore";
import { chatService } from "@/services/chat-socket.service";
import UserSearch from "@/components/UserSearch.vue";
import MemberList from "@/components/MemberList.vue";
import AdminPanel from "@/components/AdminPanel.vue";
import AddChannelModal from "@/components/AddChannelModal.vue";
import QuitChanModal from "@/components/QuitChanModal.vue";

// ********************************** ROUTES & STORES

const route = useRoute();

// routes
const router = useRouter();

// we need sessionStore and userStore
const sessionStore = useSessionStore();
const userStore = useUserStore();

const { user } = storeToRefs(userStore);

chatService.connect();

// ********************************** TYPES

type MyChannel = {
    channelId: number,
    userId: number,
    name: string,
    type: string,
    Admin: null | string,
    ownerId: number
  }

type Channel = {
  id: number;
  name: string;
  type: string;
  owner: boolean;
  admin: boolean;
  member: boolean;
};

type Message = {
  id: number;
  channelId: number;
  senderId: number;
  date: string;
  message: string;
  avatar_url: string;
  username: string;
};

type CurrentProfile = {
  username: string;
  isMuted: boolean;
  isBanned: boolean;
};

type UserInList = {
  id: number;
  username: string;
  avatar_url: string;
};

// ********************************** REFS

const message = ref("");
const messages = ref<Array<Message>>([]);
const scroller = ref(null);

const myChannels = ref<Array<MyChannel>>([]);
const allChannels = ref<Array<Channel>>([]);

const currentProfileToShow = ref<CurrentProfile>({
  username: "",
  isMuted: false,
  isBanned: false,
});

const showAdmin = ref(false);
const showAddChanModal = ref(false);
const showQuitChanModal = ref<object | null>(null);

// Current
const currentMembers = ref([]);
const currentChannel = ref<MyChannel | null>(null);

// arrays of users
const mutedUsers = ref<Array<UserInList>>([]);
const bannedUsers = ref<Array<UserInList>>([]);
const allUsers = ref([]);

// Reactive flag for loaded data
const isAllMyChanLoaded = ref(false);
const isAllChanLoaded = ref(false);
const isCurrentMembersLoaded = ref(false);
const isBlockedLoaded = ref(false);
const isAllBannedLoaded = ref<boolean>(false);
const isAllMutedLoaded = ref<boolean>(false);
const isAllUsersLoaded = ref(false);

let dateOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZone: "Europe/Zurich",
  hour12: false,
};

function toggleModal() {
  showAddChanModal.value = !showAddChanModal.value;
}

function addToMyChannels(chanInfos: MyChannel) {
  myChannels.value.push({
    channelId: chanInfos.channelId,
    userId: user.value.id,
    ownerId: user.value.id,
    name: chanInfos.channelName,
    type: chanInfos.channelType,
    Admin: "Admin",
  })
  currentChannel.value = myChannels.value[myChannels.value.length - 1]
}

async function removeChannel(chanId: number) {
  currentChannel.value = null
  showQuitChanModal.value = null
  currentProfileToShow.value = {
    username: "",
    isMuted: false,
    isBanned: false,
  }
  await axios({
    url: '/api/chat/channel/member/remove',
    method: "patch",
    headers: { 
      'Authorization': `Bearer ${sessionStore?.access_token}`
    },
    data: { "channelId": chanId, "userId": userStore?.user.id }
  })
    .then((response) => {
      console.log(`You have quit the channel with id ${chanId}`);
      myChannels.value = myChannels.value.filter(
        (channel) => channel.channelId !== chanId
      )
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
        // LogOut();
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
    if (myChannels.value.length > 0) {
      currentChannel.value = myChannels.value[0];
    } else {
      currentChannel.value = null
    }
}

onUpdated(() => {
  // when the DOM is updated I scroll to
  // bottom of the Div that contains messages
  scrollToBottom();
});

// when there is socket going on
chatService.onConnect(
  (chat) => {
    // demander l'historique des msgs
    chat.socket?.emit("channelHistory");

    // récupérer l'historique des msgs
    chat.socket?.on("channelHistory", (payload) => {
      stockHistory(payload);
    });

    // récupérer un nouveau msg reçu
    chat.socket?.on("channel", (payload) => {
      pushToMessages(payload);
    });
  },
  { timeout: 10000 },
  chatService
);

const handleSubmitNewMessage = () => {
  if (message.value.length > 0) {
    chatService.sendNewMessageToChan(
      message.value,
      currentChannel.value.channelId
    );
    messages.value.push({
      id: 0,
      message: message.value,
      channelId: currentChannel.value.channelId,
      senderId: user.value.id,
      date: new Date().toLocaleString("en-US", dateOptions),
      avatar_url: user.value.avatar_url,
      username: user.value.username,
    });
    message.value = "";
  }
};

const currentChannelClasses = (channel) => {
  return {
    "ft-actual-recipient": currentChannel.value?.channelId === channel.channelId,
    "admin-channel-icon": channel.Admin !== null,
    "owner-channel-icon": channel.ownerId === user.value.id,
  };
};

// kick, bann or mute someone emitted from other profile component
function manageAdminAction(action: string) {
  const found = currentMembers.value.find(
    (member) => member.username === currentProfileToShow.value.username
  );
  if (currentChannel.value?.channelId === undefined || found === undefined)
    return;
  switch (action) {
    case "kick":
      kick(
        currentChannel.value?.channelId,
        found.id,
        currentProfileToShow.value.username
      );
      break;
    case "mute":
      mute(
        currentChannel.value?.channelId,
        found.id,
        currentProfileToShow.value.username
      );
      break;
    case "unmute":
      unmute(
        currentChannel.value?.channelId,
        found.id,
        currentProfileToShow.value.username
      );
      break;
    case "bann":
      bann(
        currentChannel.value?.channelId,
        found.id,
        currentProfileToShow.value.username
      );
      break;
    case "promote":
      promote(
        currentChannel.value?.channelId,
        found.id,
        currentProfileToShow.value.username
      );
      break;
    case "demote":
      demote(
        currentChannel.value?.channelId,
        found.id,
        currentProfileToShow.value.username
      );
      break;
  }
}

// kick, bann or mute someone emitted from pannel component
function manageAdminActionFromPanel(action: object) {
  if (action.what === "unmute") {
    unmute(currentChannel.value?.channelId, action.userId, action.username);
  } else if (action.what === "unbann") {
    unbann(currentChannel.value?.channelId, action.userId, action.username);
  } else if (action.what === "demote") {
    demote(currentChannel.value?.channelId, action.userId, action.username);
  }
}

async function pushToMessages(payload) {
  const profile = await userStore.loadUserProfileById(
    payload.senderId,
    sessionStore.access_token
  );

  if (messages.value.indexOf(payload.id) === -1) {
    messages.value.push({
      id: payload.id,
      message: payload.message,
      channelId: payload.channelId,
      senderId: payload.senderId,
      date: new Date(payload.date).toLocaleString("en-US", dateOptions),
      avatar_url: profile?.avatar_url || "",
      username: profile?.username || "",
    });
  }
}

const stockHistory = async (payload) => {
  // push recieved message to Messages Array
  pushToMessages(payload);

  // sort messages
  messages.value.sort((a, b) => {
    return a.id - b.id;
  });
};

// used when click on channel name
function changeCurrentChannel(name: string) {
  // profileToShow.value = ''
  currentProfileToShow.value.username = "";
  currentChannel.value =
    myChannels.value.find((chan) => name === chan.name) || null;
}

function checkIfBlocked(senderId: number) {
  return userStore.blocked.find((user) => user.id === senderId);
}

function checkIfBanned(userId: number) {
  return bannedUsers.value.find((user) => user.id === userId);
}

// scroll messages container to bottom
function scrollToBottom() {
  let myScroller = scroller.value;
  if (myScroller) {
    myScroller.scrollTop = myScroller.scrollHeight;
  }
}

// Async functions
async function loadMyself() {
  if (sessionStore.isLoggedIn) {
    // get user infos
    await userStore.getMe(sessionStore.access_token);
    if (user.value.isLogged === false) {
      sessionStore.isLoggedIn = false;
      sessionStore.access_token = "";
      router.push('/login?logout=true');
    }
  } else {
    router.push('/login?logout=true');
  }
}

async function loadBlocked() {
  if (sessionStore.isLoggedIn) {
    // get user infos
    await userStore.getBlockedUsers(sessionStore.access_token);
    isBlockedLoaded.value = true;
    if (user.value.isLogged === false) {
      sessionStore.isLoggedIn = false;
      sessionStore.access_token = "";
      router.push('/login?logout=true');
    }
  }
}

async function getMyChannels() {
  await axios({
    url: "/api/chat/channel/myChannels",
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      myChannels.value = response.data;
      if (!isAllMyChanLoaded.value && myChannels.value.length > 0) {
        currentChannel.value = myChannels.value[0];
      }
      isAllMyChanLoaded.value = true;
      console.log("loaded all my channels");
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
       router.push('/login?logout=true');
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}

async function getAllChannels() {
  await axios({
    url: "/api/chat/channel/all",
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      allChannels.value = response.data;
      isAllChanLoaded.value = true;
      console.log("loaded all channels");
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
       router.push('/login?logout=true');
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}

async function getAllMembers(channelId: number) {
  await axios({
    url: `/api/chat/channel/members/${channelId}`,
    method: "get",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
    },
  })
    .then((response) => {
      currentMembers.value = response.data.members;
      isCurrentMembersLoaded.value = true;
      console.log(`Members of channel with id ${channelId} loaded`);
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}

async function kick(channelId: number, userId: number, username: string) {
  await axios({
    url: "/api/chat/channel/member/remove",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
    data: { channelId: channelId, userId: userId },
  })
    .then((response) => {
      console.log(username + " is kicked out of channel with id " + channelId);
      currentMembers.value = currentMembers.value.filter(
        (member) => member.username !== currentProfileToShow.value.username
      );
      currentProfileToShow.value.username = "";
      return true;
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.response.status == 404) {
        console.log(
          `user not found: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
      return false;
    });
}

async function bann(channelId: number, userId: number, username: string) {
  await axios({
    url: "/api/chat/channel/banned/add",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
    data: { channelId: channelId, userId: userId },
  })
    .then((response) => {
      console.log(username + " is kicked out of channel with id " + channelId);
      currentMembers.value = currentMembers.value.filter(
        (member) => member.username !== currentProfileToShow.value.username
      );
      currentProfileToShow.value.username = "";
      return true;
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.response.status == 404) {
        console.log(
          `user not found: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
      return false;
    });
}

async function unbann(channelId: number, userId: number, username: string) {
  await axios({
    url: "/api/chat/channel/banned/remove",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
    data: { channelId: channelId, userId: userId },
  })
    .then((response) => {
      console.log(username + " is unbanned of channel with id " + channelId);
      return true;
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.response.status == 404) {
        console.log(
          `user not found: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
      return false;
    });
}

async function mute(channelId: number, userId: number, username: string) {
  await axios({
    url: "/api/chat/channel/muted/add",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
    data: { channelId: channelId, userId: userId },
  })
    .then((response) => {
      currentProfileToShow.value.isMuted = true;
      console.log(username + " is muted in channel with id " + channelId);
      return true;
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.response.status == 404) {
        console.log(
          `user not found: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
      return false;
    });
}

async function unmute(channelId: number, userId: number, username: string) {
  // do something to bann this user
  await axios({
    url: "/api/chat/channel/muted/remove",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
    data: { channelId: channelId, userId: userId },
  })
    .then((response) => {
      currentProfileToShow.value.isMuted = false;
      console.log(username + " is unmuted in channel with id " + channelId);
      return true;
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.response.status == 404) {
        console.log(
          `user not found: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
      return false;
    });
}

async function promote(channelId: number, userId: number, username: string) {
  await axios({
    url: "/api/chat/channel/admin/add",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
    data: { channelId: channelId, userId: userId },
  })
    .then(() => {
      console.log(
        username + " is promoted to admin in channel with id " + channelId
      );
      return true;
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.response.status == 404) {
        console.log(
          `user not found: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
      return false;
    });
}

async function demote(channelId: number, userId: number, username: string) {
  await axios({
    url: "/api/chat/channel/admin/remove",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
    data: { channelId: channelId, userId: userId },
  })
    .then(() => {
      console.log(
        username +
          " is demoted to normal member in channel with id " +
          channelId
      );
      return true;
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.response.status == 404) {
        console.log(
          `user not found: ${error.response.status} ${error.response.statusText}`
        );
      } else {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
      return false;
    });
}

async function getBanned() {
  await axios({
    url: `/api/chat/channel/banned/${currentChannel.value?.channelId}`,
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      bannedUsers.value = response.data[0].banned;
      isAllBannedLoaded.value = true;
      console.log("loaded all banned users");
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}

async function getMuted() {
  await axios({
    url: `/api/chat/channel/muted/${currentChannel.value?.channelId}`,
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      mutedUsers.value = response.data[0].muted;
      isAllMutedLoaded.value = true;
      console.log("loaded all muted users");
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}

async function getAllUsers() {
  await axios({
    url: `/api/user/all`,
    method: "get",
  })
    .then((response) => {
      allUsers.value = response.data;
      isAllUsersLoaded.value = true;
      console.log("all users loaded");
    })
    .catch((error) => {
      if (error.response && error.response.status == 404) {
      console.log(
        `not found: ${error.response.status} ${error.response.statusText}`
      );
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}

const reloadAllInfoInterval = setInterval(loadAllInfo, 5000);

onBeforeUnmount(() => {
  clearInterval(reloadAllInfoInterval);
});

handleQueryParams(route?.query);
watch(
  () => route?.query,
  (params) => {
    handleQueryParams(params);
  }
);

async function handleQueryParams(params: LocationQuery) {
  if (params?.channelId) {
    await getMyChannels();
    const channel = myChannels.value.find(
      (chan) => chan.channelId === +params?.channelId
    );
    if (channel) {
      currentChannel.value = channel;
    } else {
      router.push("/channels");
    }
  }
}

loadAllInfo();
async function loadAllInfo() {
  await getMyChannels();
  const promises = new Array<Promise<any>>();
  promises.push(loadMyself());
  promises.push(getAllChannels());
  promises.push(loadBlocked());
  promises.push(getAllUsers());
  promises.push(loadBlocked());
  if (currentChannel.value) {
    promises.push(getBanned());
    promises.push(getMuted());
    promises.push(getAllMembers(currentChannel.value?.channelId));
  }
  await Promise.all(promises);
}

watch(currentChannel, (NewValue, OldValue) => {
  isCurrentMembersLoaded.value = false;
  isAllBannedLoaded.value = false;
  isAllMutedLoaded.value = false;
  if (NewValue) {
    getAllMembers(NewValue?.channelId);
    getBanned();
    getMuted();
  }
});

watchEffect(() => {
  if (
    mutedUsers.value.find(
      (user) => user.username === currentProfileToShow.value.username
    )
  ) {
    currentProfileToShow.value.isMuted = true;
  } else {
    currentProfileToShow.value.isMuted = false;
  }
})

</script>

<style>
#ft-add-chan-modal {
  z-index: 9999999;
}

#ft-add-chan-modal-inside {
  background: var(--middle-gray);
}

#dm-recipientList-col {
  min-width: 4rem;
  background-color: var(--dark-pink);
  color: white;
}

.ft-channel-name {
  padding: 1rem;
  border-bottom: 1px solid var(--dark-gray);
  transition: padding 0.5s ease;
  cursor: pointer;
}

.ft-channel-name:hover {
  padding-left: 1.5rem;
}

.ft-channel-name:hover .ft-quit-channel {
  display: block;
  background: white;
  opacity: 50%;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 60%;
  color: var(--dark-pink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ft-actual-recipient {
  color: var(--dark-pink);
  background-color: var(--dark-gray);
}

.ft-actual-recipient:hover {
  padding-left: 1rem;
}

/* animation profile / member list */

.position-origine {
  position: absolute;
  left: -101%;
  transition: left 0.5s ease;
}

.position-cible {
  position: absolute;
  left: 0;
  transition: left 0.5s ease;
}

#ft-back-to-list {
  position: relative;
  left: -0.5rem;
  transition: left 0.5s ease;
  text-decoration: none;
  letter-spacing: 0em;
  text-align: center;
  display: inline-block;
  background: var(--dark-pink);
  padding: 0.5em 0.5em;
  border-top: solid 0.3em var(--light);
  border-left: solid 0.3em var(--light);
  border-right: solid 0.3em var(--purple);
  border-bottom: solid 0.3em var(--purple);
}

#ft-back-to-list:hover {
  left: -1rem;
}

/* chat msgs */

.ft-chat-profile-pic {
  background-size: cover !important;
  width: 3rem !important;
  height: 3rem !important;
}

.ft-banned-user-text {
  font-size: 0.8rem;
  opacity: 40%;
}

/* Admin panel */
#ft-admin-panel {
  background-color: var(--middle-gray);
}

/* Channels list */

.admin-channel-icon:before {
  content: url(/src/assets/icons/gear-solid.svg);
  width: 1rem;
  display: inline-block;
  margin-right: 0.5rem;
  position: relative;
  top: 0.2rem;
}

.owner-channel-icon:before {
  content: url(/src/assets/icons/crown-solid.svg);
  width: 1rem;
  display: inline-block;
  margin-right: 0.5rem;
  position: relative;
  top: 0.2rem;
}
</style>
