<template>

  <NavBar></NavBar>
  <div id="profile-container">
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
                      

      <div class="flex flex-col text-center ft-left-tab" id="stats">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Stats</div>
        <div class="ft-tab-content ft-border-color-game ft-tab-border flex flex-row justify-evenly ">
          <!-- <div class="flex flex-col">3</div> -->
            <div class="ft-item-title ft-bb-color-game flex flex-col">
              <div class="ft-result-drk-text">{{ user.nb_jeux }}</div>
              <div class="ft-text">matches</div>
            </div>
            <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
              <div class="ft-result-drk-text">{{ user.rank }}</div>
              <div class="ft-text">victories</div>
            </div>
            <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
              <div class="ft-result-drk-text">{{ user.nb_match }}</div>
              <div class="ft-text">perfect victories</div>
            </div>
            <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
              <div class="ft-result-drk-text">{{ user.level }}</div>
              <div class="ft-text">level</div>
            </div>
        </div>
      </div>

      <div class="flex flex-col text-center ft-right-tab" id="match-history">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Match history</div>
        <div class="ft-tab-content ft-border-color-game ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left ft-scrollable">
          <ul>
            <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">
              <p><h2>{{ gameLog.date }}</h2></p>
              {{ gameLog.Result }}</li>
              <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">
              <p><h2>13.05.2023</h2></p>
              lost against Thingy (Pitaya level)</li>
            <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">
              <p><h2>14.05.2023</h2></p>
              lost against Thingy (Pitaya level)</li>
            <li class="ft-item-title ft-text ft-bb-color-game">
              <p><h2>22.05.2023</h2></p>
              lost against everyone (Kumquat level)</li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-requests">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends requests</div>
        <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
          <ul>
            <div v-if="invites">
              <div v-if="invites.length === 0">No one wants to be your friend...yet!</div>
              <div v-for="(invitation, index) in invites" :key="index">
                <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center" :class="index === invites.length - 1 ? '' : 'ft-tab-separator'">
                  <ul class="flex flex-row items-center">
                    <li class="ft-profile-pic ft-friend-pic"></li>
                    <li class="ft-text ml-2">{{ invitation.username }}</li>
                  </ul>
                  <ul class="flex flex-row">
                    <li><a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor" @click="acceptFriend(invitation.username)"><img src="../assets/icons/circle-check-solid.svg" alt="accept friend request" title="accept friend request"></a></li>
                    <li><a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click="iDontWantToBeFriend(invitation.username)"><img src="../assets/icons/circle-xmark-solid.svg" alt="decline friend request" title="decline friend request"></a></li>
                    <li><a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor"  @click="blockUserAndDelInvite(invitation.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them" title="block this user"></a></li>
                  </ul>
                </li>  
              </div>
            </div>  
          </ul>
        </div>
      </div>

      <div class="flex flex-col text-center ft-right-tab ft-my-profile" id="sent-requests">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Sent requests</div>
        <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
          <ul>
            <div v-if="invitesSent">
                <div v-for="(invitation, index) in invitesSent" :key="index">
                    <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center" :class="index === invitesSent.length - 1 ? '' : 'ft-tab-separator'">
                      <ul class="flex flex-row items-center">
                        <li class="ft-profile-pic ft-friend-pic"></li>
                        <li class="ft-text ml-2">{{ invitation.username }}</li>
                      </ul>
                    </li> 
                </div>
            </div> 
          </ul>
        </div>
      </div>

      <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-list">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends</div>
        <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
          <ul>
            <div v-for="(friend, index) in friends" :key="index">
                <div v-if="!friend.is_blocked">
                  <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between" :class="index === friends.length - 1 ? '' : 'ft-tab-separator'">
                    <div class="flex flex-row items-center">
                      <div class="flex flex-col">
                        <div class="ft-profile-pic ft-friend-pic">
                          <div class="ft-connection-circle ft-friend-status">
                            <img src="../assets/icons/tennisBallBlack.png" alt="is playing" title="your friend is playing" class="ft-playing">
                          </div>
                        </div>
                      </div>
                      <ul class="flex flex-col justify-center">
                        <li class="ft-text ml-2">{{ friend.username }}</li>
                        <li class="ft-level-text ml-2">Pitaya level TO DO</li>
                      </ul>
                    </div>
                    <ul class="flex flex-row">
                      <li><a class="t-btn-pink ft-bg-color-game ft-icon-small icon-btn-size icon-btn-cursor"><img src="../assets/icons/table-tennis-paddle-ball-solid.svg" alt="invite to play a game with them" title="invite them to play a game"></a></li>
                      <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small icon-btn-size icon-btn-cursor"><img src="../assets/icons/message-solid.svg" alt="send them a message" title="send them a message"></a></li>
                      <li><a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor" @click="blockUser(friend.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them" title="block this user"></a></li>
                      <li><a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click="removeFriend(friend.username)"><img src="../assets/icons/user-minus-solid.svg" alt="remove friendship" title="remove this person from your friends"></a></li>
                    </ul>
                  </li>
                </div>
            </div>
          </ul>
        </div>
      </div>

      <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-search">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Add a new friend</div>
        <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left">
            <div class="flex flex-row justify-center">
              <input type="text" placeholder="Search by username">
              <a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"><img src="../assets/icons/user-plus-solid.svg" alt="send a friend request" title="send them a friend request"></a>
            </div>
        </div>
      </div>

      <div class="flex flex-col text-center ft-right-tab ft-my-profile" id="blocked-list">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Blocked users</div>
        <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable" id="blocked">
          <ul>
            <div v-if="blocked">
                <div v-for="(block, index) in blocked" :key="index">
                  <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between" :class="index === blocked.length - 1 ? '' : 'ft-tab-separator'">
                      <div class="flex flex-row items-center">
                        <div class="flex flex-col">
                          <div class="ft-profile-pic ft-friend-pic"></div>
                        </div>
                        <ul class="flex flex-col justify-center ft-text-light-gray">
                          <li class="ft-text ml-2">{{ block.username }}</li>
                          <li class="ft-level-text ml-2 "><p v-if="block.is_friend">is my friend</p></li>
                        </ul>
                      </div>
                      <ul class="flex flex-row">
                        <li><a class="t-btn-pink ft-color-unblock ft-icon-small icon-btn-size icon-btn-cursor" @click="unblockUser(block.username)"><img src="../assets/icons/person-circle-check-solid.svg" alt="unblock them" title="unblock this person"></a></li>
                      </ul>
                    </li>
                </div>
            </div>
          </ul>
        </div>
      </div>

        <!-- CODE DE MICHELE -->
        <!-- <div id="profile-container"> -->
      
            <!-- check si on est sur son propre profile -->
            <!-- <div v-if="user && user.isLogged && user.username == route.params.username" class="flex flex-col items-center"> -->
                <div class="flex mb-9 w-[60%]">
                    <img :src="user.avatar_url" alt="avatar img" class="mr-9"/>
                    <div class="mr-9">
                        <p v-if="user.twoFA_enabled">2FA is enabled</p>
                        <p v-if="!user.twoFA_enabled">2FA is disabled</p>
                        <p class="mb-6">Status: {{ user.status }}</p>
                        <div class="flex flex-col">
                            <input v-model="newFriend" placeholder="name of friend" /><br />
                            <p>you want to add: {{ newFriend || 'nobody' }} ?</p>
                            <button
                            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            @click="addFriend"
                            >
                            add a friend
                            </button>
                        </div>
                    </div>
                    <div>
                        <h2 class="text-2xl mb-4">All users</h2>
                        <div v-if="allUsers">
                            <div v-for="oderUser in allUsers" :key="oderUser.id">
                                <p>{{ oderUser.username }}</p>
                            </div>
                        </div>
                    </div>   
                </div>
              <!-- </div> -->
            <router-link to="/search-users">Search for users</router-link>
        
  <!-- CODE DE MICHELE CI-DESSUS -->
    </section>
  </div>
</template>
  
<script setup lang="ts">
    import { ref, onBeforeMount } from "vue";
    import { storeToRefs } from 'pinia'
    import { useRoute, useRouter } from 'vue-router'
    import axios from "axios";
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";
    import NavBar from "@/components/NavBar.vue";

    
    // to have the token we need sessionStore
    const sessionStore = useSessionStore()
    
    // routes
    const route = useRoute()
    const router = useRouter()
    
    // we need userStore and a variable to check if logged in
    const userStore = useUserStore()
    const isLoggedIn = ref(false);

    // other variables
    let newFriend = ref('')
    let allUsers: { id: number, username: string }[];
    // let myFriends = ref([]);

    const { user, friends, invites, blocked, invitesSent, gameLog } = storeToRefs(userStore)

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
                router.push({ name: 'login' })
            }
        }
    });

    // list all users
    axios({
        url: "/api/user/all",
        method: "get",
        headers: { },
    })
        .then((response) => {
        allUsers = response.data;
        console.log("all users loaded");
        })
        .catch((error) => {
            console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`);
    });

    // functions to delete because useless
    function addFriend() {
        if (newFriend.value) {
            userStore.addFriend(newFriend.value, sessionStore.access_token);
        }
    }

    function acceptFriend(friendname) {
        userStore.acceptFriend(friendname, sessionStore.access_token);
    }

    function iDontWantToBeFriend(friendname) {
        userStore.declineFriend(friendname, sessionStore.access_token);
    }

    function removeFriend(friendname) {
        userStore.delFriend(friendname, sessionStore.access_token)
    }

    function blockUser(username) {
        userStore.blockUser(username, sessionStore.access_token)
    }

    function blockUserAndDelInvite(username) {
        userStore.blockUser(username, sessionStore.access_token)
        userStore.declineFriend(username, sessionStore.access_token);
    }

    function unblockUser(username) {
        userStore.unblockUser(username, sessionStore.access_token)
    }

    function getGameHistory(username) {
        userStore.getGameHistory(username, sessionStore.access_token);
    }
</script>

<style scoped>

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

.ft-other-profile {
  display: none;
}

/* .ft-my-profile {
  display: none;
} */

.ft-item-title {
  padding: 1.5em;
}

/* ^^ POUR DEBUG UNIQUEMENT ^^ */

#profile-container {
    background: var(--gray);
    border: 4px solid var(--light-purple);
    border-radius: 66px;
    overflow: hidden;
}

</style>
