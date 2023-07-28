<template>
  <NavBar :showProfile="true"></NavBar>
  <div>
    <section></section>
    <section class="ft-game-container">
      <!-- direct play -->
      <div
        class="flex flex-col text-center ft-left-tab"
        id="directPlay"
        :class="{ foreground: foregroundTab === 'playDirect' }"
        @click="setForegroundTab('playDirect')"
      >
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">
          Direct play
        </div>
        <div
          class="ft-tab-content ft-border-color-game ft-tab-border text-left"
        >
          <div class="flex flex-row justify-center">
            <div>
              <div class="text-white">
                <input
                  v-model="gameIdToConnect"
                  placeholder="game id"
                  class="bg-gray-500"
                /><br />
              </div>
              <a
                class="t-btn-pink ft-bg-color-game ft-other-profile mb-3"
                @click="connectToGame"
                ><span>Play!!!</span></a
              >
            </div>
          </div>
        </div>
      </div>
      <!-- game settings -->
      <div
        class="flex flex-col text-center ft-right-tab"
        id="setGame"
        :class="{ foreground: foregroundTab === 'gameSetting' }"
        @click="setForegroundTab('gameSetting')"
      >
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">
          Set a game
        </div>
        <div
          class="flex flex-col justify-center ft-tab-content ft-border-color-game ft-tab-border text-left"
          id="setGameContent"
        >
          <div class="flex flex-row items-center my-4">
            <p>mode de jeu:</p>
            <select v-model="mode">
              <option value="facile">Facile</option>
              <option value="normal">Normal</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div class="flex flex-row items-center my-4">
            <input v-model="newFriend" placeholder="Add a friend by username" />
          </div>
          <div class="flex flex-row items-center my-4">
            <div :class="{ 'cursor-not-allowed': !newFriend }">
              <a
                @click="addFriend"
                class="t-btn-pink ft-bg-color-game icon-btn-cursor"
                :class="{ 'opacity-50 searchan-noClick': !newFriend }"
              >
                <span>Invite my friend to play!!!</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- invitation recieved -->
      <div
        class="flex flex-col text-center ft-left-tab ft-my-profile"
        id="gameInvitation"
        :class="{ foreground: foregroundTab === 'friendsRequest' }"
        @click="setForegroundTab('friendsRequest')"
      >
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">
          Invitation to play
        </div>
        <div
          id="gameInvitationScroll"
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
                  </ul>
                </li>
              </div>
            </div>
          </ul>
        </div>
      </div>
      <!-- stats -->
      <div
        class="flex flex-col text-center ft-left-tab"
        id="stats"
        :class="{ foreground: foregroundTab === 'stats' }"
        @click="setForegroundTab('stats')"
      >
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Stats</div>
        <div
          class="ft-tab-content ft-border-color-game ft-tab-border flex flex-row justify-evenly"
        >
          <div class="ft-item-title ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">{{ user.nbGames }}</div>
            <div class="ft-text">matches</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">{{ user.rank }}</div>
            <div class="ft-text">victories</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">{{ user.nbMatch }}</div>
            <div class="ft-text">perfect victories</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">{{ user.level }}</div>
            <div class="ft-text">level</div>
          </div>
        </div>
      </div>
      <!-- match History -->
      <div
        class="flex flex-col text-center ft-right-tab"
        id="match-history"
        :class="{ foreground: foregroundTab === 'matchHistory' }"
        @click="setForegroundTab('matchHistory')"
      >
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">
          Match history
        </div>
        <div
          id="matchScroll"
          class="flex flex-col justify-center ft-tab-content ft-border-color-game ft-tab-border text-left ft-scrollable"
        >
          <ul>
            <div v-if="gameLog">
              <div v-if="gameLog.length === 0">
                <EmptyText :text="'No game to show here'" :white="false" />
              </div>
              <div v-for="(game, index) in gameLog" :key="index">
                <li
                  class="ft-item-title ft-text ft-bb-color-game flex flex-row justify-between items-center"
                  :class="
                    index === gameLog.length - 1 ? '' : 'ft-tab-separator'
                  "
                >
                  <div class="flex flex-col justify-start">
                    <li class="ft-level-text ml-2">
                      {{ formatDate(game.date) }}
                    </li>
                    <li class="ft-text ml-2">{{ game.Result }}</li>
                  </div>
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

  const mode = ref("normal");

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
  .ft-game-container {
    background: var(--gray);
    border: 4px solid var(--sunset);
    padding-top: 5vw;
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 25px 25px 0 0;
    overflow: hidden;
    height: 90vh;
  }
  .foreground {
    z-index: 999;
  }

  #directPlay {
    right: -25vw;
    transform: translateX(-50%);
  }

  #setGame {
    position: relative;
    top: -7em;
    right: 10vw;
  }

  #setGameContent {
    width: fit-content;
  }

  #gameInvitation {
    top: -14em;
    right: -20vw;
  }

  #stats {
    position: relative;
    top: -12rem;
    left: 5vw;
    width: max-content;
    z-index: 1;
  }

  #match-history {
    position: relative;
    top: -30em;
    right: -51vw;
    width: 40rem;
  }

  .ft-left-tab {
    position: relative;
    width: 30em;
    z-index: 2;
  }
  .ft-right-tab {
    position: relative;
    /* top: 43em; */
    /* left: 33vw; */
    /* width: 41em; */
  }

  .ft-profile-pic#current-profile-pic {
    position: relative;
    top: 3em;
    z-index: 1;
    background-size: cover !important;
  }

  .ft-central-tab-container {
    position: relative;
    top: -16em;
    left: 50vw;
    transform: translateX(-50%);
  }

  .ft-tab-content {
    /* min-width: 100%; */
    /* width: 100%; */
    box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
  }

  .ft-central-tab-container.ft-tab-content {
    background: var(--light-purple);
  }

  .ft-tab-folder {
    width: fit-content;
    border-bottom-style: solid;
    border-bottom-width: 1.5em;
    border-bottom: 1.5em solid var(--sunset);
  }

  .ft-tab-content#buttons-container {
    padding: 2em 0 12em 0;
    height: 17rem;
  }

  .ft-tab-separator {
    padding: 1em;
  }

  .ft-tab-border {
    border-style: solid;
    border-width: 0.3em;
    padding: 1em 4em 1em 4em;
  }

  .ft-tab-separator {
    border-bottom-width: 0.3em;
    border-bottom-style: solid;
  }

  /* Piste : pour perso des barres de défilement, utiliser "PerfectScrollbar" ou "Custom Scrollbar" (JS). */
  .ft-scrollable {
    max-height: 20rem;
    min-height: 12rem;
    overflow: auto;
  }

  #friendsInvitation {
    position: relative;
    top: 40em;
    left: 15vw;
    width: 39em;
    z-index: 1;
  }

  /* Pour DEBUG seulement, doit s-afficher ou non selon en jeu */
  .ft-playing {
    display: none;
  }

  /* -------------------- */

  #sent-requests {
    position: relative;
    /* top: -45em; */
    left: 49vw;
    width: 25em;
  }

  .ft-profile-pic.ft-friend-pic {
    width: 3em;
    height: 3em;
    position: relative;
    background: url(./../assets/img/ben-neale-zpxKdH_xNSI-unsplash.jpg);
    background-size: cover;
  }

  .ft-left-tab {
    position: relative;
    z-index: 2;
  }

  .ft-item-title {
    padding: 1.5em;
  }

  #matchScroll::-webkit-scrollbar,
  #friendsScroll::-webkit-scrollbar,
  #gameInvitationScroll::-webkit-scrollbar,
  #sentRequestsScroll::-webkit-scrollbar,
  #blocked::-webkit-scrollbar {
    width: 22px;
  }

  #matchScroll::-webkit-scrollbar-track,
  #gameInvitationScroll::-webkit-scrollbar-track,
  #sentRequestsScroll::-webkit-scrollbar-track,
  #blocked::-webkit-scrollbar-track,
  #friendsScroll::-webkit-scrollbar-track {
    background: var(--light-purple);
    border-bottom: 0.2rem solid var(--purple);
    border-right: 0.2rem solid var(--purple);
    border-top: 0.2rem solid var(--mint);
    border-left: 0.2rem solid var(--mint);
  }

  #matchScroll::-webkit-scrollbar-thumb {
    background-color: var(--mint);
    border-bottom: 0.2rem solid var(--dark-gray);
    border-right: 0.2rem solid var(--dark-gray);
    border-top: 0.2rem solid var(--light);
    border-left: 0.2rem solid var(--light);
  }

  #friendsScroll::-webkit-scrollbar-thumb,
  #gameInvitationScroll::-webkit-scrollbar-thumb,
  #sentRequestsScroll::-webkit-scrollbar-thumb,
  #blocked::-webkit-scrollbar-thumb {
    background-color: var(--purple);
    border-bottom: 0.2rem solid var(--dark-gray);
    border-right: 0.2rem solid var(--dark-gray);
    border-top: 0.2rem solid var(--light);
    border-left: 0.2rem solid var(--light);
  }
</style>
