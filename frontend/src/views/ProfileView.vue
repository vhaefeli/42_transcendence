<template>

<!-- CODE DE MICHELE -->
    <NavBar></NavBar>
    <div id="profile-container">
        <h1 class="mt-9">Profile page</h1>
        <router-link to="/login">back to login</router-link>
        <!-- Nadia: tu pourra tout remove et afficher correctement. Toutes les classes sont du Tailwind. -->
    
        <!-- check si on est sur son propre profile -->
        <div v-if="user && user.isLogged && user.username == route.params.username" class="flex flex-col items-center">
            <div class="flex mb-9 w-[60%]">
                <img :src="user.avatar_url" alt="avatar img" class="mr-9"/>
                <div class="mr-9">
                    <!-- profile -->
                    <p>username: {{ user.username }}<br />id: {{ user.id }}</p>
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
            <div class="mb-9 font-size w-[60%]">
                <!-- list of friends -->
                <h2 class="text-2xl mb-4">My friends</h2>
                <div v-for="friend in friends" :key="friend.id" class="flex justify-between border-4 border-sky-500 p-3 mb-1">
                    <div v-if="!friend.is_blocked">
                        <div>
                            <p>id: {{ friend.id }}</p>
                            <p>name: {{ friend.username }}</p>
                        </div>
                        <button
                            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            @click="removeFriend(friend.username)"
                            >
                                remove friendship
                            </button>
                        <button
                            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            @click="blockUser(friend.username)"
                            >
                                block this friend
                            </button>  
                    </div>
                </div>
            </div>
            <div class="w-[60%] mb-9">
                <!-- list of pending invitations -->
                <h2 class="text-2xl mb-4">Invitations sent</h2>
                <div v-if="invitesSent">
                    <div v-for="invitation in invitesSent" :key="invitation.id" class="flex justify-between border-4 border-sky-500 p-3">
                        <div class="">
                            <p>id: {{ invitation.id }}</p>
                            <p>name: {{ invitation.username }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-[60%] mb-9">
                <!-- list of pending invitations -->
                <h2 class="text-2xl mb-4">Pending invitations</h2>
                <div v-if="invites">
                    <div v-for="invitation in invites" :key="invitation.id" class="flex justify-between border-4 border-sky-500 p-3">
                        <div class="">
                            <p>id: {{ invitation.id }}</p>
                            <p>name: {{ invitation.username }}</p>
                        </div>
                        <button
                        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        @click="acceptFriend(invitation.username)"
                        >
                            accept friend
                        </button>
                        <button
                        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        @click="blockUserAndDelInvite(invitation.username)"
                        >
                            block this user
                        </button>
                        <button
                        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        @click="iDontWantToBeFriend(invitation.username)"
                        >
                            i don't want to be friend
                        </button>
                    </div>
                </div>
            </div>
            <div class="w-[60%] mb-9">
                <!-- list of pending invitations -->
                <h2 class="text-2xl mb-4">Blocked users</h2>
                <div v-if="blocked">
                    <div v-for="block in blocked" :key="block.id" class="flex justify-between border-4 border-sky-500 p-3">
                        <div class="">
                            <p>id: {{ block.id }}</p>
                            <p>name: {{ block.username }}</p>
                        </div>
                        <p v-if="block.is_friend">friend</p>
                        <button
                        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        @click="unblockUser(block.username)"
                        >
                            unblock
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>something went wrong</p>
        </div>
    
        <router-link to="/search-users">Search for users</router-link>
    </div>
<!-- CODE DE MICHELE CI-DESSUS -->


  <section class="ft-cover flex flex-col items-end justify-end">
    <a class="ft-bg-color-chat t-btn-pink ft-other-profile"><span>Send message</span></a>
    <a class="ft-bg-color-game t-btn-pink ft-other-profile"><span>Invite to play</span></a>
  </section>

  <section class="ft-container">
    <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container">
      <div class="ft-profile-pic" id="current-profile-pic"></div>
      <!-- ajouter la valeur ft-circle-green ou ft-circle-gray selon le statut de connexion de la personne -->
      <div class="ft-connection-circle" id="current-profile-pic"></div>
      <div class="ft-tab-folder" id="title-profile"></div>
      <!-- Par defaut en ligne -->
      <div class="ft-tab-content ft-bg-color-profile">Online</div>
      <div class="ft-tab-content ft-bg-color-profile ft-title" id="username">
          Pouetteuuh
      </div>
      <!-- <div class="ft-tabContent ft-centralTab" id="buttonsContainer"> -->
      <div class="ft-tab-content ft-bg-color-profile" id="buttons-container">
        <!-- Bouton pour ajouter la personne en ami (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-add ft-other-profile"><span>[+]</span></a>
        <!-- Bouton pour bloquer la personne (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-block ft-other-profile" id="block"><span>[blk]</span></a>


        <!-- Bouton pour editer son profil (SON profil uniquement) -->
        <!-- <a class="t-btn-pink ft-color-edit ft-my-profile" id="edit"><span>[ed.]</span></a> -->
        <a class="t-btn-pink ft-color-edit ft-my-profile ft-icon-small" id="edit"><img src="../assets/img/icons/user-pen-solid.svg" alt="edit my profile"></a>
      </div>
      <!-- <div class="ft-bg-color-profile ft-tabContent ft-centralTab">
      </div> -->
    </div>
                    

    <div class="flex flex-col text-center ft-left-tab" id="stats">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Stats</div>
      <div class="ft-tab-content ft-border-color-game ft-tab-border flex flex-row justify-evenly ">
        <!-- <div class="flex flex-col">3</div> -->
          <div class="ft-item-title ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">23</div>
            <div class="ft-text">matches</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">12</div>
            <div class="ft-text">victories</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">2</div>
            <div class="ft-text">perfect victories</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">Pitaya</div>
            <div class="ft-text">level</div>
          </div>
      </div>
    </div>

    <div class="flex flex-col text-center ft-right-tab" id="match-history">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Match history</div>
      <div class="ft-tab-content ft-border-color-game ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left ft-scrollable">
        <ul>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">
            <p><h2>12.05.2023</h2></p>
            lost against Thingy (Pitaya level)</li>
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
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Thingy</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>

          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE THINGY CI-DESSOUS. NE PAS MODIFIER ICI-->
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Cerise</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Annabelle</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Jean-Pierre</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <!-- Le dernier element n'a pas la classe ft-tab-separator -->
          <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">John</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE THINGY CI-DESSOUS. NE PAS MODIFIER ICI-->
        </ul>
      </div>
    </div>

    <div class="flex flex-col text-center ft-right-tab ft-my-profile" id="friends-list">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
        <ul>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status">
                    <img src="../assets/img/icons/tennisBallBlack.png" alt="is playing" class="ft-playing">
                  </div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Jean-Eudes</li>
                <li class="ft-level-text ml-2">Pitaya level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE JEAN-EUDES CI-DESSOUS. NE PAS MODIFIER ICI-->
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status">
                    <img src="../assets/img/icons/tennisBallBlack.png" alt="is playing" class="ft-playing">
                  </div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Chris</li>
                <li class="ft-level-text ml-2">Lemongrass level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status">
                    <img src="../assets/img/icons/tennisBallBlack.png" alt="is playing" class="ft-playing">
                  </div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Danielle</li>
                <li class="ft-level-text ml-2">Cherry tomato level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <!-- Le dernier element n'a pas la classe ft-tab-separator -->
          <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status">
                    <img src="../assets/img/icons/tennisBallBlack.png" alt="is playing" class="ft-playing">
                  </div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Pouette</li>
                <li class="ft-level-text ml-2">Yam level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE JEAN-EUDES CI-DESSUS. NE PAS MODIFIER ICI -->
        </ul>
      </div>
    </div>

    <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-search">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Add a new friend</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left">
          <div class="flex flex-row justify-center">
            <input type="text" placeholder="Search by username">
            <a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/user-plus-solid.svg" alt="send a friend request"></a>
          </div>
      </div>
    </div>
    
  </section>
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

    const { user, friends, invites, blocked, invitesSent } = storeToRefs(userStore)

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
  background: url(./../assets/img/chat.png);
  background-size: cover;
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
    /* border-bottom: 1.5em solid var(--mint); */
}

/* .ft-tab-folder.ft-tab-title {
  /* border-bottom: 1.5em solid var(--mint);
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
  height: 20em;
  overflow: auto;
}

.ft-left-tab#friends-requests {
  position: relative;
  top:-40em;
  left: 15vw;
  width: 52em;
}

/* Pour DEBUG seulement, doit s-afficher ou non selon en jeu */
.ft-playing {
  display: none;
}

/* -------------------- */

.ft-right-tab#friends-list {
  position: relative;
  top:-48em;
  left: 40vw;
  width: 50em;
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
  top:-52em;
  left: 15vw;
  width: 30em;
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
}

</style>
