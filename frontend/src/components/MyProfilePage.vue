<template>
  <NavBar :showProfile="false" :isOtherProfile="false" :userStore="userStore"></NavBar>
    <div id="profile-container">

      <section class="ft-cover flex flex-col items-end justify-end">
      </section>
      <section class="ft-container">
        <div class="flex flex-col items-center text-center max-w-max flex-none ft-central-tab-container">
          <div class="ft-profile-pic" id="current-profile-pic" :style="{ 'background': 'url(' + user.avatar_url + ')' }"></div>
          <div class="ft-connection-circle" id="current-profile-pic"><StatusBubble :status="user.status"></StatusBubble></div>
          <div class="ft-tab-folder" id="title-profile"></div>
          <div class="ft-tab-content ft-bg-color-profile">{{ user.status }}</div>
          <div class="ft-tab-content ft-bg-color-profile ft-title truncate" id="username">{{ user.username }}</div>
          <div class="ft-tab-content ft-bg-color-profile" id="buttons-container">
            <a @click="router.push('/user/edit')" title="edit your profile" class="t-btn-pink ft-color-edit ft-my-profile ft-icon-small icon-btn-cursor" id="edit" ><img src="../assets/icons/user-pen-solid.svg" alt="edit my profile"></a>
          </div>
        </div>

        <div class="flex flex-col text-center ft-left-tab" id="stats" :class="{ foreground: foregroundTab === 'stats' }" @click="setForegroundTab('stats')">
          <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Stats</div>
          <div class="ft-tab-content ft-border-color-game ft-tab-border flex flex-row justify-evenly ">
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

        <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-requests" :class="{ foreground: foregroundTab === 'friendsRequest' }" @click="setForegroundTab('friendsRequest')">
          <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friend requests</div>
          <div id="friendsRequestScroll" class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
            <ul>
              <div v-if="invites">
                <div v-if="invites.length === 0"><EmptyText :text="'No one wants to be your friend...yet!'" :white="false" /></div>
                <div v-for="(invitation, index) in invites" :key="index">
                  <li class="ft-clickable-profile ft-item-title p-0 ft-text ft-bb-color-profile flex flex-row justify-between items-center" :class="index === invites.length - 1 ? '' : 'ft-tab-separator'" v-on:click="router.push(`/user/${invitation.username}`)">
                    <ul class="flex flex-row items-center">
                      <li class="ft-profile-pic ft-friend-pic"></li>
                      <li class="ft-text ml-2 truncate" style="max-width: 10rem;">{{ invitation.username }}</li>
                    </ul>
                    <ul class="flex flex-row">
                      <li><a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor" @click.stop="acceptFriend(invitation.username)"><img src="../assets/icons/circle-check-solid.svg" alt="accept friend request" title="accept friend request"></a></li>
                      <li><a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click.stop="iDontWantToBeFriend(invitation.username)"><img src="../assets/icons/circle-xmark-solid.svg" alt="decline friend request" title="decline friend request"></a></li>
                      <li><a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor"  @click.stop="blockUserAndDelInvite(invitation.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them" title="block this user"></a></li>
                    </ul>
                  </li>  
                </div>
              </div>  
            </ul>
          </div>
        </div>

        <div class="flex flex-col text-center ft-right-tab ft-my-profile" id="sent-requests" :class="{ foreground: foregroundTab === 'sentRequests' }" @click="setForegroundTab('sentRequests')">
          <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Sent requests</div>
          <div id="sentRequestsScroll" class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
            <ul>
              <div v-if="invitesSent">
                <div v-if="invitesSent.length === 0"><EmptyText :text="`No pending request!`" :white="false" /></div>
                  <div v-for="(invitation, index) in invitesSent" :key="index">
                      <li class="ft-clickable-profile ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center" :class="index === invitesSent.length - 1 ? '' : 'ft-tab-separator'" v-on:click="router.push(`/user/${invitation.username}`)">
                        <ul class="flex flex-row items-center">
                          <li class="ft-profile-pic ft-friend-pic"></li>
                          <li class="ft-text ml-2 truncate" style="max-width: 10rem;">{{ invitation.username }}</li>
                        </ul>
                      </li> 
                  </div>
              </div> 
            </ul>
          </div>
        </div>

        <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-list" :class="{ foreground: foregroundTab === 'friends' }" @click="setForegroundTab('friends')">
          <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends</div>
          <div id="friendsScroll" class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
            <ul>
              <div v-if="friends.length === 0"><EmptyText :text="'You have no friends... Too bad!'" :white="false" /></div>
              <div v-for="(friend, index) in friends" :key="index">
                  <div v-if="!friend.is_blocked">
                    <li class="ft-item-title p-0 ft-text ft-bb-color-profile flex flex-row justify-between" :class="index === friends.length - 1 ? '' : 'ft-tab-separator'">
                      <div class="flex flex-row justify-between ft-clickable-profile" v-on:click="router.push(`/user/${friend.username}`)">
                        <div class="flex flex-row items-center">
                          <div class="flex flex-col">
                            <div class="ft-profile-pic ft-friend-pic">
                              <div class="ft-connection-circle ft-friend-status"><StatusBubble :status="friend.status"></StatusBubble>
                                <!-- <img src="../assets/icons/tennisBallBlack.png" alt="is playing" title="your friend is playing" class="ft-playing"> -->
                              </div>
                            </div>
                          </div>
                          <ul class="flex flex-col justify-center">
                            <li class="ft-text ml-2 truncate" style="max-width: 10rem;">{{ friend.username }}</li>
                            <li class="ft-level-text ml-2">Pitaya level TO DO</li>
                          </ul>
                        </div>
                        <ul class="flex flex-row">
                          <router-link :to="{ name: 'game-settings', query: { inviteUserId: friend.id } }" @click.stop="" class="t-btn-pink ft-bg-color-game ft-icon-small icon-btn-size icon-btn-cursor"><img src="../assets/icons/table-tennis-paddle-ball-solid.svg" alt="invite to play a game with them" title="invite them to play a game"></router-link>
                          <router-link :to="{ name: 'dms', query: { recipient: friend.id } }" @click.stop="" class="t-btn-pink ft-bg-color-chat ft-icon-small icon-btn-size icon-btn-cursor"><img src="../assets/icons/message-solid.svg" alt="send them a message"></router-link>
                          <li><a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor" @click.stop="blockUser(friend.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them" title="block this user"></a></li>
                          <li><a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click.stop="removeFriend(friend.username)"><img src="../assets/icons/user-minus-solid.svg" alt="remove friendship" title="remove this person from your friends"></a></li>
                        </ul>
                      </div>
                    </li>
                  </div>
              </div>
            </ul>
          </div>
        </div>

        <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-search" :class="{ foreground: foregroundTab === 'search' }" @click="setForegroundTab('search')">
          <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Add a new friend</div>
          <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left">
              <div class="flex flex-row justify-center">
                <ModelListSelect
                  :list="userSearchList"
                  v-model="searchSelectedUserId"
                  optionValue="id"
                  optionText="username"
                  placeholder="Add a friend by username"
                  class="dropdown"
                />
                <div :class="{ 'cursor-not-allowed': !searchSelectedUserId}">
                  <a
                    @click="addFriend"
                    class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"
                    :class="{ 'opacity-50 searchan-noClick': !searchSelectedUserId}">
                    <img src="../assets/icons/user-plus-solid.svg" alt="send a friend request" title="send them a friend request">
                  </a>
                </div>
              </div>
          </div>
        </div>

        <div class="flex flex-col text-center ft-right-tab ft-my-profile" id="blocked-list">
          <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Blocked users</div>
          <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable" id="blocked">
            <ul>
              <div v-if="blocked">
                  <div v-if="blocked.length === 0"><EmptyText :text="`You didn't block anybody`" :white="true" /></div>
                  <div v-for="(block, index) in blocked" :key="index">
                    <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between" :class="index === blocked.length - 1 ? '' : 'ft-tab-separator'">
                      <div class="flex flex-row justify-between ft-clickable-profile" v-on:click="router.push(`/user/${block.username}`)">
                        <div class="flex flex-row items-center">
                          <div class="flex flex-col">
                            <div class="ft-profile-pic ft-friend-pic"></div>
                          </div>
                          <ul class="flex flex-col justify-center ft-text-light-gray">
                            <li class="ft-text ml-2 truncate" style="max-width: 10rem;">{{ block.username }}</li>
                            <li class="ft-level-text ml-2 "><p v-if="block.is_friend">is my friend</p></li>
                          </ul>
                        </div>
                        <ul class="flex flex-row">
                          <li><a class="t-btn-pink ft-color-unblock ft-icon-small icon-btn-size icon-btn-cursor" @click.stop="unblockUser(block.username)"><img src="../assets/icons/person-circle-check-solid.svg" alt="unblock them" title="unblock this person"></a></li>
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
    
    <div id="ft-bottom-line"></div>

</template>
  
<script setup lang="ts">
    import { ref, onBeforeMount, watch, onBeforeUnmount } from "vue";
    import { storeToRefs } from 'pinia'
    import { useRoute, useRouter } from 'vue-router'
    import axios, { AxiosError } from "axios";
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";
    import NavBar from "@/components/NavBar.vue";
    import { ModelListSelect } from "vue-search-select";
    import EmptyText from "@/components/EmptyText.vue";
    import StatusBubble from "@/components/StatusBubble.vue";
    import OtherUserProfile from "../components/OtherUserProfile.vue";
    import { statusService } from "@/services/status-socket.service";

    type type_user = {
      id: number;
      username: string;
    };

    const emits = defineEmits(['addRecipient'])

    // const props = defineProps({
    //   recipients: Array<number>,
    //   userStore: Object,
    // })
    
    const actualInfos = ref({});
    const FromFriendToNotFriend = ref(false)
    const isActualInfosLoaded = ref(false)
    
    // to have the token we need sessionStore
    const sessionStore = useSessionStore()
    
    // routes
    const route = useRoute()
    const router = useRouter()
    
    // we need userStore and a variable to check if logged in
    const userStore = useUserStore()
    const isLoggedIn = ref(false);

    // user search dropdown
    let allUsers: Array<type_user>;
    const userSearchList = ref<Array<type_user>>([]);
    const searchSelectedUserId = ref<number>();

    // other variables
    const foregroundTab = ref('')
    let loadInfoInterval: ReturnType<typeof setInterval>;
    const { user, friends, invites, blocked, invitesSent, gameLog } = storeToRefs(userStore)

    // onBeforeMount is executed before the component is mounted
    // way of using await because we can't do it in setup
    onBeforeMount(async () => {
      isLoggedIn.value = true;
      loadAllInfo();

      statusService.onConnect(() => {
        userStore.getMe(sessionStore.access_token);
      },
      { timeout: 10000 });

      loadInfoInterval = setInterval(loadAllInfo, 5000);
    });

    onBeforeUnmount(() => {
      clearInterval(loadInfoInterval);
    });

    async function loadAllInfo() {
      // get user infos, friends, and invitations
      await userStore.getMe(sessionStore.access_token);
      if (user.value.isLogged) {
        userStore.getFriends(sessionStore.access_token);
        userStore.getInvites(sessionStore.access_token);
        userStore.getBlockedUsers(sessionStore.access_token);
        userStore.getInvitesSent(sessionStore.access_token);
        userStore.getGameHistory(sessionStore.access_token);
      } else {
        router.push('/login?logout=true');
      }
      // get all users
      await axios({
          url: "/api/user/all",
          method: "get",
        })
        .then((response) => {
          allUsers = response.data;
          console.log("all users loaded");
        })
        .catch((error) => {
          console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`);
      });
      loadUserSearchList();
    }

    async function loadUserSearchList() {
      userSearchList.value = allUsers.filter((user) => {
        return !(
          userStore.user.id === user.id ||
          userStore.friends.find((friend) => friend.id === user.id) ||
          userStore.invites.find((invite) => invite.id === user.id) ||
          userStore.invitesSent.find((invite) => invite.id === user.id)
        );
      });
      return;
    }

    // functions to delete because useless // maybe not so useless (not useless indeed)
    async function addFriend() {
      if (searchSelectedUserId.value != undefined) {
        const user = userSearchList.value.find((user) => user.id === searchSelectedUserId.value);
        if (user)
          await userStore.addFriend(user.username, sessionStore.access_token);
        searchSelectedUserId.value = undefined;
        await userStore.getInvitesSent(sessionStore.access_token);
        loadUserSearchList();
        // davi: i don't know what the following line does
        actualInfos.value.is_pendingInvitation = true;
      }
    }

    function setForegroundTab(tab) {
      foregroundTab.value = tab
    }

    // formatage de la date pour un affichage sous la forme "01/01/2023"
    function formatDate(dateString: string) {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
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

.ft-item-title {
  padding: 1.5em;
}

.ft-clickable-profile {
  @apply p-4 w-full;
}

.ft-clickable-profile:hover {
  @apply cursor-pointer rounded;
  backdrop-filter: brightness(1.40);
  border-radius: 0.8rem;
}

#username {
  /* if i don't do this wrapping doesn't work...
     i couldn't find a better solution -df */
  max-width: 10rem;
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

</style>
