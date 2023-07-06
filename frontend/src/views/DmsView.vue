<template>
    <NavBar></NavBar>
    <section class="flex flex-col items-center">
        <div class="mb-6 text-xl">Chat with friends</div>
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
    import { ref, onBeforeMount } from "vue";
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



    let oldMessages = [
        {
            id: 1,
            message: 'coucou',
            username: 'fakeUser123',
            date: 'Fri, Jun 30, 2023, 21:34',
        },
        {
            id: 2,
            message: 'salut!',
            username: 'superFakeUser456',
            date: 'Fri, Jun 30, 2023, 21:34',
        }
    ]

    const message = ref("");
    const messages = ref("");

    // 1. load messages which already exists (TO DO: load from database)
    messages.value = oldMessages

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

    // chatService.reload()

    chatService.onConnect((chat) => {
        chat.socket?.on('dm', (payload) => {
            console.log("recieving something: ")
            console.log(payload)
            handleNewMessage(payload);
        });
    },
    { timeout: 10000 },
    chatService);

    const handleNewMessage = (payload) => {
        messages.value.push({
            message: payload.message,
            username: payload.username,
            date: payload.date,
        })
    }
</script>
