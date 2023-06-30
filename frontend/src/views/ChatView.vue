<template>
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
    </section>
</template>
  
<script setup>
    import { ref, onBeforeMount } from "vue";
    import { io } from "socket.io-client";
    import { storeToRefs } from 'pinia'
    import { useRoute, useRouter } from 'vue-router'
    import { useSessionStore } from "@/stores/SessionStore";
    import { useUserStore } from '../stores/UserStore'

    // routes
    const router = useRouter()
    
    // we need sessionStore and userStore
    const sessionStore = useSessionStore()
    const userStore = useUserStore()

    const { user } = storeToRefs(userStore)


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

    const socket = io(`http://localhost:3000/chat`, {
      auth: {
        token: sessionStore.access_token,
      },
    });

    let oldMessages = [
        {
            id: 1,
            message: 'coucou',
            username: 'fakeUser123',
            date: 'Fri, Jun 30, 2023, 21:34',
            channelId: 1
        },
        {
            id: 2,
            message: 'salut!',
            username: 'superFakeUser456',
            date: 'Fri, Jun 30, 2023, 21:34',
            channelId: 1
        }
    ]

    // const message = document.getElementById('message');
    const message = ref("");
    const messages = ref("");

    // 1. load messages which already exists (TO DO: load from database)
    messages.value = oldMessages

    const handleSubmitNewMessage = () => {
        const now = new Date();
        const options = {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'Europe/Zurich',
            hour12: false
        };
        const payload = { message: message.value, username: userStore.user.username, date: now.toLocaleString('en-US', options) };
        socket.emit('message', payload)
    }

    socket.on('message', (payload) => {
        console.log(payload.date)
        handleNewMessage(payload);
    })

    const handleNewMessage = (payload) => {
        messages.value.push({
            id: 3,
            message: payload.message,
            username: payload.username,
            date: payload.date,
            channelId: 1
        })
    }

    // TO DO:

    // make channel routes like user
    // comment les id se créer? changer les id!
    // utiliser la methode .logout() du sessionstore
    // faire un channel store
</script>
