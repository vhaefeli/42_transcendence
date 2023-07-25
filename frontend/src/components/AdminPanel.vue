<template>
    <!-- TO DO: croix qui met à jour le texte dans memberlist -->
    <!-- <button class="absolute top-0 right-0"><a class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor" @click="showAdmin = false"><img src="../assets/icons/xmark-solid.svg" alt="quit"></a></button> -->
    <div class="flex">
        <div class="w-1/2 p-3 mr-9">
            <!-- <div class="mb-6">
                <h3 class="ft-admin-title">Name of channel</h3>
                <div class="flex">
                    <input v-model="channelName" :placeholder="props.currentChannel?.name" class="p-1 mr-3 grow" />
                    <a href="#" class="t-btn-pink ft-bg-color-chat ft-btn-admin"><button @click="saveName">save</button></a>
                </div>
            </div> -->
            <div class="mb-6">
                <h3 class="ft-admin-title">Type of channel</h3>
                <div class="flex">
                    <div class="grow mr-3">
                        <div class=" mb-3">
                            <button id="ft-channel-type" class="w-full flex justify-between items-center p-3" @click="toggle">{{ typeOfChannel }}</button>
                            <div id="ft-channel-type-select" class="cursor-pointer mb-3" v-if="active">
                                <div @click="changeType">Public</div>
                                <div @click="changeType">Protected</div>
                                <div @click="changeType">Private</div>
                            </div>
                        </div>
                        <div v-if="typeOfChannel === 'PROTECTED'">
                            <input v-model="ChannelInfos.password" :placeholder="ChannelInfos.password.length > 0 ? ChannelInfos.password : 'new password'" class="p-1 mr-3 w-full" />
                        </div>
                    </div>
                    <a href="#" class="t-btn-pink ft-bg-color-chat ft-btn-admin h-fit"><button @click="saveType">save</button></a>
                </div>
            </div>
            <div class="mb-6">
                <h3 class="ft-admin-title">Manage administrators</h3>
                <div v-for="admin in allAdmins" :key="admin.id">
                    <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center">
                    <ul class="flex flex-row items-center">
                        <li class="ft-text ml-2">{{ admin.username }}</li>
                    </ul>
                    <!-- <ul class="flex flex-row">
                        <li><a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor" @click="acceptFriend(invitation.username)"><img src="../assets/icons/circle-check-solid.svg" alt="accept friend request" title="accept friend request"></a></li>
                        <li><a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click="iDontWantToBeFriend(invitation.username)"><img src="../assets/icons/circle-xmark-solid.svg" alt="decline friend request" title="decline friend request"></a></li>
                        <li><a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor"  @click="blockUserAndDelInvite(invitation.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them" title="block this user"></a></li>
                    </ul> -->
                    </li>  
                </div>    
            </div>
            <div class="mb-6">
                <h3 class="ft-admin-title">Owner</h3>
            </div>
        </div>
        <div class="w-1/2 p-3">
            <div class="mb-6">
                <h3 class="ft-admin-title">People banned</h3>
                <div v-if="allBanned?.length === 0">No user banned</div>
                <div v-for="banned in allBanned" :key="banned.id">
                    <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center">
                    <ul class="flex flex-row items-center">
                        <li class="ft-text ml-2">{{ banned.username }}</li>
                    </ul>
                    <!-- <ul class="flex flex-row">
                        <li><a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor" @click="acceptFriend(invitation.username)"><img src="../assets/icons/circle-check-solid.svg" alt="accept friend request" title="accept friend request"></a></li>
                        <li><a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click="iDontWantToBeFriend(invitation.username)"><img src="../assets/icons/circle-xmark-solid.svg" alt="decline friend request" title="decline friend request"></a></li>
                        <li><a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor"  @click="blockUserAndDelInvite(invitation.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them" title="block this user"></a></li>
                    </ul> -->
                    </li>  
                </div>  
            </div>
            <div class="mb-6">
                <h3 class="ft-admin-title">People muted</h3>
                <div v-if="allMuted?.length === 0">No user muted</div>
                <div v-for="muted in allMuted" :key="muted.id">
                    <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center">
                    <ul class="flex flex-row items-center">
                        <li class="ft-text ml-2">{{ muted.username }}</li>
                    </ul>
                    <!-- <ul class="flex flex-row">
                        <li><a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor" @click="acceptFriend(invitation.username)"><img src="../assets/icons/circle-check-solid.svg" alt="accept friend request" title="accept friend request"></a></li>
                        <li><a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click="iDontWantToBeFriend(invitation.username)"><img src="../assets/icons/circle-xmark-solid.svg" alt="decline friend request" title="decline friend request"></a></li>
                        <li><a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor"  @click="blockUserAndDelInvite(invitation.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them" title="block this user"></a></li>
                    </ul> -->
                    </li>  
                </div>  
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import axios from "axios";
    import { ref } from 'vue'

    const props = defineProps({
        currentChannel: Object,
        sessionStore: Object
    })

    type ChanInfos = {
        channelId: number
        type: string
        ownerId: number
        password: string
        channelName: string
    }

    type UpdateChanInfos = {
      channelId: number
      type: string
      password: string | null
    }

    type UserInList = {
        id: number
      username: string
      avatar_url: string
    }

    const ChannelInfos = ref<ChanInfos>({
        channelId: props.currentChannel.channelId,
        type: props.currentChannel.type,
        ownerId: 1,
        password: '',
        channelName: props.currentChannel.name
    })

    const typeOfChannel = ref(props.currentChannel.type)
    
    const allAdmins = ref<Array<UserInList>>()
    const allBanned = ref<Array<UserInList>>()
    const allMuted = ref<Array<UserInList>>()

    const active = ref(false)

    const isAllAdminsLoaded = ref<boolean>(false)
    const isAllBannedLoaded = ref<boolean>(false)
    const isAllMutedLoaded = ref<boolean>(false)

    function toggle() {
        active.value = !active.value
    }

    function changeType(event) {
        typeOfChannel.value = event.target.innerText.toUpperCase( )
        active.value = !active.value
    }

    function saveType() {
      let password
      if (ChannelInfos.value.password.length > 0) {
        password = ChannelInfos.value.password
      } else {
        password = null
      }
      const newInfos: UpdateChanInfos = {
        channelId: props.currentChannel.channelId,
        type: typeOfChannel.value,
        password: password
      }
      updateChannelType(newInfos)
    }

    async function getAdmins() {
      await axios({
        url: `/api/chat/channel/admin/${props.currentChannel.channelId}`,
        method: "get",
        headers: { Authorization: `Bearer ${props.sessionStore.access_token}` },
      })
        .then((response) => {
          allAdmins.value = response.data[0].admins;
          isAllAdminsLoaded.value = true
          console.log("loaded all admins");
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
    }

    async function updateChannelType(newInfos: UpdateChanInfos) {
      let chanDatas
      if (newInfos.type === 'PROTECTED') {
        chanDatas = newInfos
      } else {
        chanDatas = {
          channelId: newInfos.channelId,
          type: newInfos.type
        }
      }
      console.log(chanDatas)
      await axios({
        url: "/api/chat/channel/change",
        method: "patch",
        headers: { Authorization: `Bearer ${props.sessionStore.access_token}` },
        data: chanDatas
      })
        .then((response) => {
          console.log("Channel sucessfully loaded");
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
    }

    async function getBanned() {
      await axios({
        url: `/api/chat/channel/banned/${props.currentChannel.channelId}`,
        method: "get",
        headers: { Authorization: `Bearer ${props.sessionStore.access_token}` },
      })
        .then((response) => {
          allBanned.value = response.data[0].banned;
          isAllBannedLoaded.value = true
          console.log("loaded all banned users");
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
    }

    async function getMuted() {
      await axios({
        url: `/api/chat/channel/muted/${props.currentChannel.channelId}`,
        method: "get",
        headers: { Authorization: `Bearer ${props.sessionStore.access_token}` },
      })
        .then((response) => {
          allMuted.value = response.data[0].muted;
          isAllMutedLoaded.value = true
          console.log("loaded all muted users");
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
    }

    getAdmins()
    getBanned()
    getMuted()
</script>

<style scoped>
    #ft-channel-type:after {
        content: ">";
        display: inline-block;
        transform: rotate(90deg);
    }

    #ft-channel-type-select {
        background-color: var(--light);
    }

    #ft-channel-type {
        background-color: var(--light);
        margin-right: 1rem;
    }

    a.ft-btn-admin {
        padding: 0 1rem;
    }

    .ft-admin-title {
        font-size: 1.4rem;
        margin-bottom: .4rem;
    }
</style>