<template>
    <div class="flex">
        <div v-if="currentChannel?.ownerId === currentChannel?.userId" class="w-1/2 p-3 mr-9">
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
                <div v-if="sucessMsg.length > 0" class="opacity-40">{{ sucessMsg }}</div>
            </div>
            <div class="mb-6">
                <h3 class="ft-admin-title">Manage administrators</h3>
                <div v-for="admin in allAdmins" :key="admin.id">
                  <div v-if="admin.id !== currentChannel?.userId">
                    <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center">
                    <ul class="flex flex-row items-center">
                        <li class="flex">
                          <p class="ft-text ml-2 mr-3">{{ admin.username }}</p>
                          <a title="Demote this admin" href="#" class="hover:text-white" @click="demote(admin.id, admin.username)">x</a>
                        </li>
                    </ul>
                    </li>
                  </div>
                </div>    
            </div>
        </div>
        <div class="w-1/2 p-3">
            <div class="mb-6">
                <h3 class="ft-admin-title">People banned</h3>
                <div v-if="allBanned?.length === 0">No user banned</div>
                <div v-for="banned in allBanned" :key="banned.id" class="flex">
                  <p href="#" class="ft-text ml-2 mr-3">{{ banned.username }}</p>
                  <a title="unbann this user" href="#" class="hover:text-white" @click="unbann(banned.id, banned.username)">x</a>
                </div>  
            </div>
            <div class="mb-6">
                <h3 class="ft-admin-title">People muted</h3>
                <div v-if="allMuted?.length === 0">No user muted</div>
                <div v-for="muted in allMuted" :key="muted.id" class="flex">
                  <p href="#" class="ft-text ml-2 mr-3">{{ muted.username }}</p>
                  <a title="unmute this user" href="#" class="hover:text-white" @click="unmute(muted.id, muted.username)">x</a>
                </div>  
            </div>
            <div class="mb-6">
              <h3 class="ft-admin-title">Add member</h3>
              <div class="flex flex-row">
                <ModelListSelect
                  :list="addUserList"
                  v-model="selectedUserToAdd"
                  optionValue="id"
                  optionText="username"
                  placeholder="Select channel"
                  class="w-full"
                />
                <div :class="{ 'cursor-not-allowed': !selectedUserToAdd}">
                  <a
                    @click="addUserToChannel"
                    class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"
                    id="ft-add-to-chan-btn"
                    :class="{ 'opacity-50 searchan-noClick': !selectedUserToAdd}">
                    <img src="../assets/icons/plus.svg" alt="send a friend request" title="send them a friend request">
                  </a>
                </div>
              </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import axios from "axios";
    import { ModelListSelect } from "vue-search-select";
    import { ref, onBeforeUnmount } from 'vue'
    import { useToast } from "vue-toastification";

    const props = defineProps({
        currentChannel: Object,
        sessionStore: Object,
    })

    const emits = defineEmits(['updateTypeOfChan', 'adminAction'])

    type ChanInfos = {
        channelId: number
        type: string
        password: string
        channelName: string
    }

    type UpdateChanInfos = {
      ownerId: number
      channelId: number
      type: string
      password: string | null
    }

    type UserInList = {
        id: number
        username: string
        avatar_url: string
    }

    const reloadInfoInterval = setInterval(loadAllInfo, 5000);

    onBeforeUnmount(() => {
      clearInterval(reloadInfoInterval);
    })

    const ChannelInfos = ref<ChanInfos>({
        channelId: props.currentChannel.channelId,
        type: props.currentChannel.type,
        password: '',
        channelName: props.currentChannel.name
    })

    const typeOfChannel = ref(props.currentChannel.type)
    
    const allAdmins = ref<Array<UserInList>>()
    const allBanned = ref<Array<UserInList>>()
    const allMuted = ref<Array<UserInList>>()

    const sucessMsg = ref('')
    const toast = useToast()

    const active = ref(false)

    const isAllAdminsLoaded = ref<boolean>(false)
    const isAllBannedLoaded = ref<boolean>(false)
    const isAllMutedLoaded = ref<boolean>(false)

    // Variables for add user dropdown
    const addUserList = ref<Array<{id: number, username: string}>>([]);
    const selectedUserToAdd = ref<number | undefined>()

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
        ownerId: props.currentChannel.ownerId,
        channelId: props.currentChannel.channelId,
        type: typeOfChannel.value,
        password: password
      }
      updateChannelType(newInfos)
    }

    function unmute(userId: number, username: string) {
      allMuted.value = allMuted.value?.filter(muted => muted.username !== username)
      emits('adminAction', { what: 'unmute', userId: userId, username: username })
    }

    function unbann(userId: number, username: string) {
      allBanned.value = allBanned.value?.filter(banned => banned.username !== username)
      emits('adminAction',  { what: 'unbann', userId: userId, username: username })
    }

    function demote(userId: number, username: string) {
      allAdmins.value = allAdmins.value?.filter(admin => admin.username !== username)
      emits('adminAction',  { what: 'demote', userId: userId, username: username })
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
          ownerId: props.currentChannel.ownerId,
          channelId: newInfos.channelId,
          type: newInfos.type
        }
      }
      await axios({
        url: "/api/chat/channel/change",
        method: "patch",
        headers: { Authorization: `Bearer ${props.sessionStore.access_token}` },
        data: chanDatas
      })
        .then((response) => {
          console.log("Channel sucessfully loaded");
          toast.success('sucessfully changed type of channel to ' + chanDatas.type);
          emits('updateTypeOfChan', chanDatas.type)
        })
        .catch((error) => {
          toast.error(`Error: ${error.response.data.message}`);
          // if (error.response.status == 401) {
          //   const msg = `invalid access token: ${error.response.status} ${error.response.statusText}`
          //   console.log(msg);
          //   toast.error(msg);
          //   // LogOut();
          // } else if (error.response.status == 404) {
          //   const msg = `not found: ${error.response.status} ${error.response.statusText}`
          //   console.log(msg);
          //   toast.error(msg);
          // } else if (error.response.status == 400) {
          //   toast.error(`Error: ${error.response.data.message}`);
          // } else if (error.response.status == 409) {
          //   const msg = `conflict: ${error.response.status} ${error.response.statusText}`
          //   console.log(msg);
          //   toast.error(msg);
          // } else
          //   console.error(
          //     `unexpected error: ${error.response.status} ${error.response.statusText}`
          //   );
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

    async function loadAddUserList() {
      let newAddUserList: Array<{id: number, username: string}> | undefined;
      await axios({
        url: '/api/user/all',
        method: 'get',
      }).then((response) => {
        newAddUserList = response.data;
      });

      let allMembers: Array<{id: number, username: string, avatar_url: string}> | undefined;

      await axios({
        url: `/api/chat/channel/members/${props.currentChannel?.channelId}`,
        method: 'get',
        headers: { Authorization: `Bearer ${props.sessionStore?.access_token}` },
      }).then((response) => {
        allMembers = response.data.members;
      });
      if (allMembers === undefined || newAddUserList === undefined) {
        console.error('error with connectio to back');
        return;
      }
      addUserList.value = newAddUserList.filter((u) => {
        return !(
          allMembers?.find((m) => m.id == u.id) ||
          allBanned.value?.find((m) => m.id == u.id)
        );
      });
    }

    async function addUserToChannel() {
      await axios({
        method: 'patch',
        url: '/api/chat/channel/member/add',
        headers: { Authorization: `Bearer ${props.sessionStore?.access_token}`, 'Content-Type': 'application/json' },
        data: { channelId: props.currentChannel?.channelId, userId: selectedUserToAdd.value },
      }).catch((error) => {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      });
      selectedUserToAdd.value = undefined;
      loadAllInfo();
    }

    async function loadAllInfo() {
      getAdmins();
      getMuted();
      await getBanned();
      loadAddUserList();
    }

    loadAllInfo();
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
