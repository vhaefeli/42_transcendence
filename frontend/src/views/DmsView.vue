<template>
    <NavBar></NavBar>
      <section id="chat-container" class="flex flex-col items-center">
          <div class="mb-6 text-xl">All my Dms</div>
          <div class="mb-6">
            <div v-for="recipient in recipients" :key="recipient">
              <div @click="changeActualRecipient(recipient)">{{ getRecipientName(recipient) }}</div>
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
          <div v-if="recipients.length > 0">speaking with {{ actual.username }}</div>
          <div v-else>No Dms yet</div>
  
          <div v-if="isActualInfosLoaded">
            <h2 class="text-xl">Profile of {{ actualInfos.username }}</h2>
            <img :src="actualInfos.avatar_url" alt="avatar img" class="mr-9 w-14"/>
            <div v-if="actualInfos.is_friend">is my friend</div>
            <div v-else>is not my friend</div>
          </div>
          <div v-else>Profile loading...</div>
  
          <div ref="scroller" class="w-[60%] bg-slate-950 p-6 mb-6 h-[300px] overflow-scroll">
              <div v-for="message in messages" :key="message.id">
                <div v-if="actual.id === message.fromId || actual.id === message.toId">
                  <div v-if="message.fromId == user.id" class="grid">
                      <div class="mb-3 p-3 rounded-xl bg-orange-300 w-[70%] justify-self-end">
                          <p class="text-base mb-1">{{ message.message }}</p>
                          <p class="text-xs">from <a class="text-orange-500 font-bold" href="#">{{ user.username }}</a> on {{ message.date }}</p>
                      </div>
                  </div>
                  <div v-else>
                      <div class="mb-3 p-3 rounded-xl bg-orange-100 w-[70%]">
                          <p class="text-base mb-1">{{ message.message }}</p>
                          <p class="text-xs">from <a class="text-orange-500 font-bold" href="#">{{ actual.username }}</a> on {{ message.date }}</p>
                      </div>
                  </div>
                </div>
              </div>
          </div>
      
          <div class="flex w-[60%]">
              <input v-model="message" placeholder="blabla..." class="mr-4" />
              <button @click="handleSubmitNewMessage">Submit</button>
          </div>
      </section>
</template>
  
<script setup>
    import NavBar from "../components/NavBar.vue";
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

#chat-container {
    background: var(--gray);
	  border: 4px solid var(--dark-pink);
}

</style>
