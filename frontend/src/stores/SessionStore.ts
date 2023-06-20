import { defineStore } from "pinia";

type State = {
  isLoggedIn: boolean;
  access_token: string;
  username: string;
};

export const useSessionStore = defineStore("sessionStore", {
  state: (): State => ({
    isLoggedIn: false,
    access_token: "",
    username: "",
  }),
  persist: true,
});
