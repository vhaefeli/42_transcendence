<template>
  <NavBar :showProfile="true" :userStore="userStore"></NavBar>
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
          class="ft-tab-content ft-border-color-game ft-tab-border text-center"
        >
          <div class="flex flex-row justify-center mb-3">
            <p>play a game in normal mode with a random opponent</p>
          </div>
          <div>
            <a
              class="t-btn-pink ft-bg-color-game ft-other-profile mb-3"
              @click="playRandom"
              ><span>Play!!!</span></a
            >
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
            <p>game mode:</p>
            <select v-model="mode">
              <option value="BEGINNER">Easy</option>
              <option value="INTERMEDIATE">Normal</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <div class="flex flex-row items-center my-4">
            <p>I want to play with:</p>
            <div class="m-6 w-2/3">
              <UserSearch
                :recipients="recipients"
                :userStore="userStore"
                @addRecipient="addRecipient"
              />
            </div>
          </div>

          <div class="flex flex-row items-center my-4">
            <div :class="{ 'cursor-not-allowed': !guest.username }">
              <a
                @click="inviteToPlay()"
                class="t-btn-pink ft-bg-color-game icon-btn-cursor"
                :class="{
                  'opacity-50 searchan-noClick': !guest.username,
                }"
              >
                <span>Invite {{ guest.username }} to play!!!</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- invitation recieved -->
      <div
        class="flex flex-col text-center ft-left-tab ft-my-profile"
        id="gameInvitation"
        :class="{ foreground: foregroundTab === 'gameInvitations' }"
        @click="setForegroundTab('gameInvitations')"
      >
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">
          Invitation to play
        </div>
        <div
          id="gameInvitationScroll"
          class="ft-tab-content ft-border-color-game ft-tab-border flex flex-col text-left ft-scrollable"
        >
          <ul>
            <div v-if="gameInvites">
              <div v-if="gameInvites.length === 0">
                <EmptyText
                  :text="'No invitation, invite someone'"
                  :white="false"
                />
              </div>
              <div v-for="(gameInvitation, index) in gameInvites" :key="index">
                <li
                  class="ft-item-title p-0 ft-text ft-bb-color-game flex flex-row justify-between items-center"
                  :class="
                    index === gameInvites.length - 1 ? '' : 'ft-tab-separator'
                  "
                >
                  <div
                    class="ft-clickable-profile flex flex-row justify-between items-center"
                    v-on:click="router.push(`/user/${gameInvitation.username}`)"
                  >
                    <ul class="flex flex-row items-center">
                      <li
                        class="ft-profile-pic ft-friend-pic"
                        :style="{
                          background: 'url(' + gameInvitation.avatar_url + ')',
                        }"
                      ></li>
                      <li class="ft-text ml-2 truncate" style="width: 10vw">
                        {{ gameInvitation.username }}
                      </li>
                    </ul>
                    <ul class="flex flex-row">
                      <li>
                        <a
                          class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"
                          @click="acceptGame(gameInvitation.gameId)"
                          ><img
                            src="../assets/icons/circle-check-solid.svg"
                            alt="accept friend request"
                            title="accept friend request"
                        /></a>
                      </li>
                      <li>
                        <a
                          class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor"
                          @click="declineGame(gameInvitation.gameId)"
                          ><img
                            src="../assets/icons/circle-xmark-solid.svg"
                            alt="decline friend request"
                            title="decline friend request"
                        /></a>
                      </li>
                    </ul>
                  </div>
                </li>
              </div>
            </div>
          </ul>
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
          class="ft-tab-content ft-border-color-game ft-tab-border flex flex-col text-left ft-scrollable"
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
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onBeforeMount, watch } from "vue";
  import { storeToRefs } from "pinia";
  import { useRoute, useRouter } from "vue-router";
  import axios, { AxiosError } from "axios";
  import { useUserStore } from "../stores/UserStore";
  import { useSessionStore } from "@/stores/SessionStore";
  import NavBar from "@/components/NavBar.vue";
  import { ModelListSelect } from "vue-search-select";
  import EmptyText from "@/components/EmptyText.vue";
  import StatusBubble from "@/components/StatusBubble.vue";
  import OtherUserProfile from "../components/OtherUserProfile.vue";
  import UserSearch from "@/components/UserSearch.vue";

  // variable for game setting
  const mode = ref("INTERMEDIATE");
  type type_user = {
    id: number;
    username: string;
  };
  let gameId: number;
  const guest = ref<type_user>({ id: 0, username: "" });
  const recipients = ref<number[]>([]);

  type GameInvites = {
    gameId: number;
    username: string;
    level: string;
    avatar_url: string;
  };
  let gameInvites: GameInvites[];

  const emits = defineEmits(["addRecipient"]);

  const actualInfos = ref({});
  const FromFriendToNotFriend = ref(false);
  const isActualInfosLoaded = ref(false);

  // to have the token we need sessionStore
  const sessionStore = useSessionStore();

  // routes
  // const route = useRoute();
  const router = useRouter();

  // we need userStore and a variable to check if logged in
  const userStore = useUserStore();
  const isLoggedIn = ref(false);

  // user search dropdown
  let allUsers: Array<type_user>;
  const userSearchList = ref<Array<type_user>>([]);
  const searchSelectedUserId = ref<number>();

  // other variables
  const foregroundTab = ref("");

  const { user, gameLog } = storeToRefs(userStore);

  // onBeforeMount is executed before the component is mounted
  // way of using await because we can't do it in setup
  onBeforeMount(async () => {
    isLoggedIn.value = true;

    // get user infos, friends, and invitations
    await userStore.getMe(sessionStore.access_token);
    if (user.value.isLogged) {
      await getGameInvites();
      await userStore.getGameHistory(sessionStore.access_token);
    } else {
      router.push("/login?logout=true");
    }
    // list all users
    await axios({
      url: "/api/user/all",
      method: "get",
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
    loadUserSearchList();
  });

  async function loadUserSearchList() {
    userSearchList.value = allUsers.filter((user) => {
      return !(userStore.user.id === user.id);
    });
    return;
  }

  function setForegroundTab(tab) {
    foregroundTab.value = tab;
  }

  function logout() {
    router.push("/login?logout=true");
  }

  // formatage de la date pour un affichage sous la forme "01/01/2023"
  function formatDate(dateString: string) {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  async function playRandom() {
    await axios({
      url: "/api/player/random",
      method: "post",
      headers: {
        Authorization: `Bearer ${sessionStore.access_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        gameId = response.data.gameId;
        console.log(`"random game", ${response.data.gameId}`);
        router.push(`/game?gameId=${gameId}`);
      })
      .catch((error) => {
        if (error.response.status == 401) {
          console.log(
            `invalid access token: ${error.response.status} ${error.response.statusText}`
          );
          logout();
        } else if (error.response.status == 404) {
          console.log(
            `game not found: ${error.response.status} ${error.response.statusText}`
          );
        } else {
          console.error(
            `unexpected error: ${error.response.status} ${error.response.statusText}`
          );
        }
      });
  }
  // game setting functions

  // add type_user to the list
  function addRecipient(recipientName: string) {
    const userFind = allUsers.find((user) => recipientName === user.username);
    if (userFind) {
      if (recipients.value.indexOf(userFind.id) === -1) {
        recipients.value.push(userFind.id);
      }
      guest.value = userFind;
    }
  }

  function inviteToPlay() {
    console.log(`"invitation to play" ${guest.value.username}`);

    if (guest.value.username.length === 0) return;
    const user = userSearchList.value.find(
      (user) => user.id === searchSelectedUserId.value
    );

    console.log(`"invitation to play game id" ${guest.value.id}`);
    console.log(`mode : ${mode.value}`);

    axios({
      url: "/api/player/newBoth",
      method: "post",
      data: { opponentId: guest.value.id, mode: mode.value },
      headers: {
        Authorization: `Bearer ${sessionStore.access_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        gameId = response.data.newGameId;
        console.log(
          `"game with guest ", ${guest.value.id}, "game id: " ${gameId}`
        );
        router.push(`/game?gameId=${gameId}`);
      })
      .catch((error) => {
        if (error.response.status == 401) {
          console.log(
            `invalid access token: ${error.response.status} ${error.response.statusText}`
          );
          logout();
        } else if (error.response.status == 400) {
          console.log(
            `Bad Request: ${error.response.status} ${error.response.statusText}`
          );
        } else {
          console.error(
            `unexpected error: ${error.response.status} ${error.response.statusText}`
          );
        }
      });
  }
  // game invitations actions

  async function getGameInvites() {
    await axios({
      url: "/api/player/invitedBy",
      method: "get",
      headers: {
        Authorization: `Bearer ${sessionStore.access_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        gameInvites = response.data;
        console.log("loaded  games invites");
        return true;
      })
      .catch((error) => {
        if (error.response.status == 401) {
          console.log(
            `invalid access token: ${error.response.status} ${error.response.statusText}`
          );
          logout();
        } else {
          console.error(
            `unexpected error: ${error.response.status} ${error.response.statusText}`
          );
        }
        return false;
      });
  }

  function acceptGame(gameId: number) {
    console.log(`"guest to game id: " ${gameId}`);
    router.push(`/game?gameId=${gameId}`);
  }

  // delete invitation to deny
  async function declineGame(gameId: number) {
    await axios({
      url: `/api/player/cancel/${gameId}`,
      method: "patch",
      headers: {
        Authorization: `Bearer ${sessionStore.access_token}`,
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        console.log(`gameInvitation game Id ${gameId} canceled`);
      })
      .catch((error) => {
        if (error.response.status == 401) {
          console.log(
            `invalid access token: ${error.response.status} ${error.response.statusText}`
          );
          logout();
        } else if (error.response.status == 404) {
          console.log(
            `gameInvitation id ${gameId} not found: ${error.response.status} ${error.response.statusText}`
          );
        } else {
          console.error(
            `unexpected error: ${error.response.status} ${error.response.statusText}`
          );
        }
        // return false;
      });
  }
</script>

<style scoped>
  .ft-game-container {
    background: var(--gray);
    border: 4px solid var(--sunset);
    padding: 5vw;
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 25px 25px 0 0;
    overflow: hidden;
    height: 90vh;
    z-index: 0;
  }
  .foreground {
    z-index: 999;
  }

  #directPlay {
    left: 10vw;
  }

  #setGame {
    position: relative;
    top: -7em;
    right: 5vw;
  }

  #setGameContent {
    width: fit-content;
  }

  #gameInvitation {
    top: -21vh;
    right: -15vw;
    width: 39vw;
    z-index: 1;
  }

  #match-history {
    position: relative;
    top: -17vh;
    right: -39vw;
    width: 40rem;
  }

  #stats {
    position: relative;
    top: -40vh;
    width: max-content;
    left: 1vw;
    z-index: 1;
  }

  .ft-clickable-profile {
    @apply p-2 w-full;
  }

  .ft-clickable-profile:hover {
    @apply cursor-pointer rounded;
    backdrop-filter: brightness(1.4);
    border-radius: 0.8rem;
  }

  .ft-left-tab {
    position: relative;
    width: 30em;
    z-index: 2;
  }
  .ft-right-tab {
    position: relative;
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
    background-size: cover !important;
  }

  .ft-left-tab {
    position: relative;
    z-index: 2;
  }

  .ft-item-title {
    padding: 1.5em;
  }

  #matchScroll::-webkit-scrollbar,
  /* #friendsScroll::-webkit-scrollbar, */
  #gameInvitationScroll::-webkit-scrollbar
  /* #sentRequestsScroll::-webkit-scrollbar, */
  /* #blocked::-webkit-scrollbar  */ {
    width: 22px;
  }

  #matchScroll::-webkit-scrollbar-track,
  #gameInvitationScroll::-webkit-scrollbar-track
  /* #sentRequestsScroll::-webkit-scrollbar-track, */
  /* #blocked::-webkit-scrollbar-track, */
  /* #friendsScroll::-webkit-scrollbar-track  */ {
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

  /* #friendsScroll::-webkit-scrollbar-thumb, */
  #gameInvitationScroll::-webkit-scrollbar-thumb
  /* #sentRequestsScroll::-webkit-scrollbar-thumb, */
  /* #blocked::-webkit-scrollbar-thumb  */ {
    background-color: var(--purple);
    border-bottom: 0.2rem solid var(--dark-gray);
    border-right: 0.2rem solid var(--dark-gray);
    border-top: 0.2rem solid var(--light);
    border-left: 0.2rem solid var(--light);
  }
</style>
