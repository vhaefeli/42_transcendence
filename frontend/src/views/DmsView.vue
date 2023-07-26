<template>
    <NavBar :showProfile="true"></NavBar>
    <div class="ft-chat-container">
      <ChatNavBar :whichTab="'dms'"></ChatNavBar>
      <section class="ft-chat-inside-container flex p-6">

        <!-- column 1 with profile -->
        <div id="dm-profile-col">
            <OtherUserProfile :key="actual.username" :username="actual.username" :userStore="userStore" :sessionStore="sessionStore" @updateBlocked="updateBlockedBool" />
        </div>

        <!-- column 2 with messages -->
        <div id="dm-msg-col" class="grow relative">
          <div id="ft-scroller" ref="scroller" class="ft-chat-box p-6 overflow-scroll">
            <div v-if="actualIsBlocked">
              <EmptyText :text="'You have blocked this user. Unblock he/her to see messages.'" :white="true" />
            </div>
            <div v-else>
              <div v-for="message in messages" :key="message.id">
                <div v-if="actual.id === message.fromId || actual.id === message.toId">
                  <div v-if="message.fromId == user.id" class="grid">
                      <div class="ft-msg-container justify-self-end">
                        <p class="text-xs ft-chat-date">{{ message.date }}</p>
                        <p class="ft-chat-my-msg">{{ message.message }}</p>
                      </div>
                  </div>
                  <div v-else>
                      <div class="ft-msg-container">
                        <p class="text-xs ft-chat-date">{{ message.date }}</p>
                        <p class="text-base mb-1 ft-chat-recipient-msg">{{ message.message }}</p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="ft-bg-dark-gray flex p-2 absolute w-full bottom-0">
              <input v-model="message" placeholder="blabla..." class="p-1 mr-4 ft-input" />
              <a href="#" class="t-btn-pink ft-bg-color-chat"><button @click="handleSubmitNewMessage">Submit</button></a>
          </div>
        </div>
      
        <!-- column 3 with list of recipients -->
        <div  id="dm-recipientList-col" class="w-[16rem] relative">
          <div class="m-6 w-2/3">
            <UserSearch :recipients="recipients" :userStore="userStore" @addRecipient="addRecipient"/>
          </div>
          <div class="mb-6 max-h-[54vh] overflow-scroll">
            <div v-if="recipients.length === 0">No Dms yet</div>
            <div v-for="recipient in recipients" :key="recipient">
              <div @click="changeActualRecipient(recipient)" :class="actual.id == recipient ? 'ft-actual-recipient' : ''" class="ft-recipient-name">{{ getRecipientName(recipient) }}</div>
            </div>
            <div v-if="!isInRecipients()"></div>
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
    import { ref, onUpdated, watchEffect } from "vue";
    import { storeToRefs } from 'pinia'
    import axios from "axios";
    import { useRouter, useRoute } from 'vue-router'
    import { useSessionStore } from "@/stores/SessionStore";
    import { useUserStore } from '../stores/UserStore'
    import { chatService } from "@/services/chat-socket.service";
    import UserSearch from "@/components/UserSearch.vue";

    // ********************************** ROUTES & STORES
    
    // routes
    const router = useRouter()
    const route = useRoute()

    // sessionStore and userStore
    const sessionStore = useSessionStore()
    const userStore = useUserStore()
    
    const { user } = storeToRefs(userStore)

    // ********************************** TYPES

    type Recipient = {
      id: number,
      username: string
    }

    type Message = {
      id: number,
      fromId: number,
      toId: number,
      date: string,
      message: string,
      username: string,
    }

    // ********************************** REFS & VARIABLES

    // retrieve recipient i clicked on on other pages 
    const queryRecipient = route.query.recipient
    
    const actual = ref<Recipient>({id: 0, username: ''})
    const actualIsBlocked = ref(false)
    // const actualInfos = ref({})
    const message = ref<string>("")
    const messages = ref<Array<Message>>([])
    const scroller = ref(null);
    const newRecipient = ref('')
    const allUsers = ref<Array<Recipient>>([])
    const recipients = ref<number[]>([])
    
    // Reactive flag for loaded data
    const isAllUsersLoaded = ref(false)
    const isActualLoaded = ref(false)
    
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

    // ********************************** FUNCTIONS

    onUpdated(() => {
      // when the DOM is updated I scroll to 
      // bottom of the Div that contains messages
      scrollToBottom();
    })

    // when there is socket going on
    chatService.onConnect((chat) => {
        // demander l'historique des msgs
        chat.socket?.emit('dmHistory');

        // récupérer l'historique des msgs
        chat.socket?.on('dmHistory', (payload) => {
            stockHistory(payload);
        });

        // récupérer un nouveau msg reçu
        chat.socket?.on('dm', (payload) => {
          pushToMessages(payload);
        });
    },
    { timeout: 10000 },
    chatService);

    const handleSubmitNewMessage = () => {
      let newId = 0
      chatService.sendNewMessage(message.value, actual.value.id);
      if (message.value.length === 0) {
        newId = 0
      } else {
        newId = messages.value[messages.value.length - 1].id + 1
      }
      messages.value.push({
        id: newId,
        fromId: user.value.id,
        toId: actual.value.id,
        message: message.value,
        username: user.value.username,
        date: new Date().toLocaleString("en-US", dateOptions),
      })
      message.value = ''
    }

    function pushToMessages(payload) {
      if (messages.value.indexOf(payload.id) === -1) {
        messages.value.push({
          id: payload.id,
          username: getRecipientName(payload.id),
          message: payload.message,
          fromId: payload.fromId,
          toId: payload.toId,
          date: new Date(payload.date).toLocaleString("en-US", dateOptions)
        })
      }
    }

    const updateBlockedBool = (newValue: boolean) => {
      actualIsBlocked.value = newValue
    };

    const stockHistory = async (payload) => {
      // push recieved message to Messages Array
      pushToMessages(payload)      
      // make an Array of all user i'm speaking with
      let id
        if (payload.fromId === user.value.id) {
            id = payload.toId
        } else {
            id = payload.fromId
        }
        if (recipients.value.indexOf(id) === -1 && (id != user.value.id)) {
            recipients.value.push(id);
        }
      
        // check what is the actual recipient
        if (isAllUsersLoaded.value && !isActualLoaded.value && recipients.value.length > 0) {
          const userFind = allUsers.value.find((user) => recipients.value[0] === user.id);
          if (userFind) {
            actual.value = userFind;
            isActualLoaded.value = true;
          }
        }
    }

    // add recipient to the list
    function addRecipient(recipientName: string) {
        const userFind = allUsers.value.find((user) => recipientName === user.username)
        if (userFind) {
          if (recipients.value.indexOf(userFind.id) === -1) {
            recipients.value.push(userFind.id);
          }
          actual.value = userFind
        }
    }

    // add recipient by ID to the list
    function addRecipientByID(queryRecipientId: number) {
        const userFind = allUsers.value.find((user) => queryRecipientId == user.id)
        if (userFind) {
            if (recipients.value.indexOf(userFind.id) === -1) {
              recipients.value.push(userFind.id);
            }
            actual.value = userFind
        }
    }

    function isInRecipients() {
      if (recipients.value.find((recipient) => queryRecipient == recipient)) {
        return true
      } else {
        addRecipientByID(queryRecipient)
        return false
      }
    }

    // return name of recipient
    function getRecipientName(recipientId: number) {
      const userFind = allUsers.value.find((user) => recipientId === user.id)
      if (userFind) {
        return userFind.username
      } else {
        return "Loading..."
      }
    }

    // used when click on recipient name
    function changeActualRecipient(recipientId: number) {
        actual.value = allUsers.value.find((user) => recipientId === user.id)
        message.value = ''
    }

    // scroll messages container to bottom
    function scrollToBottom() {
        let myScroller = scroller.value
        if (myScroller) {
          myScroller.scrollTop = myScroller.scrollHeight;
        }
    }

    // ********************************** ASYNC FUNCTIONS

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

    async function getAllUsers() {
      try {
        const response = await axios.get("/api/user/all");
        allUsers.value = response.data;
        isAllUsersLoaded.value = true;
        return true;
      } catch (error) {
        if (error.response && error.response.status == 404) {
          console.log(`not found: ${error.response.status} ${error.response.statusText}`);
        } else {
          console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`);
        }
        return false;
      }
    }
    
  loadMyself()
  getAllUsers()

  // ********************************** WATCHES

  // Watch for changes in the isAllUsersLoaded flag
  watchEffect(() => {
    if (isAllUsersLoaded.value) {
      // The allUsers data is loaded, you can use it now
      if (queryRecipient) {
        actual.value = allUsers.value.find((user) => queryRecipient == user.id)
      } else if (recipients.value.length > 0 && !isActualLoaded.value) {
        actual.value = allUsers.value.find((user) => recipients.value[0] === user.id)
      }
    }
  })
</script>

<style>
  #dm-recipientList-col {
    min-width: 4rem;
    background-color: var(--dark-pink);
    color: white;
  }

  .ft-recipient-name {
    padding: 1rem;
    border-bottom: 1px solid var(--dark-gray);
    transition: padding .5s ease;
    cursor: pointer;
  }

  .ft-recipient-name:hover {
    padding-left: 1.5rem;
  }

  .ft-actual-recipient {
    color: var(--dark-pink);
    background-color: var(--dark-gray);
  }

  .ft-actual-recipient:hover {
    padding-left: 1rem;
  }
</style>
