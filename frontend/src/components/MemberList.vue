<template>
      <div id="ft-members-container" class="h-full">
          <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container mb-6 h-full relative">
              <div class="ft-tab-folder" id="title-chat"></div>
              <div id="channel-title" class="ft-tab-content ft-title">{{ props.channelName }}</div>
              <div id="ft-member-list-container" class="ft-bg-color-chat h-[88%] w-full p-6">
                <div id="inside-member-list" class="flex flex-col h-[82%] bg-white/[.2] overflow-scroll max-h-[58vh] p-3">
                  <div v-for="member in MemberList" :key="member.id">
                    <div class="flex mb-2 items-center">
                      <div class="ft-profile-pic ft-profile-pic-small mr-3" id="current-profile-pic" :style="{ 'background': 'url(' + member.avatar_url + ')' }"></div>
                      <router-link class="ft-simple-link" :to= "'/user/' + member.username">{{member.username}}</router-link>
                    </div>
                  </div>
                </div>
              </div>
          </div>
      </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import axios from "axios";

    // // const emits = defineEmits(['updateBlocked'])

    const props = defineProps({
        channelName: String,
        sessionStore: Object,
        userStore: Object,
    })

    type ChanMembers = {
        id: number,
        username: string,
        status: string,
        avatar_url: string
    }

    const MemberList = ref<Array<ChanMembers>>([])
    
    const fakeMemberList = [
    {
      id: 1,
      username: "john_doe",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 2,
      username: "sarah_smith",
      status: "OFFLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 3,
      username: "alex_jones",
      status: "INGAME",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 4,
      username: "emma_wilson",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 5,
      username: "michael_brown",
      status: "OFFLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 6,
      username: "olivia_davis",
      status: "INGAME",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 7,
      username: "william_jackson",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 8,
      username: "ava_clark",
      status: "OFFLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 9,
      username: "noah_anderson",
      status: "INGAME",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    },
    {
      id: 10,
      username: "mia_harris",
      status: "ONLINE",
      avatar_url: "http://localhost:3000/avatar/default.jpg"
    }
  ]

    MemberList.value = fakeMemberList

</script>

<style scoped>

    #ft-members-container {
        position: relative;
        left: 1rem;
        z-index: 9;
    }

    #ft-member-list-container {
        box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
    }

    #title-chat {
        text-overflow: ellipsis;
        font-size: 2rem;
        width: 10em;
        border-bottom: 1.5em solid var(--dark-pink);
    }

    #channel-title {
        position: absolute;
        top: 1rem;
    }

    .ft-profile-pic-small {
      width: 4em;
      height: 4em;
      background-size: cover !important;
    }
</style>