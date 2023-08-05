<template>
    <h2 class="text-[2rem]">You want to quit this channel?</h2>
    <div v-if="chanToQuit?.ownerId === userStore?.user.id">
      <div v-if="isMembersLoaded && isAdminsLoaded && members.length === 1 && admins?.length === 1" class="flex flex-col">
        <p class="p-6">You can quit this channel.<br> There is nobody there.<br> This channel will be removed!</p>
        <a href="#" class="t-btn-pink ft-bg-color-chat ft-color-remove ft-btn-admin h-fit" @click="quitChannel"><button>Quit!</button></a>
      </div>
      <div v-if="isMembersLoaded && isAdminsLoaded && members.length > 1 && admins?.length === 1">There is no other admin.<br> You have to promote someone to quit this channel</div>
      <div v-if="isMembersLoaded && isAdminsLoaded && members.length > 1 && admins?.length > 1" class="flex flex-col">
        <p class="p-6">An admin of this channel will be the next Owner.<br> Bye bye!</p>
        <a href="#" class="t-btn-pink ft-bg-color-chat ft-color-remove ft-btn-admin h-fit" @click="quitChannel"><button>Quit!</button></a>
      </div>
    </div>
    <div v-else class="flex flex-col">
      <p class="p-6">bye bye!</p>
      <a href="#" class="t-btn-pink ft-bg-color-chat ft-color-remove ft-btn-admin h-fit" @click="quitChannel"><button>Quit!</button></a>
    </div>
</template>

<script setup lang="ts">
  import axios from "axios";
  import { ref } from 'vue'

  const props = defineProps({
    sessionStore: Object,
    userStore: Object,
    chanToQuit: Object
  })

  type UserInList = {
      id: number
      username: string
      avatar_url: string
  }

  const emits = defineEmits(['removeChan'])

  const members = ref([])
  const admins = ref<Array<UserInList>>()
  
  const isAdminsLoaded = ref(false)
  const isMembersLoaded = ref(false)

  async function quitChannel() {
    await axios({
      url: '/api/chat/channel/member/remove',
      method: "patch",
      headers: { 
        'Authorization': `Bearer ${props.sessionStore?.access_token}`
      },
      data: { "channelId": props.chanToQuit?.channelId, "userId": props.userStore?.user.id }
    })
      .then((response) => {
        console.log(`You have quit the channel with id ${props.chanToQuit?.channelId}`);
        emits('removeChan', props.chanToQuit?.channelId)
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
    
  async function getAllMembers() {
    await axios({
      url: `/api/chat/channel/members/${props.chanToQuit?.channelId}`,
      method: "get",
      headers: { 
        'Authorization': `Bearer ${props.sessionStore?.access_token}`
      },
    })
      .then((response) => {
        members.value = response.data.members;
        isMembersLoaded.value = true
        console.log(`Members of channel with id ${props.chanToQuit?.channelId} loaded`);
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

  async function getAdmins() {
      await axios({
        url: `/api/chat/channel/admin/${props.chanToQuit?.channelId}`,
        method: "get",
        headers: { Authorization: `Bearer ${props.sessionStore?.access_token}` },
      })
      .then((response) => {
          admins.value = response.data[0].admins;
          isAdminsLoaded.value = true
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

    getAllMembers()
    getAdmins()
</script>

<style scoped>
    
</style>