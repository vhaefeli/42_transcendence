<template>
    <NavBar></NavBar>
    <div class="ft-chat-container">
      <ChatNavBar></ChatNavBar>
      <section class="ft-chat-inside-container flex p-6">

        <!-- column 1 with profile -->
        <div id="dm-profile-col">
          <div v-if="isActualInfosLoaded">
            <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container">
              <div class="ft-profile-pic" id="current-profile-pic" :style="{ 'background': 'url(' + actualInfos.avatar_url + ')' }"></div>
              <!-- ajouter la valeur ft-circle-green ou ft-circle-gray selon le statut de connexion de la personne -->
              <div class="ft-connection-circle" id="current-profile-pic"></div>
              <div class="ft-tab-folder" id="title-profile"></div>
              <!-- Par defaut en ligne -->
              <div class="ft-tab-content ft-bg-color-profile">{{ actualInfos.status }}</div>
              <div class="ft-tab-content ft-bg-color-profile ft-title" id="username">{{ actualInfos.username }}</div>
              <div>
                <div v-if="actualInfos.is_friend">is my friend</div>
                  <div v-else>is not my friend</div>
              </div>
              <!-- <div class="ft-tabContent ft-centralTab" id="buttonsContainer"> -->
              <div class="ft-tab-content ft-bg-color-profile" id="buttons-container">
                <!-- Bouton pour ajouter la personne en ami (profil d'un tiers) -->
                <a class="t-btn-pink ft-color-add ft-other-profile"><span>[+]</span></a>
                <!-- Bouton pour bloquer la personne (profil d'un tiers) -->
                <a class="t-btn-pink ft-color-block ft-other-profile" id="block"><span>[blk]</span></a>
  
                <!-- Bouton pour editer son profil (SON profil uniquement) -->
                <!-- <a class="t-btn-pink ft-color-edit ft-my-profile" id="edit"><span>[ed.]</span></a> -->
                <a class="t-btn-pink ft-color-edit ft-my-profile ft-icon-small icon-btn-cursor" id="edit"><img src="../assets/img/icons/user-pen-solid.svg" alt="edit my profile"></a>
              </div>
            </div>
          </div>
          <div v-else>Profile loading...</div>

        </div>

        <!-- column 2 with messages -->
        <div id="dm-msg-col" class="grow relative">
          <div ref="scroller" class="ft-chat-box p-6 overflow-scroll">
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

            <div class="ft-bg-dark-gray flex p-2 absolute w-full bottom-0">
                <input v-model="message" placeholder="blabla..." class="p-1 mr-4 ft-input" />
                <a href="#" class="t-btn-pink ft-bg-color-chat"><button @click="handleSubmitNewMessage">Submit</button></a>
            </div>
        </div>
      
        <!-- column 3 with list of recipients -->
        <div  id="dm-recipientList-col" class="bg-blue-600">
          <div class="mb-6">
            <div v-if="recipients.length === 0">No Dms yet</div>
            <div v-for="recipient in recipients" :key="recipient">
              <div @click="changeActualRecipient(recipient)" :class="actual.id == recipient ? 'ft-actual-recipient' : ''" class="ft-recipient-name">{{ getRecipientName(recipient) }}</div>
            </div>
          </div>
          <div class="mb-6">
            <input v-model="newRecipient" placeholder="name of friend" /><br />
                <p>you want to add: {{ newRecipient || 'nobody' }} ?</p>
                <button
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                @click="addRecipient(newRecipient)"
                >
                add a friend
                </button>
          </div>
        </div>
      </section>

        <!-- <section class="chat-inside-container flex flex-col items-center">
          <div v-if="recipients.length > 0">speaking with {{ actual.username }}</div>
          <div v-else>No Dms yet</div>
      </section> -->
    </div>
</template>
  
<script setup>
    import NavBar from "../components/NavBar.vue";
    import ChatNavBar from "../components/ChatNavBar.vue";
    import { ref, onUpdated, watchEffect } from "vue";
    import { storeToRefs } from 'pinia'
    import axios from "axios";
    import { useRouter } from 'vue-router'
    import { useSessionStore } from "@/stores/SessionStore";
    import { useUserStore } from '../stores/UserStore'
    import { chatService } from "@/services/chat-socket.service";

    // routes
    const router = useRouter()
    
    // we need sessionStore and userStore
    const sessionStore = useSessionStore()
    const userStore = useUserStore()

    const { user } = storeToRefs(userStore)

    const actual = ref({})
    const actualInfos = ref({})
    const message = ref("")
    const messages = ref([])
    const scroller = ref(null);
    const newRecipient = ref('')
    const allUsers = ref([])
    const recipients = ref([])

    // Reactive flag for loaded data
    const isAllUsersLoaded = ref(false)
    const isActualInfosLoaded = ref(false)

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
        chatService.sendNewMessage(message.value, actual.value.id);
        messages.value.push({
            fromId: user.value.id,
            toId: actual.value.id,
            message: message.value,
            username: user.username,
            date: new Date().toLocaleString("en-US", dateOptions),
        })
    }

    function pushToMessages(payload) {
      messages.value.push({
            id: payload.id,
            message: payload.message,
            fromId: payload.fromId,
            toId: payload.toId,
            date: new Date(payload.date).toLocaleString("en-US", dateOptions)
        })
    }

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
        if (isAllUsersLoaded.value && Object.keys(actual.value).length === 0 && recipients.value.length > 0) {
          actual.value = allUsers.value.find((user) => recipients.value[0] === user.id)
          getUserInfos(actual.value.username)
        }
    }

    // add recipient to the list
    function addRecipient(recipientName) {
        const userFind = allUsers.value.find((user) => recipientName === user.username)
        // TO DO:
        //  check if already exist
        //  replace by search bar
        //  check if user exist
        recipients.value.push(userFind.id);
        actual.value = userFind
    }

    // return name of recipient
    function getRecipientName(recipient) {
      const userFind = allUsers.value.find((user) => recipient === user.id)
      if (userFind) {
        return userFind.username
      } else {
        return "Loading..."
      }
    }

    // used when click on recipient name
    function changeActualRecipient(recipient) {
        actual.value = allUsers.value.find((user) => recipient === user.id)
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

    async function getAllUsers() {
      try {
        const response = await axios.get("/api/user/all");
        allUsers.value = response.data;
        isAllUsersLoaded.value = true; // Set the flag to true when data is loaded
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

    async function getUserInfos(username) {
      await axios({
        url: `/api/user/profile/${username}`,
        method: "get",
        headers: { Authorization: `Bearer ${sessionStore.access_token}` },
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
    
  loadMyself()
  getAllUsers()

  // Watches

  // Watch for changes in the isAllUsersLoaded flag
  watchEffect(() => {
    if (isAllUsersLoaded.value) {
      // The allUsers data is loaded, you can use it now
      if (recipients.value.length > 0 && Object.keys(actual.value).length === 0) {
        actual.value = allUsers.value.find((user) => recipients.value[0] === user.id)
      }
    }
  })

  // Watch for changes in the isAllUsersLoaded flag
  watchEffect(() => {
    if (actual.value.username) {
      getUserInfos(actual.value.username)
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
