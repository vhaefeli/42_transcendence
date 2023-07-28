<template>
    <NavBar :showProfile="true" :isOtherProfile="true" :userStore="userStore"></NavBar>
    <div v-if="isUserLoaded" id="profile-container">
        <div id="other-tab-container">
            <div id="other-profile-tab">{{ user.username }}</div>
        </div>

        <section class="ft-cover flex flex-col items-end justify-end">
          <a class="ft-bg-color-chat t-btn-pink ft-other-profile"><span>Send message</span></a>
          <a class="ft-bg-color-game t-btn-pink ft-other-profile"><span>Invite to play</span></a>
        </section>
    
        <section class="ft-container">
          <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container">
            <div class="ft-profile-pic" id="current-profile-pic" :style="{ 'background': 'url(' + user.avatar_url + ')' }"></div>
            <!-- ajouter la valeur ft-circle-green ou ft-circle-gray selon le statut de connexion de la personne -->
            <div class="ft-connection-circle" id="current-profile-pic"></div>
            <div class="ft-tab-folder" id="title-profile"></div>
            <!-- Par defaut en ligne -->
            <div class="ft-tab-content ft-bg-color-profile">{{ user.status }}</div>
            <div class="ft-tab-content ft-bg-color-profile ft-title" id="username">{{ user.username }}</div>
            <!-- <div class="ft-tabContent ft-centralTab" id="buttonsContainer"> -->
            <div class="ft-tab-content ft-bg-color-profile" id="buttons-container">
              <!-- Bouton pour ajouter la personne en ami (profil d'un tiers) -->
              <a title="send a friend request" class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor ft-other-profile"><img src="../assets/icons/user-plus-solid.svg" alt="send a friend request"></a>
              <!-- Bouton pour bloquer la personne (profil d'un tiers) -->
              <!-- verifier si code TS correct, car supposition -->
              <a title="block this user" class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor ft-other-profile" @click="blockUser(user.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them"></a>
              <!-- <a class="t-btn-pink ft-color-block ft-other-profile" id="block"><span>[blk]</span></a> -->
    
              <!-- Bouton pour editer son profil (SON profil uniquement) -->
              <!-- <a class="t-btn-pink ft-color-edit ft-my-profile" id="edit"><span>[ed.]</span></a> -->
              <a title="edit your profile" class="t-btn-pink ft-color-edit ft-my-profile ft-icon-small icon-btn-cursor" id="edit"><img src="../assets/icons/user-pen-solid.svg" alt="edit my profile"></a>
            </div>
            <!-- <div class="ft-bg-color-profile ft-tabContent ft-centralTab">
            </div> -->
          </div>
                          
    
          <div class="flex flex-col text-center ft-left-tab" id="stats" :class="{ foreground: foregroundTab === 'stats' }" @click="setForegroundTab('stats')">
            <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Stats</div>
            <div class="ft-tab-content ft-border-color-game ft-tab-border flex flex-row justify-evenly ">
              <!-- <div class="flex flex-col">3</div> -->
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
    
          <div class="flex flex-col text-center ft-right-tab" id="match-history" :class="{ foreground: foregroundTab === 'matchHistory' }" @click="setForegroundTab('matchHistory')">
            <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Match history</div>
            <div id="matchScroll" class="ft-tab-content ft-border-color-game ft-tab-border flex flex-col text-left ft-scrollable">
              <ul>
                <div v-if="gameLog">
                  <div v-if="gameLog.length === 0"><EmptyText :text="'No game to show here'" :white="false" /></div>
                  <!-- <div v-for="(game, index) in gameLog" :key="gameLog.length - index"> -->
                  <div v-for="(game, index) in gameLog" :key="index">
                    <li class="ft-item-title ft-text ft-bb-color-game flex flex-row justify-between items-center" :class="index === gameLog.length - 1 ? '' : 'ft-tab-separator'">
                      <div class="flex flex-col justify-start">
                        <li class="ft-level-text ml-2">{{ formatDate(game.date) }}</li>
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
    <div v-else>
        <section class="ft-container">
            Profile loading...
        </section>
    </div>
</template>
  
<script setup lang="ts">
    import { ref, onBeforeMount } from "vue";
//     import { storeToRefs } from 'pinia'
    import { useRoute, useRouter } from 'vue-router'
    import axios, { AxiosError } from "axios";
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";
    import NavBar from "@/components/NavBar.vue";
//     import { ModelListSelect } from "vue-search-select";
    import EmptyText from "@/components/EmptyText.vue";

        const user = ref({})
        const gameLog = ref([])
        const route = useRoute()
        
        const isUserLoaded = ref<boolean>(false)

        const sessionStore = useSessionStore()
        const userStore = useUserStore()

        loadUserList()

        async function loadUserList() {
            await axios({
            url: `/api/user/profile/${route.params.username}`,
            method: "get",
            headers: { Authorization: `Bearer ${sessionStore.access_token}` },
            })
            .then((response) => {
                user.value = response.data;
                isUserLoaded.value = true;
            })
            .catch((error) => {
                console.error(
                `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
                return;
            });
        }

        async function loadGameHistor() {
            await axios({
            url: `/api/player/log/${user.value.id}`,
            method: "get",
            headers: { Authorization: `Bearer ${sessionStore.access_token}` },
            })
            .then((response) => {
                user.value = response.data;
                isUserLoaded.value = true;
            })
            .catch((error) => {
                console.error(
                `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
                return;
            });
        }



//     type type_user = {
//       id: number;
//       username: string;
//     };

//     const userList = ref<Array<type_user>>([]);
//     const selectedUser = ref<number>();

//     loadUserList();

//     async function loadUserList() {
//       let users = new Array<type_user>();

//       await axios({
//         url: "/api/user/all",
//         method: "get",
//       })
//         .then((response) => {
//           users = response.data;
//         })
//         .catch((error) => {
//           console.error(
//             `unexpected error: ${error.response.status} ${error.response.statusText}`
//           );
//           return;
//         });

//       await axios({
//         url: "/api/user/friend/all",
//         method: "get",
//         headers: { Authorization: `Bearer ${sessionStore.access_token}` },
//       })
//         .then((response) => {
//           users = users.filter(
//             (user) => !response.data?.find((friend) => friend.id === user.id)
//           );
//         })
//         .catch((error) => {
//           console.error(
//             `unexpected error: ${error.response.status} ${error.response.statusText}`
//           );
//           return;
//         });
//       userList.value = users.filter((user) => user.id != userStore.user.id);
//     }
//     // to have the token we need sessionStore
//     const sessionStore = useSessionStore()
    
//     // routes
//     const route = useRoute()
//     const router = useRouter()
    
//     // we need userStore and a variable to check if logged in
//     const userStore = useUserStore()
//     const isLoggedIn = ref(false);

//     // other variables
//     const foregroundTab = ref('')
//     const newFriend = ref('')
//     let allUsers: { id: number, username: string }[];

//     const { user, friends, invites, blocked, invitesSent, gameLog } = storeToRefs(userStore)

//     function setForegroundTab(tab) {
//       foregroundTab.value = tab
//     }

//     // onBeforeMount is executed before the component is mounted
//     // way of using await because we can't do it in setup
//     onBeforeMount(async () => {
//         if (sessionStore.isLoggedIn) {
//             isLoggedIn.value = true;

//             // get user infos, friends, and invitations
//             await userStore.getMe(sessionStore.access_token);
//             if (user.value.isLogged) {
//                 await userStore.getFriends(sessionStore.access_token);
//                 await userStore.getInvites(sessionStore.access_token);
//                 await userStore.getBlockedUsers(sessionStore.access_token);
//                 await userStore.getInvitesSent(sessionStore.access_token);
//                 await userStore.getGameHistory(sessionStore.access_token);
//             } else {
//                 isLoggedIn.value = false;
//                 sessionStore.isLoggedIn = false;
//                 sessionStore.access_token = "";
//                 router.push({ name: 'login' })
//             }
//         }
//     });

//     // list all users
//     axios({
//         url: "/api/user/all",
//         method: "get",
//         headers: { },
//     })
//         .then((response) => {
//         allUsers = response.data;
//         console.log("all users loaded");
//         })
//         .catch((error) => {
//             console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`);
//     });


//     async function validateSelection() {
//       console.log(
//         `selected: ${
//           userList.value.find((element) => element.id === selectedUser.value)
//             ?.username
//         }`
//       );
//     }

//     // functions to delete because useless
//     function addFriend() {
//         if (newFriend.value) {
//             userStore.addFriend(newFriend.value, sessionStore.access_token);
//         }
//     }

//     function formatDate(dateString: string) {
//       const dateObj = new Date(dateString);
//       return dateObj.toLocaleDateString('fr-FR', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//       })
//     }

//     function acceptFriend(friendname) {
//         userStore.acceptFriend(friendname, sessionStore.access_token);
//     }

//     function iDontWantToBeFriend(friendname) {
//         userStore.declineFriend(friendname, sessionStore.access_token);
//     }

//     function removeFriend(friendname) {
//         userStore.delFriend(friendname, sessionStore.access_token)
//     }

//     function blockUser(username) {
//         userStore.blockUser(username, sessionStore.access_token)
//     }

//     function blockUserAndDelInvite(username) {
//         userStore.blockUser(username, sessionStore.access_token)
//         userStore.declineFriend(username, sessionStore.access_token);
//     }

//     function unblockUser(username) {
//         userStore.unblockUser(username, sessionStore.access_token)
//     }

//     function getGameHistory(username) {
//         userStore.getGameHistory(username, sessionStore.access_token);
//     }
    
//     // SCRIPT DAVI 2FA DEBUT ********************************************************************

// const tfa_code = ref("");
// const tfa_email = ref("");
// const show_tfa_enable_disable_confirmation = ref(false);
// let tfaRegistrationEnable = true;

// async function tfaEnable() {
//   if (!tfa_email.value.length) {
//     console.log("email must not be empty");
//     return;
//   }
//   await axios({
//     url: "/api/auth/2fa/enable",
//     method: "patch",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${sessionStore.access_token}`,
//     },
//     data: { email: tfa_email.value },
//   })
//     .then(() => {
//       console.log("code has been sent");
//       show_tfa_enable_disable_confirmation.value = true;
//       tfaRegistrationEnable = true;
//     })
//     .catch((error) => {
//       if (error.response?.status === 409) {
//         show_tfa_enable_disable_confirmation.value = true;
//         tfaRegistrationEnable = true;
//       }
//       console.error(`${error.response.status} ${error.response.statusText}`);
//     });
// }

// async function tfaDisable() {
//   await axios({
//     url: "/api/auth/2fa/disable",
//     method: "patch",
//     headers: {
//       Authorization: `Bearer ${sessionStore.access_token}`,
//     },
//   })
//     .then(() => {
//       console.log("code has been sent");
//       show_tfa_enable_disable_confirmation.value = true;
//       tfaRegistrationEnable = false;
//     })
//     .catch((error) => {
//       if (error.response?.status === 409) {
//         show_tfa_enable_disable_confirmation.value = true;
//         tfaRegistrationEnable = false;
//       }
//       console.error(`${error.response.status} ${error.response.statusText}`);
//     });
// }

// async function validate2FARegistration() {
//   if (tfa_code.value.length == 0) {
//     console.log("please insert code");
//     return;
//   }
//   await axios({
//     url: `/api/auth/2fa/${tfaRegistrationEnable ? "enable" : "disable"}/confirm`,
//     method: "patch",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${sessionStore.access_token}`,
//     },
//     data: { code: tfa_code.value.trim() },
//   })
//     .then(() => {
//       userStore.getMe(sessionStore.access_token);
//       tfa_code.value = "";
//       show_tfa_enable_disable_confirmation.value = false;
//     })
//     .catch((error: AxiosError) => {
//       console.error(`${error.response?.status} ${error.response?.statusText}`);
//     });
// }

// function cancelTfaEnableDisable() {
//   show_tfa_enable_disable_confirmation.value = false;
// }
//     // SCRIPT DAVI 2FA FIN **********************************************************************
</script>

<style scoped>

#other-tab-container {
    position: absolute;
    top: 1.4rem;
    left: 14rem;
    overflow: hidden;
}

#other-profile-tab {
    height: 0;
    font-size: 1.6em;
    border-right: 1em solid var(--invisible);
    border-left: 1em solid var(--invisible);
    padding: 0 22px;
    border-bottom-width: 1.5em;
    border-bottom-style: solid;
    border-bottom-color: var(--light-purple);
    font-family: 'Array', 'Audiowide', monospace;
    font-style: normal;
    transition: bottom .5s ease;
    display: inline-block;
    position: relative;
    bottom: -5rem;
    animation: tabUp ease 1s forwards;
}

@keyframes tabUp {
  from {bottom: -5rem;}
  to {bottom: 0;}
}

.foreground {
  z-index: 999;
}

#ft-bottom-line {
  width: 100%;
  border-bottom: 4px solid var(--light-purple);
  position: fixed;
  bottom: 0;
  z-index: 10000;
}

.ft-cover {
    background: url(./../assets/img/fond.png);
    /* background: url(./../assets/img/jr-korpa-9XngoIpxcEo-unsplash.jpg); */
}

.ft-profile-pic#current-profile-pic {
  position: relative;
  top: 3em;
  z-index:1;
  background-size: cover !important;
}

