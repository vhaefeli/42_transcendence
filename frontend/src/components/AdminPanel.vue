<template>
    <div class="flex">
        <div class="w-1/2">
            <div>
                <h3>Name of channel</h3>
                <input v-model="channelName" :placeholder="props.currentName" class="p-1 mr-4" />
                <a href="#" class="t-btn-pink ft-bg-color-chat"><button @click="saveName">save</button></a>
            </div>
            <div>
                <h3>Type of channel</h3>
                <button @click="toggle">{{ typeOfChannel }}</button>
                <div class="cursor-pointer" v-if="active">
                    <div @click="changeType">Public</div>
                    <div @click="changeType">Protected</div>
                    <div @click="changeType">Private</div>
                </div>
                <a href="#" class="t-btn-pink ft-bg-color-chat"><button @click="saveType">save</button></a>
            </div>
            <div>
                <h3>Manage administrators</h3>
            </div>
            <div>
                <h3>Owner</h3>
            </div>
        </div>
        <div class="w-1/2">
            <div>
                <h3>People banned</h3>
            </div>
            <div>
                <h3>People muted</h3>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const props = defineProps({
        currentName: String,
        currentType: String
    })


    const channelName = ref('')
    const active = ref(false)
    const typeOfChannel = ref(props.currentType)

    function toggle () {
        active.value = !active.value
    }

    function changeType(event) {
        typeOfChannel.value = event.target.innerText.toUpperCase( )
        active.value = !active.value
    }

    function saveName() {
        // api to change name of channel
    }

    function saveType() {
        // api to change type of channel
    }
</script>