<template>
    <NavBar></NavBar>
    <section class="flex flex-col items-center">
        <div class="mb-6 text-xl">All my Dms</div>
        <div class="mb-6">
          <div v-for="recipient in recipients" :key="recipient">
            <div @click="getActualRecipient(recipient)">{{ getRecipientName(recipient) }}</div>
          </div>
        </div>
        <div v-if="actual != -1">speaking with {{ actual.username }}</div>
        <div v-else>No Dms yet</div>

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
    import { ref, onBeforeMount, onUpdated } from "vue";
    import { storeToRefs } from 'pinia'
    import axios from "axios";
    import { useRoute, useRouter } from 'vue-router'
    import { useSessionStore } from "@/stores/SessionStore";
    import { useUserStore } from '../stores/UserStore'
    import { chatService } from "@/services/chat-socket.service";

    // routes
    const router = useRouter()
    
    // we need sessionStore and userStore
    const sessionStore = useSessionStore()
    const userStore = useUserStore()

    const { user } = storeToRefs(userStore)

    let allUsers

    const scroller = ref(null);

    onBeforeMount(async () => {
        if (sessionStore.isLoggedIn) {
            // get user infos
            await userStore.getMe(sessionStore.access_token);
            if (user.isLogged === false) {
                sessionStore.isLoggedIn = false;
                sessionStore.access_token = "";
                router.push({ name: 'login' })
            }
        }
    });

    onUpdated(() => {
      // when the DOM is updated I scroll to 
      // bottom of the Div that contains messages
      scrollToBottom();
    })

    // get all users
    axios({
        url: "/api/user/all",
        method: "get",
    })
    .then((response) => {
      // To execute when the request is successful
      allUsers = response.data;
      return true;
    })
    .catch((error) => {
      // To execute when the request fails
      if (error.response.status == 404)
        console.log(
          `not found: ${error.response.status} ${error.response.statusText}`
        );
      else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      return false;
    });

    const actual = ref({})
    const message = ref("");
    const messages = ref([]);
    let recipients = []

    // récupérer du navigateur
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

    chatService.onConnect((chat) => {
        // demander l'historique des msgs
        chat.socket?.emit('dmHistory');

        // récupérer l'historique des msgs
        chat.socket?.on('dmHistory', (payload) => {
            stockHistory(payload);
        });

        // récupérer un nouveau msg reçu
        chat.socket?.on('dm', (payload) => {
            stockHistory(payload);
        });
    },
    { timeout: 10000 },
    chatService);

    const stockHistory = (payload) => {
        let id
        messages.value.push({
            id: payload.id,
            message: payload.message,
            fromId: payload.fromId,
            toId: payload.toId,
            date: new Date(payload.date).toLocaleString("en-US", dateOptions)
        })
        if (payload.fromId === user.value.id) {
            id = payload.toId
        } else {
            id = payload.fromId
        }
        if (recipients.indexOf(id) === -1 && (id != user.value.id)) {
            recipients.push(id);
        }
        // check actual recipient
        if (Object.keys(actual.value).length === 0 && recipients.length > 0) {
          actual.value =  allUsers.find((user) => recipients[0] === user.id)
        } else if (Object.keys(actual.value).length === 0) {
          actual.value = -1
        }
    }

    function getRecipientName(recipient) {
        const userFind = allUsers.find((user) => recipient === user.id)
        return userFind.username
    }

    function getActualRecipient(recipient) {
        actual.value = allUsers.find((user) => recipient === user.id)
    }

    function scrollToBottom() {
        let myScroller = scroller.value
        if (myScroller) {
          myScroller.scrollTop = myScroller.scrollHeight;
        }
    }
</script>
