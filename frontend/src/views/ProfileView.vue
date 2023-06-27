<template>
    <h1 class="mt-9">Profile page</h1>
    <router-link to="/login">back to login</router-link>
    <!-- Nadia: tu pourra tout remove et afficher correctement. Toutes les classes sont du Tailwind. -->

    <!-- check si on est sur son propre profile -->
    <div v-if="user && user.username && user.username == route.params.username" class="w-60%">
        <div class="flex mb-9">
            <img :src="user.avatar_url" alt="avatar img" class="mr-9"/>
            <div class="mr-9">
                <!-- profile -->
                <p>username: {{ user.username }}<br />id: {{ user.id }}</p>
                <p v-if="user.twoFA_enabled">2FA is enabled</p>
                <p v-if="!user.twoFA_enabled">2FA is disabled</p>
                <p class="mb-6">Status: {{ user.status }}</p>
                <div class="flex flex-col">
                    <input v-model="newFriend" placeholder="name of friend" /><br />
                    <p>you want to add: {{ newFriend || 'nobody' }} ?</p>
                    <button
                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    @click="addFriend"
                    >
                    add a friend
                    </button>
                </div>
            </div>
            <div>
                <h2>All users</h2>
                <div v-if="allUsers">
                    <div v-for="oderUser in allUsers" :key="oderUser.id">
                        <p>{{ oderUser.username }}</p>
                    </div>
                </div>
            </div>
            
        </div>
    <div class="mb-9">
        <!-- list of friends -->
        <h2>My friends</h2>
        <div v-for="friend in user.friends" :key="friend.id" class="flex justify-between border-4 border-sky-500 p-3 mb-1">
            <div>
                <p>id: {{ friend.id }}</p>
                <p>name: {{ friend.username }}</p>
            </div>
            <button
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                @click="delFriend(friend.username)"
                >
                    remove friendship
                </button>
        </div>
    </div>
    <div class="">
        <!-- list of pending invitations -->
        <h2>Pending invitations</h2>
        <div v-if="user.invites && user.invites.invitations_received">
            <div v-for="invitation in user.invites.invitations_received" :key="invitation.id" class="flex justify-between border-4 border-sky-500 p-3">
                <div class="">
                    <p>id: {{ invitation.from.id }}</p>
                    <p>name: {{ invitation.from.username }}</p>
                </div>
                <button
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                @click="acceptFriend(invitation.from.username)"
                >
                    accept friend
                </button>
            </div>
        </div>
    </div>
    </div>
    <div v-else>
        <p>something went wrong</p>
    </div>

    <router-link to="/search-users">Search for users</router-link>

</template>
  
<script setup>
    import { ref } from "vue";
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";
    import { storeToRefs } from 'pinia'
    import { useRoute } from 'vue-router'
    import axios from "axios";

    // to have the token
    const sessionStore = useSessionStore();
    
    // routes
    const userStore = useUserStore()
    const route = useRoute()

    // other variables
    let newFriend = ref('')
    let allUsers = []
    
    // get user infos, friends and invitations
    userStore.getMe(sessionStore.access_token);
    userStore.getFriends(sessionStore.access_token);
    userStore.getInvites(sessionStore.access_token);

    // make user refs when user infos is loaded
    const { user } = storeToRefs(userStore)
    
    // functions related to friends
    function addFriend() {
        if (newFriend.value) {
            userStore.addFriend(newFriend.value, sessionStore.access_token);
        }
    }

    function acceptFriend(friendname) {
        userStore.acceptFriend(friendname, sessionStore.access_token);
    }

    function delFriend(friendname) {
        userStore.delFriend(friendname, sessionStore.access_token);
    }

    // list all users
    axios({
        url: "/api/user/all",
        method: "get",
        headers: { },
    })
        .then((response) => {
        allUsers = response.data;
        console.log("all users loaded");
        })
        .catch((error) => {
        if (error.response.status == 401) {
            console.log(
            `invalid access token: ${error.response.status} ${error.response.statusText}`
            );
        } else
            console.error(
            `unexpected error: ${error.response.status} ${error.response.statusText}`
            );
        });
    
</script>
