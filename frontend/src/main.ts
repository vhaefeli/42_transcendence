import { createApp, markRaw } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import Toast, { PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";

import App from "./App.vue";
import Vue3Lottie from "vue3-lottie";
import router from "./router";
import "./index.css";
import { useRouter, type Router } from "vue-router";

declare module "pinia" {
  export interface PiniaCustomProperties {
    router: Router;
  }
}

// options for toast
const options: PluginOptions = {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true
};

const app = createApp(App);
const pinia = createPinia();

pinia.use(({ store }) => {
  store.router = markRaw(useRouter());
});
pinia.use(piniaPluginPersistedState);

app.use(pinia);
app.use(Vue3Lottie);
app.use(router);
app.use(Toast, options);

app.mount("#app");
