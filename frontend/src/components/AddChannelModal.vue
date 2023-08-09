<template>
    <h2 class="text-[2rem]">Create channel</h2>
    <div class="mb-6">
      <h3 class="ft-admin-title">Name of channel</h3>
      <input v-model="name" :placeholder="'name of channel'" class="p-1 mr-3 w-full" />

    </div>
    <div class="mb-6">
      <h3 class="ft-admin-title">Type of channel</h3>
      <div class="flex">
        <div class="grow mr-3">
          <div class=" mb-3">
            <button id="ft-channel-type" class="w-full flex justify-between items-center p-3" @click="toggle">{{ typeOfChannel }}</button>
            <div id="ft-channel-type-select" class="cursor-pointer mb-3" v-if="active">
              <div @click="changeType">Public</div>
              <div @click="changeType">Protected</div>
              <div @click="changeType">Private</div>
            </div>
          </div>
          <div v-if="typeOfChannel === 'PROTECTED'">
            <input v-model="password" :placeholder="'new password'" class="p-1 mr-3 w-full" />
          </div>
        </div>
      </div>
      <div v-if="sucessMsg.length > 0" class="opacity-40">{{ sucessMsg }}</div>
    </div>
    <div>
    </div>
    <a href="#" class="t-btn-pink ft-bg-color-chat ft-btn-admin h-fit"><button @click="createChannel">save</button></a>
</template>

<script setup lang="ts">
  import axios from "axios";
  import { ref } from 'vue'
  import { useRouter } from "vue-router";
  import { useToast } from "vue-toastification";

  const props = defineProps({
    sessionStore: Object,
  })

  type UpdateChanInfos = {
    name: string
    type: string
    password: string | undefined
  }

  const emits = defineEmits(['addToMyChannels'])

  // toast
  const toast = useToast()

  // routes
  const router = useRouter();

  const name = ref('')
  const password = ref('')

  const sucessMsg = ref('')
  const active = ref(false)
  const typeOfChannel = ref('PUBLIC')

  function toggle() {
        active.value = !active.value
    }

  function changeType(event) {
      typeOfChannel.value = event.target.innerText.toUpperCase( )
      active.value = !active.value
  }

  async function createChannel() {

    let newPassword
    if (password.value.length > 0) {
      newPassword = password.value
    } else {
      newPassword = undefined
    }
    const newInfos: UpdateChanInfos = {
      name: name.value,
      type: typeOfChannel.value,
      password: newPassword
    }

    await axios({
    url: '/api/chat/channel/new',
    method: "post",
    headers: { Authorization: `Bearer ${props.sessionStore.access_token}` },
    data: newInfos
    })
    .then((response) => {
        emits('addToMyChannels', { channelName: name.value, channelType: typeOfChannel.value, channelId: response.data.id })
        toast.success(name.value + " created");
        console.log(`New channel ${name.value} created`);
    })
    .catch((error) => {
        toast.error(`Error: ${error.response.data.message}`);
        if (error.response.status == 401) {
        console.log(
            `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
        router.push('/login?logout=true');
        } else if (error.response.status == 409) {
          console.log(
              `Channel name is already in use: ${error.response.status} ${error.response.statusText}`
          );
        } else if (error.response.status == 400) {
          console.log(
              `Invalid parameters: ${error.response.status} ${error.response.statusText}`
          );
        } else
        console.error(
            `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
  }

</script>

<style scoped>

#ft-channel-type:after {
    content: ">";
    display: inline-block;
    transform: rotate(90deg);
}

#ft-channel-type-select {
    background-color: var(--light);
}

#ft-channel-type {
    background-color: var(--light);
    margin-right: 1rem;
}
    
</style>