.ft-central-tab-container {
  position: relative;
  top: -16em;
  left: 50vw;
  transform: translateX(-50%);
}

.ft-tab-content {
  min-width: 100%;
  /* width: 100%; */
  box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
}

.ft-central-tab-container.ft-tab-content {
  background: var(--light-purple);
}

.ft-connection-circle#current-profile-pic {
  position:relative;
  top: 2.5em;
  z-index:2;
}

.ft-tab-folder {
  width: fit-content;
  border-bottom-style: solid;
  border-bottom-width: 1.5em;
    /* border-bottom: 1.5em solid var(--sunset); */
}

/* .ft-tab-folder.ft-tab-title {
  /* border-bottom: 1.5em solid var(--sunset);
  border-bottom: 1.5em solid;
} */



/* .ft-tabContent#title-profile {
  text-overflow: ellipsis;
} */

#title-profile {
  text-overflow: ellipsis;
    font-size: 2rem;
    width: 10em;
    border-bottom: 1.5em solid var(--light-purple);
}

.ft-tab-content#buttons-container {
  padding: 2em 0 12em 0;
  height: 17rem;
}

.ft-tab-separator {
  padding: 1em;
}

.ft-left-tab#stats {
  position: relative;
  top:-28rem;
  left: 10vw;
  width: 30em;

  z-index: 1;
}

