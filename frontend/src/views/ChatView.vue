<template>
    <div>Chat with friends</div>

    <div>
        <ul>
            <li>{{ messages }}</li>
        </ul>
    </div>

    <div>
        <input v-model="message" placeholder="blabla..." /><br />
        <button @click="handleSubmitNewMessage">Submit</button>
    </div>



</template>
  
<script setup>
    import { ref } from "vue";
    import { io, Socket } from "socket.io-client";
    import { useSessionStore } from "@/stores/SessionStore";
    
    // to have the token we need sessionStore
    const sessionStore = useSessionStore()

    const socket = io(`http://localhost:3000/chat`, {
      auth: {
        token: sessionStore.access_token,
      },
    });
    

    // const message = document.getElementById('message');
    const message = ref("");
    const messages = ref("");

    const handleSubmitNewMessage = () => {
        console.log("message sent: ", message.value)
        socket.emit('message', { data: message.value })
    }

    socket.on('message', ({ data }) => {
        console.log("socket on: ", data)
        handleNewMessage(data);
    })

    const handleNewMessage = (message) => {
        console.log("append child: ", message)
        messages.value = message
    }
</script>