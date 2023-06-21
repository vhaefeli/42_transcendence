<template>
    <!-- <h1>Profile page</h1>
    <p>Name of user is {{ player[0].username }}</p>
    <h2>My friends</h2>

    <ul v-for="friend in player[0].friends" key="userData.id">
        <li>{{ friend.username }}</li>
    </ul> -->

</template>
  
<script setup>
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";
    import { storeToRefs } from 'pinia'

    const sessionStore = useSessionStore();
    const userStore = useUserStore()

    userStore.getUserInfosFromBack(sessionStore.access_token);

    // console.log("user: ", userStore.user)
    // console.log("user id: ", userStore.user.id)
    
    // const { user } = storeToRefs(userStore)
</script>