.ft-right-tab#match-history {
  position: relative;
  top:-35em;
  left: 45vw;
  width: 40rem;
}

.ft-tab-border {
  /* width: 30em; */
  border-style: solid;
  border-width: 0.3em;
  padding: 1em 4em 1em 4em;
}

.ft-tab-separator {
  border-bottom-width: 0.3em;
  border-bottom-style:solid;
}

/* Piste : pour perso des barres de défilement, utiliser "PerfectScrollbar" ou "Custom Scrollbar" (JS). */
.ft-scrollable {
  max-height: 20rem;
  min-height: 12rem;
  overflow: auto;
}

.ft-left-tab#friends-requests {
  position: relative;
  top: -40em;
  left: 15vw;
  width: 39em;
  z-index: 1;
}

/* Pour DEBUG seulement, doit s-afficher ou non selon en jeu */
.ft-playing {
  display: none;
}

/* -------------------- */

.ft-left-tab#friends-list {
  position: relative;
  top: -43em;
  left: 40vw;
  width: 41em;
}
.ft-right-tab#sent-requests {
  position: relative;
  top: -45em;
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

.ft-connection-circle.ft-friend-status {
  position:relative;
  top: 2.3rem;
  right: -0.8rem;
  z-index:2;
  align-items: end;
}

