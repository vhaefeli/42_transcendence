import axios, { type AxiosRequestConfig } from "axios";
import { defineStore } from "pinia";

type Me = {
  username: string;
  access_token: string;
  avatar_url: string;
};

type State = {
  isLoggedIn: boolean;
  user: Me;
};

type Payload = {
  username: string;
  password: string;
};

enum Method {
  Get,
  Post,
  Delete,
  Put,
  Patch,
}

export const useLoginStore = defineStore("LoginStore", {
  state: (): State => ({
    isLoggedIn: false,
    user: { username: "", access_token: "", avatar_url: "" },
  }),
  actions: {
    async CreateUser(payload: Payload): Promise<boolean> {
      const response = await axios({
        url: '/api/user/new',
        method: 'post',
        headers: { "Content-Type": "application/json" },
        data: payload,
      });
      console.log(response);
      if (!payload.username.length || !payload.username.length) {
        console.log("Credentials are missing");
        return false;
      }
      return true;
    },
  },
});
