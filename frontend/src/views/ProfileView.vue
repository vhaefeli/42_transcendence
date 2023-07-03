<template>
<<<<<<< HEAD
    <div>profil</div>
</template>
  
<script setup>
</script>
=======
    <h1 class="mt-9">Profile page</h1>
    <router-link to="/login">back to login</router-link>
    <!-- Nadia: tu pourra tout remove et afficher correctement. Toutes les classes sont du Tailwind. -->

    <!-- check si on est sur son propre profile -->
    <div v-if="user && user.isLogged && user.username == route.params.username" class="flex flex-col items-center">
        <div class="flex mb-9 w-[60%]">
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
                <h2 class="text-2xl mb-4">All users</h2>
                <div v-if="allUsers">
                    <div v-for="oderUser in allUsers" :key="oderUser.id">
                        <p>{{ oderUser.username }}</p>
                    </div>
                </div>
            </div>   
        </div>
        <div class="mb-9 font-size w-[60%]">
            <!-- list of friends -->
            <h2 class="text-2xl mb-4">My friends</h2>
            <div v-for="friend in friends" :key="friend.id" class="flex justify-between border-4 border-sky-500 p-3 mb-1">
                <div v-if="!friend.is_blocked">
                    <div>
                        <p>id: {{ friend.id }}</p>
                        <p>name: {{ friend.username }}</p>
                    </div>
                    <button
                        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        @click="removeFriend(friend.username)"
                        >
                            remove friendship
                        </button>
                    <button
                        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        @click="blockUser(friend.username)"
                        >
                            block this friend
                        </button>  
                </div>
            </div>
        </div>
        <div class="w-[60%] mb-9">
            <!-- list of pending invitations -->
            <h2 class="text-2xl mb-4">Invitations sent</h2>
            <div v-if="invitesSent">
                <div v-for="invitation in invitesSent" :key="invitation.id" class="flex justify-between border-4 border-sky-500 p-3">
                    <div class="">
                        <p>id: {{ invitation.id }}</p>
                        <p>name: {{ invitation.username }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-[60%] mb-9">
            <!-- list of pending invitations -->
            <h2 class="text-2xl mb-4">Pending invitations</h2>
            <div v-if="invites">
                <div v-for="invitation in invites" :key="invitation.id" class="flex justify-between border-4 border-sky-500 p-3">
                    <div class="">
                        <p>id: {{ invitation.id }}</p>
                        <p>name: {{ invitation.username }}</p>
                    </div>
                    <button
                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    @click="acceptFriend(invitation.username)"
                    >
                        accept friend
                    </button>
                    <button
                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    @click="blockUserAndDelInvite(invitation.username)"
                    >
                        block this user
                    </button>
                    <button
                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    @click="iDontWantToBeFriend(invitation.username)"
                    >
                        i don't want to be friend
                    </button>
                </div>
            </div>
        </div>
        <div class="w-[60%] mb-9">
            <!-- list of pending invitations -->
            <h2 class="text-2xl mb-4">Blocked users</h2>
            <div v-if="blocked">
                <div v-for="block in blocked" :key="block.id" class="flex justify-between border-4 border-sky-500 p-3">
                    <div class="">
                        <p>id: {{ block.id }}</p>
                        <p>name: {{ block.username }}</p>
                    </div>
                    <p v-if="block.is_friend">friend</p>
                    <button
                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    @click="unblockUser(block.username)"
                    >
                        unblock
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
  
<script setup lang="ts">
    import { ref, onBeforeMount } from "vue";
    import { storeToRefs } from 'pinia'
    import { useRoute, useRouter } from 'vue-router'
    import axios from "axios";
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";

    
    // to have the token we need sessionStore
    const sessionStore = useSessionStore()
    
    // routes
    const route = useRoute()
    const router = useRouter()
    
    // we need userStore and a variable to check if logged in
    const userStore = useUserStore()
    const isLoggedIn = ref(false);

    // other variables
    let newFriend = ref('')
    let allUsers: { id: number, username: string }[];
    // let myFriends = ref([]);

    const { user, friends, invites, blocked, invitesSent } = storeToRefs(userStore)

    // onBeforeMount is executed before the component is mounted
    // way of using await because we can't do it in setup
    onBeforeMount(async () => {
        if (sessionStore.isLoggedIn) {
            isLoggedIn.value = true;

            // get user infos, friends, and invitations
            await userStore.getMe(sessionStore.access_token);
            if (user.value.isLogged) {
                await userStore.getFriends(sessionStore.access_token);
                await userStore.getInvites(sessionStore.access_token);
                await userStore.getBlockedUsers(sessionStore.access_token);
                await userStore.getInvitesSent(sessionStore.access_token);
            } else {
                isLoggedIn.value = false;
                sessionStore.isLoggedIn = false;
                sessionStore.access_token = "";
                router.push({ name: 'login' })
            }
        }
    });

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
            console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`);
    });

    // functions to delete because useless
    function addFriend() {
        if (newFriend.value) {
            userStore.addFriend(newFriend.value, sessionStore.access_token);
        }
    }

    function acceptFriend(friendname) {
        userStore.acceptFriend(friendname, sessionStore.access_token);
    }

    function iDontWantToBeFriend(friendname) {
        userStore.declineFriend(friendname, sessionStore.access_token);
    }

    function removeFriend(friendname) {
        userStore.delFriend(friendname, sessionStore.access_token)
    }

    function blockUser(username) {
        userStore.blockUser(username, sessionStore.access_token)
    }

    function blockUserAndDelInvite(username) {
        userStore.blockUser(username, sessionStore.access_token)
        userStore.declineFriend(username, sessionStore.access_token);
    }

    function unblockUser(username) {
        userStore.unblockUser(username, sessionStore.access_token)
    }
</script>
>>>>>>> main
