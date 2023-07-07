<template>
    <NavBar></NavBar>
    <section class="flex flex-col items-center">
        <div class="mb-6 text-xl">Chat with friends</div>
        <div v-for="recipient in recipients">
            {{ getRecipientName(recipient) }}
        </div>


        <div class="w-[60%] bg-slate-950 p-6 mb-6 max-h-screen[80vh] overflow-scroll">
            <div v-for="message in messages" :key="message.id">
                <div v-if="message.username == user.username" class="grid">
                    <div class="mb-3 p-3 rounded-xl bg-orange-300 w-[70%] justify-self-end">
                        <p class="text-base mb-1">{{ message.message }}</p>
                        <p class="text-xs">from <a class="text-orange-500 font-bold" href="#">{{ message.username }}</a> on {{ message.date }}</p>
                    </div>
                </div>
                <div v-else>
                    <div class="mb-3 p-3 rounded-xl bg-orange-100 w-[70%]">
                        <p class="text-base mb-1">{{ message.message }}</p>
                        <p class="text-xs">from <a class="text-orange-500 font-bold" href="#">{{ message.username }}</a> on {{ message.date }}</p>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="flex w-[60%]">
            <input v-model="message" placeholder="blabla..." class="mr-4" />
            <button @click="handleSubmitNewMessage">Submit</button>
        </div>

        <div>
            <button
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      @click="chatService.reload()"
    >
      reload history
    </button>
        </div>
    </section>
</template>
  
<script setup>
    import NavBar from "../components/NavBar.vue";
    import { ref, onBeforeMount, computed } from "vue";
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

    let otherUser
    let allUsers

    const getRecipientName = computed((recipient) => {
        console.log(recipient)
        return allUsers.find((user) => recipient.id === user.id)
    })

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
    
    axios({
    url: "/api/user/profile/userTest",
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      // To execute when the request is successful
      otherUser = response.data;
      console.log(`${response.status} + ${response.statusText}`);
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
        chatService.sendNewMessage(message.value, 1);
        messages.value.push({
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
    }
    console.log(recipients)
</script>
