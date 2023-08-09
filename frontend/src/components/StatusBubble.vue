<template>
    <div class="ft-status-bubble-container">
        <div v-if="status === 'ONLINE'">
            <div class="ft-connection-circle ft-bubble-status-online" title="is online"></div>
        </div>
        <div v-else-if="status === 'INGAME'">
            <div class="ft-connection-circle ft-bubble-status-ingame" title="is playing a game">
            <img src="../assets/icons/tennisBallBlack.png" alt="is playing" title="your friend is playing" class="ft-playing"></div>
        </div>
        <div v-else-if="status === 'OFFLINE'">
            <div class="ft-connection-circle ft-bubble-status-offline" title="is offline"></div>
        </div>
        <div v-else>
            <div class="ft-connection-circle ft-bubble-no-status" title="no infos on status"></div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        status: String,
    })

</script>

<style scoped>
    .ft-status-bubble-container {
        z-index: 2;
    }

    .ft-bubble-status-online {
        background: var(--green);
    }

    .ft-bubble-status-offline {
        background: var(--middle-gray);
    }

    .ft-bubble-status-ingame {
        background: var(--yellow);
        background-image: url(../assets/img/icons/tennisBallBlack.png);
        background-size: cover;
    }

    .ft-bubble-no-status {
        background: var(--light);
        border: 4px solid var(--purple);
    }
</style>