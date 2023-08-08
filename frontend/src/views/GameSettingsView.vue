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
            <p>game mode:&nbsp;</p>
            <select v-model="mode" class="rounded p-2 bg-gray-50">
              <option value="BEGINNER">Easy</option>
              <option value="INTERMEDIATE">Normal</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <div v-if="!isUserFromQueryParams" class="flex flex-row items-center my-4">
            <p>I want to play with:</p>
            <div class="m-6 w-2/3">
              <UserSearch
                :recipients="recipients"
                :userStore="userStore"
                @addRecipient="addRecipient"
              />
            </div>
          </div>
          <div v-else class="my-4">
            <a class="hover:cursor-pointer hover:underline" @click="disableUserFromQueryParam">Invite someone else</a>
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
                      <ul class="flex flex-col justify-center">
                        <li class="ft-text ml-2 truncate" style="width: 10vw">
                          {{ gameInvitation.username }}
                        </li>
                        <li class="ft-level-text ml-2">Level: {{ gameInvitation.level }}</li>
                      </ul>
                    </ul>
                    <ul class="flex flex-row">
                      <li>
                        <a
                          class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"
                          @click.stop="acceptGame(gameInvitation.gameId)"
                          ><img
                            src="../assets/icons/circle-check-solid.svg"
                            alt="accept game invitation"
                            title="accept game invitation"
                        /></a>
                      </li>
                      <li>
                        <a
                          class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor"
                          @click.stop="declineGame(gameInvitation.gameId)"
                          ><img
                            src="../assets/icons/circle-xmark-solid.svg"
                            alt="decline game invitation"
                            title="decline game invitation"
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
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onBeforeUnmount, watch } from "vue";
  import { storeToRefs } from "pinia";
  import { useRoute, useRouter, type LocationQuery } from "vue-router";
  import axios, { AxiosError } from "axios";
  import { useUserStore } from "../stores/UserStore";
  import { useSessionStore } from "@/stores/SessionStore";
  import NavBar from "@/components/NavBar.vue";
  import EmptyText from "@/components/EmptyText.vue";
  import UserSearch from "@/components/UserSearch.vue";
import { transformLevel } from "@/services/helper.service";

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
  const gameInvites = ref<Array<GameInvites>>([]);

  // to have the token we need sessionStore
  const sessionStore = useSessionStore();

  // routes
  const route = useRoute();
  const router = useRouter();

  const userStore = useUserStore();

  // user search dropdown
  const userSearchList = ref<Array<type_user>>([]);
  const searchSelectedUserId = ref<number>();

  // other variables
  const foregroundTab = ref("");
  let loadingUserSearchList: Promise<any>;
  const isUserFromQueryParams = ref(false);

  const { user } = storeToRefs(userStore);

  loadAllInfo();
  const reloadInterval = setInterval(loadAllInfo, 5000);

  onBeforeUnmount(() => {
    clearInterval(reloadInterval);
  });

handleQueryParams(route?.query);
watch(
  () => route?.query,
  (params) => {
    handleQueryParams(params);
  }
);

  async function handleQueryParams(params: LocationQuery) {
    const inviteUserId = +params?.inviteUserId;
    if (typeof inviteUserId === "number"){
      await loadingUserSearchList;
      const userFind = userSearchList.value.find((user) => inviteUserId === user.id);
      if (userFind) {
          guest.value = userFind;
          isUserFromQueryParams.value = true;
          setForegroundTab('gameSetting');
      }
    }
  }

  function disableUserFromQueryParam() {
    isUserFromQueryParams.value = false;
    guest.value = { id: 0, username: "" };
    router.push('/game-settings');
  }

  async function loadAllInfo() {
    userStore.getMe(sessionStore.access_token).then(() => {
      if (!user.value.isLogged) router.push('/login?logout=true');
    });
    getGameInvites();
    loadingUserSearchList = loadUserSearchList();
  }

  async function loadUserSearchList() {
    let newUserSearchList: Array<{id: number, username: string}> | undefined;
    await axios({
      url: '/api/user/all',
      method: 'get',
    }).then((response) => {
      newUserSearchList = response.data;
    });
    if (!newUserSearchList) return;
    userSearchList.value = newUserSearchList.filter(
      (user) => userStore.user.id !== user.id
    );
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
        // console.log(`"random game", ${response.data.gameId}`);
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
    const userFind = userSearchList.value.find((user) => recipientName === user.username);
    if (userFind) {
        guest.value = userFind;
    }
  }

  function inviteToPlay() {
    // console.log(`"invitation to play" ${guest.value.username}`);

    if (guest.value.username.length === 0) return;
    const user = userSearchList.value.find(
      (user) => user.id === searchSelectedUserId.value
    );

    // console.log(`"invitation to play game id" ${guest.value.id}`);
    // console.log(`mode : ${mode.value}`);

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
        // console.log(
        //   `"game with guest ", ${guest.value.id}, "game id: " ${gameId}`
        // );
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
    let newGameInvites = new Array<GameInvites>();
    await axios({
      url: "/api/player/invitedBy",
      method: "get",
      headers: {
        Authorization: `Bearer ${sessionStore.access_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        // console.log("loaded  games invites");
        newGameInvites = response.data;
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
      });
    if (newGameInvites.length > 0) {
      newGameInvites.forEach((invite) => invite.level = transformLevel(invite.level));
      gameInvites.value = newGameInvites;
    }
  }

  function acceptGame(gameId: number) {
    // console.log(`"guest to game id: " ${gameId}`);
    router.push(`/game?gameId=${gameId}`);
  }

  // delete invitation to deny
  async function declineGame(gameId: number) {
    await axios({
      url: `/api/player/cancel`,
      method: "patch",
      data: { gameId: gameId },
      headers: {
        Authorization: `Bearer ${sessionStore.access_token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async () => {
        // console.log(`gameInvitation game Id ${gameId} canceled`);
        await getGameInvites();
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
    position: relative;
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
    z-index: 30;
  }

  #directPlay {
    position: absolute;
    top: 5vh;
    left: 18vw;
  }

  #setGame {
    position: absolute;
    top: 20vh;
    right: 17vw;
    @apply text-lg;
  }

  #setGameContent {
    width: fit-content;
  }

  #gameInvitation {
    position: absolute;
    bottom: 10vh;
    left: 15vw;
    width: 39vw;
    z-index: 1;
  }

  #match-history {
    position: absolute;
    top: 48vh;
    right: 7vw;
    width: 40rem;
  }

  #stats {
    position: absolute;
    top: 57vh;
    left: 5vw;
    width: max-content;
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
