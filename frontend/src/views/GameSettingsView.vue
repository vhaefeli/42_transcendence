<template>
  <NavBar :showProfile="true"></NavBar>
  <div id="gamesetting-container">
    <section>
      <div class="text-white">
        <input
          v-model="gameIdToConnect"
          placeholder="game id"
          class="bg-gray-500"
        /><br />
      </div>
      <button class="t-btn-pink ft-color-game" id="play" @click="connectToGame">
        <span>Play Game</span>
      </button>
    </section>
    <section class="ft-container">
      <div
        class="flex flex-col text-center ft-left-tab ft-my-profile"
        id="friends-requests"
        :class="{ foreground: foregroundTab === 'friendsRequest' }"
        @click="setForegroundTab('friendsRequest')"
      >
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">
          Friends requests
        </div>
        <div
          id="friendsRequestScroll"
          class="ft-tab-content ft-border-color-game ft-tab-border text-left ft-scrollable"
        >
          <ul>
            <div v-if="invites">
              <div v-if="invites.length === 0">
                <EmptyText
                  :text="'No one wants to be your friend...yet!'"
                  :white="false"
                />
              </div>
              <div v-for="(invitation, index) in invites" :key="index">
                <li
                  class="ft-item-title ft-text ft-bb-color-game flex flex-row justify-between items-center"
                  :class="
                    index === invites.length - 1 ? '' : 'ft-tab-separator'
                  "
                >
                  <ul class="flex flex-row items-center">
                    <li class="ft-profile-pic ft-friend-pic"></li>
                    <li class="ft-text ml-2">{{ invitation.username }}</li>
                  </ul>
                  <ul class="flex flex-row">
                    <li>
                      <a
                        class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"
                        @click="acceptFriend(invitation.username)"
                        ><img
                          src="../assets/icons/circle-check-solid.svg"
                          alt="accept friend request"
                          title="accept friend request"
                      /></a>
                    </li>
                    <li>
                      <a
                        class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor"
                        @click="iDontWantToBeFriend(invitation.username)"
                        ><img
                          src="../assets/icons/circle-xmark-solid.svg"
                          alt="decline friend request"
                          title="decline friend request"
                      /></a>
                    </li>
                    <li>
                      <a
                        class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor"
                        @click="blockUserAndDelInvite(invitation.username)"
                        ><img
                          src="../assets/icons/person-circle-minus-solid.svg"
                          alt="block them"
                          title="block this user"
                      /></a>
                    </li>
                  </ul>
                </li>
              </div>
            </div>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onBeforeMount } from "vue";
  import { storeToRefs } from "pinia";
  import { useRoute, useRouter } from "vue-router";
  import axios, { AxiosError } from "axios";
  import { useUserStore } from "../stores/UserStore";
  import { useSessionStore } from "@/stores/SessionStore";
  import NavBar from "@/components/NavBar.vue";
  import { ModelListSelect } from "vue-search-select";
  import EmptyText from "@/components/EmptyText.vue";

  type type_user = {
    id: number;
    username: string;
  };

  const userList = ref<Array<type_user>>([]);
  const selectedUser = ref<number>();

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
  // to have the token we need sessionStore
  const sessionStore = useSessionStore();

  // routes
  const router = useRouter();

  // we need userStore and a variable to check if logged in
  const userStore = useUserStore();
  const isLoggedIn = ref(false);

  // other variables
  const foregroundTab = ref("");
  const newFriend = ref("");
  let allUsers: { id: number; username: string }[];

  const { user, friends, invites, blocked, invitesSent, gameLog } =
    storeToRefs(userStore);

  function setForegroundTab(tab) {
    foregroundTab.value = tab;
  }

  // onBeforeMount is executed before the component is mounted
  // way of using await because we can't do it in setup
  onBeforeMount(async () => {
    if (sessionStore.isLoggedIn) {
      isLoggedIn.value = true;

      // get user infos, friends, and invitations
      await userStore.getMe(sessionStore.access_token);
      if (user.value.isLogged) {
        await userStore.getFriends(sessionStore.access_token);
        await userStore.getInvites(sessionStore.access_token);
        await userStore.getBlockedUsers(sessionStore.access_token);
        await userStore.getInvitesSent(sessionStore.access_token);
        await userStore.getGameHistory(sessionStore.access_token);
      } else {
        isLoggedIn.value = false;
        sessionStore.isLoggedIn = false;
        sessionStore.access_token = "";
        router.push({ name: "login" });
      }
    }
  });

  // list all users
  axios({
    url: "/api/user/all",
    method: "get",
    headers: {},
  })
    .then((response) => {
      allUsers = response.data;
      console.log("all users loaded");
    })
    .catch((error) => {
      console.error(
        `unexpected error: ${error.response.status} ${error.response.statusText}`
      );
    });

  async function validateSelection() {
    console.log(
      `selected: ${
        userList.value.find((element) => element.id === selectedUser.value)
          ?.username
      }`
    );
  }

  // functions to delete because useless
  function addFriend() {
    if (newFriend.value) {
      userStore.addFriend(newFriend.value, sessionStore.access_token);
    }
  }

  function formatDate(dateString: string) {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function acceptFriend(friendname) {
    userStore.acceptFriend(friendname, sessionStore.access_token);
  }

  function iDontWantToBeFriend(friendname) {
    userStore.declineFriend(friendname, sessionStore.access_token);
  }

  function removeFriend(friendname) {
    userStore.delFriend(friendname, sessionStore.access_token);
  }

  function blockUser(username) {
    userStore.blockUser(username, sessionStore.access_token);
  }

  function blockUserAndDelInvite(username) {
    userStore.blockUser(username, sessionStore.access_token);
    userStore.declineFriend(username, sessionStore.access_token);
  }

  function unblockUser(username) {
    userStore.unblockUser(username, sessionStore.access_token);
  }

  function getGameHistory(username) {
    userStore.getGameHistory(username, sessionStore.access_token);
  }

  const gameIdToConnect = ref();

  function connectToGame() {
    if (gameIdToConnect.value >= 0) {
      router.push(`/game?gameId=${gameIdToConnect.value}`);
    }
  }
</script>

<style scoped>
  .ft-tab-content {
    min-width: 100%;
    /* width: 100%; */
    box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
  }
  .ft-left-tab#stats {
    position: relative;
    /* top:-28rem; */
    left: 10vw;
    width: 30em;

    z-index: 1;
  }

  .ft-item-title {
    padding: 1.5em;
  }
  .ft-tab-folder {
    width: fit-content;
    border-bottom-style: solid;
    border-bottom-width: 1.5em;
    /* border-bottom: 1.5em solid var(--sunset); */
  }

  .ft-tab-border {
    /* width: 30em; */
    border-style: solid;
    border-width: 0.3em;
    padding: 1em 4em 1em 4em;
  }

  #gamesetting-container {
    background: var(--gray);
    border: 4px solid var(--sunset);
    padding: 5vw;

    border-radius: 25px 25px 0 0;
    overflow: hidden;
  }

  #play {
    /* position: absolute; */
    /* top: 20vw; */
    /* left: 50%;
  transform: translateX(-50%); */
    background-color: var(--pink);
  }
</style>
