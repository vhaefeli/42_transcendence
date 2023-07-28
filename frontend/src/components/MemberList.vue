<template>
  <div id="ft-members-container" class="h-full">
    <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container mb-6 h-full relative">
      <div class="ft-tab-folder" id="title-chat"></div>
      <div id="channel-title" class="ft-tab-content ft-title">{{ props.channelName }}</div>
      <div class="ft-bg-color-chat w-full pt-2">
        <p>{{ props.channelType }} CHANNEL</p>
        <div v-if="props.isAdmin"><button class="ft-simple-link" @click="toggleAdmin">{{ adminText }}</button></div>
      </div>
      <div id="ft-member-list-container" class="ft-bg-color-chat h-[78%] w-full p-6">
        <div id="inside-member-list" class="flex flex-col h-[82%] bg-white/[.2] overflow-scroll max-h-[58vh] p-3">
          <div v-for="member in MemberList" :key="member.id">
            <div v-if="member.username != props.username">
              <a href="#" @click="$emit('setProfileToShow', member.username)" class="flex mb-2 items-center ft-member-profile-container">
                <div class="ft-profile-pic ft-profile-pic-small mr-3" id="current-profile-pic" :style="{ 'background': 'url(' + member.avatar_url + ')' }"></div>
                <p>{{member.username}}</p>
              </a>
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

    const adminText = ref<string>("parameters")

    const emits = defineEmits(['showAdminPanel', 'setProfileToShow'])

    type ChanMembers = {
        id: number,
        username: string,
        status: string,
        avatar_url: string
    }
    
    const props = defineProps({
        username: String,
        channelName: String,
        sessionStore: Object,
        userStore: Object,
        channelType: String,
        isAdmin: Boolean,
        MemberList: Object
    })

    function toggleAdmin() {
      if (adminText.value === "parameters") {
        adminText.value = "close parameters"
      } else {
        adminText.value = "parameters"
      }
      emits('showAdminPanel', true)
    }

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

    .ft-member-profile-container:hover {
      background: var(--dark-pink);
      border-radius: 0.8rem;
    }

    .ft-member-profile-container:hover .ft-profile-pic:after {
      content: url(/src/assets/icons/gear-solid.svg);
      width: 100%;
      display: block;
      border-radius: 0.8rem;
      height: 100%;
      border-radius: 2rem;
      background-color: var(--dark-pink);
      mix-blend-mode: hard-light;
      padding: 0.5rem;
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