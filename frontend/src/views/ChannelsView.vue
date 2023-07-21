<template>
    <NavBar :showProfile="true"></NavBar>
    <div class="ft-chat-container">
      <ChatNavBar :whichTab="'channels'"></ChatNavBar>
      <section class="ft-chat-inside-container flex p-6">

        <!-- column 1 with profile -->
        <div id="dm-profile-col" class="w-[18em]">
            <div class="h-[76vh]" :class=" profileToShow.length === 0 ? 'position-cible' : 'position-origine'">
              <MemberList :channelName="currentChannel?.name" :channelType="currentChannel?.type" :isAdmin="currentChannel?.Admin != null" :userStore="userStore" :sessionStore="sessionStore" @set-profile-to-show="(username) => profileToShow = username" @show-admin-panel="showAdmin = !showAdmin"/>
            </div>
            <div class="h-[76vh]" :class="profileToShow.length > 0 ? 'position-cible' : 'position-origine'">
              <OtherUserProfile :key="profileToShow" :username="profileToShow" :userStore="userStore" :sessionStore="sessionStore" />
              <button title="Back to member list" id="ft-back-to-list" class="t-btn-pink ft-bg-color-chat" @click="profileToShow = ''">&lt;&lt;&lt;&lt;&lt;</button>
            </div>
        </div>

        <!-- column 2 with messages -->
        <div v-if="currentChannel?.Admin && showAdmin" class="flex grow">
          <!-- admin panel -->
          <div id="ft-admin-panel" class="w-full h-full relative p-11">
            <button class="absolute top-0 right-0"><a class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor" @click="showAdmin = false"><img src="../assets/icons/xmark-solid.svg" alt="quit"></a></button>
            <AdminPanel :currentName="currentChannel.name" :currentType="currentChannel.type"></AdminPanel>
          </div>
        </div>
        <div v-else class="flex grow">
          <div id="dm-msg-col" class="grow relative">
            <div id="ft-scroller" ref="scroller" class="ft-chat-box p-6 overflow-scroll">
                <div v-for="message in messages" :key="message.id">
                  <div v-if="currentChannel.channelId === message.channelId">
                    <div v-if="message.senderId == user.id" class="grid">
                        <div class="ft-msg-container justify-self-end">
                          <p class="text-xs ft-chat-date">{{ message.date }}</p>
                          <p class="ft-chat-my-msg">{{ message.message }}</p>
                        </div>
                    </div>
                    <div v-else>
                        <div class="ft-msg-container">
                          <div class="flex items-center">
                            <div class="ft-profile-pic ft-profile-pic-small mr-3 ft-chat-profile-pic" :style="{ 'background': 'url(' + getMemberImg(message.senderId) + ')' }"></div>
                            <div class="mb-3">
                              <a class="cursor-pointer" @click="profileToShow = getMemberUsername(message.senderId)">{{ getMemberUsername(message.senderId) }}</a>
                              <p class="text-xs ft-chat-date">{{ message.date }}</p>
                            </div>
                          </div>
                          <div class="ml-[3.8rem]">
                            <div v-if="checkIfBlocked(message.senderId)" class="opacity-50 flex"><img class="w-9 h-9 mr-3" src="../assets/icons/person-circle-minus-solid.svg" alt="block them"> You blocked this user.<br> Unblock he/her to see this message</div>
                            <div v-else><p class="text-base mb-1 ft-chat-recipient-msg">{{ message.message }}</p></div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
  
            <div class="ft-bg-dark-gray flex p-2 pl-8 absolute w-full bottom-0">
                <input v-model="message" placeholder="blabla..." class="p-1 mr-4 ft-input" />
                <a href="#" class="t-btn-pink ft-bg-color-chat"><button @click="handleSubmitNewMessage">send</button></a>
            </div>
          </div>
        
          <!-- column 3 with list of recipients -->
          <div  id="dm-recipientList-col" class="w-[16rem] relative">
            <div class="mb-6 max-h-[54vh] overflow-scroll">
              <div v-if="isAllMyChanLoaded">
                <div v-if="myChannels.length === 0">No Dms yet</div>
                <div v-for="channel in myChannels" :key="channel">
                  <div @click="changeCurrentChannel(channel.name)" :class="currentChannel?.channelId == channel.channelId ? 'ft-actual-recipient' : ''" class="ft-channel-name">{{ channel.name }}</div>
                </div>
              </div>
              <div v-else>Loading...</div>
            </div>
            <div class="m-6 absolute bottom-6 w-2/3">
              <!-- <UserSearch :recipients="recipients" :userStore="userStore" @addRecipient="addRecipient"/> -->
            </div>
          </div>
        </div>
      </section>
    </div>
</template>
  
