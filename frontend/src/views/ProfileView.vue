<template>
    <h1 class="mt-9">Profile page</h1>

    <div v-if="user.id">
        <div class="flex mb-9">
            <img :src="user.avatar_url" alt="avatar img" class="mr-9"/>
            <div class="mr-9">
                <!-- profile -->
                <p>username: {{ user.username }}<br />id: {{ user.id }}</p>
                <p v-if="user.twoFA_enabled">2FA is enabled</p>
                <p v-if="!user.twoFA_enabled">2FA is disabled</p>
                <p class="mb-6">Status: {{ user.status }}</p>
                <div class="flex flex-col">
                    <button
                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    @click="addFriend"
                    >
                    add a friend
                    </button>
                </div>
            </div>
            
        </div>
    <div class="mb-9">
        <h2>My friends</h2>
        <div v-for="friend in user.firends" class="flex border-4 border-sky-500 p-3 mb-1">
            <div>
                <p>id: {{ friend.id }}</p>
                <p>name: {{ friend.username }}</p>
            </div>
        </div>
    </div>
    <div class="">
        <h2>Pending invitations</h2>
        <div v-for="invitation in user.invites.invitations_received" class="flex justify-between border-4 border-sky-500 p-3">
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
    <div v-else>
        <p>something went wrong</p>
    </div>

</template>
  
<script setup>
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";
    import { storeToRefs } from 'pinia'

    const sessionStore = useSessionStore();
    const userStore = useUserStore()

    userStore.getMe(sessionStore.access_token);
    userStore.getFriends(sessionStore.access_token);
    userStore.getInvites(sessionStore.access_token);
    const { user } = storeToRefs(userStore)
    
    function addFriend() {
        userStore.addFriend("test", sessionStore.access_token);
    }

    function acceptFriend(friendname) {
        userStore.acceptFriend(friendname, sessionStore.access_token);
    }
    
</script>
