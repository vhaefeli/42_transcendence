<template>
      <div id="ft-user-profile-container">
          <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container mb-6">
              <div v-if="isActualInfosLoaded" class="ft-profile-pic" id="current-profile-pic" :style="{ 'background': 'url(' + actualInfos.avatar_url + ')' }"></div>
              <div v-else class="ft-profile-pic" id="current-profile-pic"></div>
  
              <div v-if="!FromFriendToNotFriend"><div class="ft-status-bubble-position"><StatusBubble :status="actualInfos.status" /></div></div>
              <!-- les angles de la box -->
              <div class="ft-tab-folder" id="title-profile"></div>
              <div v-if="!FromFriendToNotFriend" class="ft-tab-content ft-bg-color-profile">{{ actualInfos.status }}</div>
              <div v-if="isActualInfosLoaded" class="ft-tab-content ft-bg-color-profile ft-title" id="username">{{ actualInfos.username }}</div>
              <div v-else class="ft-tab-content ft-bg-color-profile ft-title" id="username"></div>
              <div class="ft-tab-content ft-bg-color-profile flex flex-col items-center p-6">
                  <div v-if="actualInfos.is_friend" class="mb-3">
                      <a title="remove friendship" class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click="removeFriend(username)"><img src="../assets/icons/user-minus-solid.svg" alt="remove friendship"></a>
                  </div>
                  <div v-else class="mb-6">
                      <div v-if="actualInfos.is_pendingInvitation" class="max-w-[16rem;]">
                        <div v-if="isActualInfosLoaded">
                          <p>There is a pending friend request.</p>
                          <p>Manage it on <router-link class="underline" :to= "'/user/' + props.userStore.user.username">my profile</router-link></p>
                        </div>
                        <div v-else>
                          <p>Loading...</p>
                        </div>
                      </div>
                      <div v-else>
                          <a title="Request friendship" class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor" @click="addFriend()"><img src="../assets/icons/user-plus-solid.svg" alt="send a friend request"></a>
                      </div>
                  </div>
                  <div v-if="actualInfos.is_blocked">
                      <a title="Unblock this user" class="t-btn-pink ft-color-unblock ft-icon-small icon-btn-size icon-btn-cursor" @click="unblockUser(actualInfos.username)"><img src="../assets/icons/person-circle-check-solid.svg" alt="unblock them"></a>
                  </div>
                  <div v-else class="flex flex-col items-center">
                      <a title="Block this user" class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor" @click="blockUser(actualInfos.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them"></a>
                  </div>
              </div>
          </div>
          <div class="flex flex-col pr-9">
              <router-link class="ft-bg-color-profile t-btn-pink ft-other-profile mb-3" :to= "'/user/' + actualInfos.username">See profile</router-link>
              <!-- TO DO: link to game setting + send username of the person you want to play with -->
              <router-link class="ft-bg-color-game t-btn-pink ft-other-profile mb-3" to="/game">Invite to play</router-link>
          </div>
      </div>
</template>

<script setup>
    import StatusBubble from "../components/StatusBubble.vue";
    import { ref, defineEmits, watch, watchEffect } from 'vue'
    import axios from "axios";

    const actualInfos = ref({})

    const FromFriendToNotFriend = ref(false)
    const isActualInfosLoaded = ref(false)

    const emits = defineEmits(['updateBlocked'])

    const props = defineProps({
        username: String,
        sessionStore: Object,
        userStore: Object,
    })

    function addFriend() {
        props.userStore.addFriend(props.username, props.sessionStore.access_token)
        actualInfos.value.is_pendingInvitation = true
    }

    function removeFriend(friendname) {
        props.userStore.delFriend(friendname,  props.sessionStore.access_token)
        actualInfos.value.is_friend = false
    }

    function unblockUser(username) {
        props.userStore.unblockUser(username, props.sessionStore.access_token)
        actualInfos.value.is_blocked = false
        emits('updateBlocked', actualInfos.value.is_blocked)
    }

    function blockUser(username) {
        props.userStore.blockUser(username, props.sessionStore.access_token)
        actualInfos.value.is_blocked = true
        emits('updateBlocked', actualInfos.value.is_blocked)
    }

    async function getUserInfos(username) {
      await axios({
        url: `/api/user/profile/${username}`,
        method: "get",
        headers: { Authorization: `Bearer ${props.sessionStore.access_token}` },
      })
        .then((response) => {
          actualInfos.value = response.data
          isActualInfosLoaded.value = true
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

    watch(actualInfos, () => {
      emits('updateBlocked', actualInfos.value.is_blocked)
    })

    watchEffect(() => {
      if(props.username) {
        getUserInfos(props.username)
      }
    })

</script>

<style scoped>

    .ft-status-bubble-position {
        z-index: 2;
        position: relative;
        top: 2.5rem;
    }

    #ft-user-profile-container {
        position: relative;
        left: 1rem;
        z-index: 9;
    }

    #title-profile {
        text-overflow: ellipsis;
        font-size: 2rem;
        width: 10em;
        border-bottom: 1.5em solid var(--light-purple);
    }

    .ft-profile-pic#current-profile-pic {
        position: relative;
        top: 3em;
        z-index:1;
        background-size: cover !important;
    }
    .ft-tab-content {
        min-width: 100%;
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
</style>