<script setup lang='ts'>
    import NavBar from "../components/NavBar.vue";
    import ChatNavBar from "../components/ChatNavBar.vue";
    import OtherUserProfile from "../components/OtherUserProfile.vue";
    import EmptyText from "@/components/EmptyText.vue";
    import { ref, onUpdated, watchEffect, watch } from "vue";
    import { storeToRefs } from 'pinia'
    import axios from "axios";
    import { useRouter, useRoute } from 'vue-router'
    import { useSessionStore } from "@/stores/SessionStore";
    import { useUserStore } from '../stores/UserStore'
    import { chatService } from "@/services/chat-socket.service";
    import UserSearch from "@/components/UserSearch.vue";
    import MemberList from "@/components/MemberList.vue";
    import AdminPanel from "@/components/AdminPanel.vue";

    const route = useRoute()

    // retrieve recipient i clicked on on other pages 
    // const queryRecipient = route.query.recipient
    
    // routes
    const router = useRouter()
    
    // we need sessionStore and userStore
    const sessionStore = useSessionStore()
    const userStore = useUserStore()

    const { user } = storeToRefs(userStore)
    
    //   const actualIsBlocked = ref(false)
    //   // const actualInfos = ref({})
      const message = ref("")
      const messages = ref([])
      const scroller = ref(null);
    //   const newRecipient = ref('')
    //   const allUsers = ref([])
    //   const recipients = ref([])
      
    //   // Reactive flag for loaded data
    //   const isAllUsersLoaded = ref(false)

    type MyChannel = {
      channelId: number;
      userId: number;
      name: string;
      type: string;
      Admin: null | string;
    }

    type Channel = {
      id: number,
      name: string,
      type: string,
      owner: boolean,
      admin: boolean,
      member: boolean
    }

    const myChannels = ref<Array<MyChannel>>([]);
    const allChannels = ref<Array<Channel>>([])
    
    const profileToShow = ref('')
    const showAdmin = ref(false)

    // Current
    const currentMembers = ref([])
    const currentChannel = ref<MyChannel | null>(null)

    // Reactive flag for loaded data
    const isAllMyChanLoaded = ref(true)
    const isAllChanLoaded = ref(false)
    const isCurrentMembersLoaded = ref(false)
    const isBlockedLoaded = ref(false)

    const memberList = ref<Array<ChanMembers>>([])

    const tmpMyChannels = [{
      "channelId": 1,
      "userId": 1,
      "name": "VeryCoolChannel",
      "type": "PUBLIC",
      "Admin": null
    }, {
      "channelId": 5,
      "userId": 1,
      "name": "IWantIceCream",
      "type": "PUBLIC",
      "Admin": "Admin"
    }, {
      "channelId": 130,
      "userId": 1,
      "name": "myChannel5",
      "type": "PROTECTED",
      "Admin": "Admin"
    }, {
      "channelId": 105,
      "userId": 1,
      "name": "myChannel2",
      "type": "PROTECTED",
      "Admin": "Admin"
    }]
    
    const fakeMemberList = [
    {
      id: 0,
      userId: 1,
      username: "userTest",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 1,
      userId: 2,
      username: "TechGuru42",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 2,
      userId: 3,
      username: "sarah_smith",
      status: "OFFLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 3,
      userId: 4,
      username: "alex_jones",
      status: "INGAME",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 4,
      userId: 5,
      username: "emma_wilson",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 5,
      userId: 6,
      username: "michael_brown",
      status: "OFFLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 6,
      userId: 7,
      username: "olivia_davis",
      status: "INGAME",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 7,
      userId: 8,
      username: "william_jackson",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 8,
      userId: 9,
      username: "ava_clark",
      status: "OFFLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 9,
      userId: 10,
      username: "noah_anderson",
      status: "INGAME",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 10,
      userId: 11,
      username: "mia_harris",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    }
  ]

    memberList.value = fakeMemberList

    myChannels.value = tmpMyChannels

    // set current channel
    if (isAllMyChanLoaded.value && myChannels.value.length > 0) {
      currentChannel.value = myChannels.value[0]
    }

    async function getMyChannels() {
      await axios({
        url: "/api/chat/channel/myChannels",
        method: "get",
        headers: { Authorization: `Bearer ${sessionStore.access_token}` },
      })
        .then((response) => {
          // myChannels.value = response.data;
          isAllMyChanLoaded.value = true
          console.log("loaded all my channels");
          console.log(myChannels.value);
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

    async function getAllChannels() {
      await axios({
        url: "/api/chat/channel/all",
        method: "get",
        headers: { Authorization: `Bearer ${sessionStore.access_token}` },
      })
        .then((response) => {
          allChannels.value = response.data;
          isAllChanLoaded.value = true
          console.log("loaded all channels");
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

    async function getAllMembers(channelId) {
      await axios({
        url: "/api/chat/channel/members",
        method: "get",
        headers: { Authorization: `Bearer ${sessionStore.access_token}` },
        data: { "channelId": channelId }
      })
        .then((response) => {
          allChannels.value = response.data;
          isCurrentMembersLoaded.value = true
          console.log(`Members of channel with id ${channelId} loaded`);
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
    
    let dateOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "Europe/Zurich",
        hour12: false,
    };

    onUpdated(() => {
      // when the DOM is updated I scroll to 
      // bottom of the Div that contains messages
      scrollToBottom();
    })

    // when there is socket going on
    chatService.onConnect((chat) => {
        // demander l'historique des msgs
        chat.socket?.emit('channelHistory');

        // récupérer l'historique des msgs
        chat.socket?.on('channelHistory', (payload) => {
            stockHistory(payload);
        });

        // récupérer un nouveau msg reçu
        chat.socket?.on('channel', (payload) => {
          pushToMessages(payload);
        });
    },
    { timeout: 10000 },
    chatService);

    const handleSubmitNewMessage = () => {
      chatService.sendNewMessageToChan(message.value, currentChannel.value.channelId);
      messages.value.push({
        id: 0,
        message: message.value,
        channelId: currentChannel.value.channelId,
        senderId: user.value.id,
        date: new Date().toLocaleString("en-US", dateOptions),
      })
      message.value = ''
    }

    function pushToMessages(payload) {
      if (messages.value.indexOf(payload.id) === -1) {
        messages.value.push({
          id: payload.id,
          message: payload.message,
          channelId: payload.channelId,
          senderId: payload.senderId,
          date: new Date(payload.date).toLocaleString("en-US", dateOptions)
        })
      }
    }

    // const updateBlockedBool = (newValue) => {
    //   actualIsBlocked.value = newValue
    // };

    const stockHistory = async (payload) => {
      // push recieved message to Messages Array
      pushToMessages(payload)
      messages.value.sort((a,b) => {
        return new Date(a.date) - new Date(b.date);
      })  
    }

    // used when click on channel name
    function changeCurrentChannel(name: string) {
        currentChannel.value = myChannels.value.find((chan) => name === chan.name) || null
    }

    function checkIfBlocked(senderId) {
      return userStore.blocked.find(user => user.id === senderId)
    }

    function getMemberImg(userId: number) {
      const found = memberList.value.find(member => member.userId === userId)
      return  found.avatar_url
    }

    function getMemberUsername(userId: number) {
      const found = memberList.value.find(member => member.userId === userId)
      return  found.username
    }

    // scroll messages container to bottom
    function scrollToBottom() {
      let myScroller = scroller.value
      if (myScroller) {
        myScroller.scrollTop = myScroller.scrollHeight;
      }
    }

    // Async functions 
    async function loadMyself() {
      if (sessionStore.isLoggedIn) {
        // get user infos
        await userStore.getMe(sessionStore.access_token);
        if (user.isLogged === false) {
          sessionStore.isLoggedIn = false;
          sessionStore.access_token = "";
          router.push({ name: 'login' })
        }
      }
    }

    async function loadBlocked() {
      if (sessionStore.isLoggedIn) {
        // get user infos
        await userStore.getBlockedUsers(sessionStore.access_token);
        isBlockedLoaded.value = true
        if (user.isLogged === false) {
          sessionStore.isLoggedIn = false;
          sessionStore.access_token = "";
          router.push({ name: 'login' })
        }
      }
    }
    
  // getAllUsers()
  
  loadMyself()
  getMyChannels()
  getAllChannels()
  loadBlocked()
  // getAllMembers(1)

  // Watch for changes
    // watch(isBlockedLoaded, (NewValue, OldValue) => {
    //   if (NewValue) {
    //     console.log(userStore.blocked)
    //   }
    // })
</script>

<style>
  #dm-recipientList-col {
    min-width: 4rem;
    background-color: var(--dark-pink);
    color: white;
  }

  .ft-channel-name {
    padding: 1rem;
    border-bottom: 1px solid var(--dark-gray);
    transition: padding .5s ease;
    cursor: pointer;
  }

  .ft-channel-name:hover {
    padding-left: 1.5rem;
  }

  .ft-actual-recipient {
    color: var(--dark-pink);
    background-color: var(--dark-gray);
  }

  .ft-actual-recipient:hover {
    padding-left: 1rem;
  }

  /* animation profile / member list */

  .position-origine {
    position: absolute;
    left: -101%;
    transition: left 0.5s ease; 
  }

  .position-cible {
    position: absolute;
    left: 0;
    transition: left 0.5s ease; 
  }

  #ft-back-to-list {
    position: relative;
    left: -.5rem;
    transition: left .5s ease;
    text-decoration: none;
    letter-spacing: 0em;
    text-align: center;
    display: inline-block;
    background: var(--dark-pink);
    padding: 0.5em 0.5em;
    border-top: solid 0.3em var(--light);
    border-left: solid 0.3em var(--light);
    border-right: solid 0.3em var(--purple);
    border-bottom: solid 0.3em var(--purple);
  }

  #ft-back-to-list:hover {
    left: -1rem;
  }

  /* chat msgs */

  .ft-chat-profile-pic {
    background-size: cover !important;
    width: 3rem !important;
    height: 3rem !important;
  }

  /* Admin panel */
  #ft-admin-panel {
    background-color: var(--middle-gray);
  }

</style>
