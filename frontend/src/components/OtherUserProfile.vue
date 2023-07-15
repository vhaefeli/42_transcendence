<template>
    <div id="ft-user-profile-container">
        <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container mb-6">
            <div class="ft-profile-pic" id="current-profile-pic" :style="{ 'background': 'url(' + avatar_url + ')' }"></div>
            <div class="ft-status-bubble-position"><StatusBubble :status="status" /></div>
            <div class="ft-tab-folder" id="title-profile"></div>
            <div class="ft-tab-content ft-bg-color-profile">{{ status }}</div>
            <div class="ft-tab-content ft-bg-color-profile ft-title" id="username">{{ username }}</div>
            <div class="ft-tab-content ft-bg-color-profile flex justify-center py-6">
                <div v-if="is_friend">
                    <a class="t-btn-pink ft-color-remove ft-icon-small icon-btn-size icon-btn-cursor" @click="removeFriend(username)"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a>
                </div>
                <div v-else>
                    <a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor" @click="addFriend()"><img src="../assets/img/icons/user-plus-solid.svg" alt="send a friend request"></a>
                </div>
                <!-- TO DO: check if already blocked or not -->
                <a class="t-btn-pink ft-color-block ft-icon-small icon-btn-size icon-btn-cursor" @click="blockUser(friend.username)"><img src="../assets/icons/person-circle-minus-solid.svg" alt="block them"></a>
                <a class="t-btn-pink ft-color-unblock ft-icon-small icon-btn-size icon-btn-cursor" @click="unblockUser(block.username)"><img src="../assets/icons/person-circle-check-solid.svg" alt="unblock them"></a>
            </div>
        </div>
        <div class="flex flex-col pr-9">
            <router-link class="ft-bg-color-profile t-btn-pink ft-other-profile mb-3" :to= "'/user/' + username">See profile</router-link>
            <!-- TO DO: link to game setting + send username of the person you want to play with -->
            <router-link class="ft-bg-color-game t-btn-pink ft-other-profile mb-3" to="/game">Invite to play</router-link>
        </div>
    </div>
</template>

<script setup>
    import StatusBubble from "../components/StatusBubble.vue";
    const props = defineProps({
        id: Number,
        username: String,
        avatar_url: String,
        is_friend: Boolean,
        status: String,
        sessionStore: Object,
        userStore: Object,
    })

    // get list of blocked?

    // what to do if invitentions already send? get invitation sent and check?
    // en attente du back
    function addFriend() {
        props.userStore.addFriend(props.username, props.sessionStore.access_token)
    }

    function removeFriend(friendname) {
        props.userStore.delFriend(friendname,  props.sessionStore.access_token)
    }

</script>

<style scoped>

    .ft-status-bubble-position {
        z-index: 2;
        position: relative;
        top: 2.5rem;
    }

    #ft-user-profile-container {
        position: relative;
        left: 1rem;
        z-index: 9;
    }

    #title-profile {
        text-overflow: ellipsis;
        font-size: 2rem;
        width: 10em;
        border-bottom: 1.5em solid var(--light-purple);
    }

    .ft-profile-pic#current-profile-pic {
        position: relative;
        top: 3em;
        z-index:1;
        background-size: cover !important;
    }
    .ft-tab-content {
        min-width: 100%;
        box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
    }
    .ft-central-tab-container.ft-tab-content {
        background: var(--light-purple);
    }
    .ft-connection-circle#current-profile-pic {
        position:relative;
        top: 2.5em;
        z-index:2;
    }
</style>