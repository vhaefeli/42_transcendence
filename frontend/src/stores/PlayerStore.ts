import { defineStore } from "pinia";

type Player = {
  username: string;
  friends: object;
};

type State = {
  player: Player[];
  isRequestLoading: boolean;
};

export const usePlayerStore = defineStore("playerStore", {
  state: (): State => ({
    player: [],
    isRequestLoading: false,
  }),
  actions: {
    async getUserName(): Promise<void> {
      const promise: Promise<Player[]> = new Promise((resolve) => {
        resolve([
          {
            username: "pouette",
            friends: [
              { id: 1, username: "kevin" },
              { id: 2, username: "Sabine" },
            ],
          },
        ]);
      });
      this.player = await promise;
    },
  },
});