.ft-left-tab#friends-search {
  position: relative;
  top: -47em;
  left: 15vw;
  width: 30em;
  z-index: 2;
}
.ft-right-tab#blocked-list {
  position: relative;
  top: -43em;
  left: 33vw;
  width: 41em;
}

.ft-tab-content.ft-tab-border#blocked {
  background: var(--dark-gray);
}

/* POUR DEBUG UNIQUEMENT */

/* .ft-other-profile {
  display: none;
} */

.ft-my-profile {
  display: none;
}

.ft-item-title {
  padding: 1.5em;
}

#profile-container {
    background: var(--gray);
    border: 4px solid var(--light-purple);
    border-radius: 25px 25px 0 0;
    overflow: hidden;
}

#matchScroll::-webkit-scrollbar, 
#friendsScroll::-webkit-scrollbar,
#friendsRequestScroll::-webkit-scrollbar,
#sentRequestsScroll::-webkit-scrollbar,
#blocked::-webkit-scrollbar {
  width: 22px;
}

#matchScroll::-webkit-scrollbar-track,
#friendsRequestScroll::-webkit-scrollbar-track,
#sentRequestsScroll::-webkit-scrollbar-track,
#blocked::-webkit-scrollbar-track,
#friendsScroll::-webkit-scrollbar-track {   
    background: var(--light-purple); 
    border-bottom: .2rem solid var(--purple);
    border-right: .2rem solid var(--purple);
    border-top: .2rem solid var(--mint);
    border-left: .2rem solid var(--mint);   
}

#matchScroll::-webkit-scrollbar-thumb {
    background-color: var(--mint);
    border-bottom: .2rem solid var(--dark-gray);
    border-right: .2rem solid var(--dark-gray);
    border-top: .2rem solid var(--light);
    border-left: .2rem solid var(--light);   
}

#friendsScroll::-webkit-scrollbar-thumb,
#friendsRequestScroll::-webkit-scrollbar-thumb,
#sentRequestsScroll::-webkit-scrollbar-thumb,
#blocked::-webkit-scrollbar-thumb {
    background-color: var(--purple);
    border-bottom: .2rem solid var(--dark-gray);
    border-right: .2rem solid var(--dark-gray);
    border-top: .2rem solid var(--light);
    border-left: .2rem solid var(--light);   
}

/* ^^ POUR DEBUG UNIQUEMENT ^^ */
</style>