import { defineStore } from "pinia";

type State = {
  isLoggedIn: boolean;
  access_token: string;
};

export const useSessionStore = defineStore("sessionStore", {
  state: (): State => ({
    isLoggedIn: false,
    access_token: "",
  }),
  persist: true,
});
