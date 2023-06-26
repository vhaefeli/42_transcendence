import { statusService } from "@/services/status-socket.service";
import { defineStore } from "pinia";
import { uuid } from "vue-uuid";

type State = {
  isLoggedIn: boolean;
  access_token: string;
  uuid: string;
};

export const useSessionStore = defineStore("sessionStore", {
  state: (): State => ({
    isLoggedIn: false,
    access_token: "",
    uuid: "",
  }),
  actions: {
    getUUID(): string {
      if (!this.uuid.length) this.uuid = uuid.v4();
      return this.uuid;
    },
    async socket_connect() {
      statusService.ping();
    },
  },
  persist: {
    afterRestore(context) {
      statusService;
    },
  },
});
