<template>
    <div>Chat with friends</div>

    <div>
        <ul id="messages"></ul>
    </div>

    <div>
        <input v-model="message" placeholder="blabla..." /><br />
        <button @click="handleSubmitNewMessage">Submit</button>
    </div>



</template>
  
<script setup>
    import { ref } from "vue";
    import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

    const socket = io("http://localhost:3000")

    // const message = document.getElementById('message');
    const message = ref("");
    const messages = document.getElementById('messages');

    const handleSubmitNewMessage = () => {
        console.log(message)
        // socket.emit('message', { data: message.value })
    }

    // socket.on('message', ({ data }) => {
    //     handleNewMessage(data);
    // })

    // const handleNewMessage = (message) => {
    //     messages.appendChild(buildNewMessage(message));
    // }

    // const buildNewMessage = (message) => {
    //     const li = document.createElement("li");
    //     li.appendChild(document.createTextNode(message))
    //     return li;
    // }
</script>