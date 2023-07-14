import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

import App from "./App.vue";
import Vue3Lottie from 'vue3-lottie'
import router from "./router";
import "./index.css";

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedState);

app.use(pinia);
app.use(Vue3Lottie);
app.use(router);

app.mount("#app");
