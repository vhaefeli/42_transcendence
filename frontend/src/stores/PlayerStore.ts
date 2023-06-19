import { defineStore } from 'pinia'

type Player = {
    userName: string
    friends: object
  }
  
type State = {
    player: Player[]
    isRequestLoading: boolean
}

export const usePlayerStore = defineStore('playerStore', {
    state: (): State => ({
        player: [],
        isRequestLoading: false,
      }),
     actions: {
        async getUserName(): Promise<void> {
            const promise: Promise<Player[]> = new Promise((resolve) => {
                resolve([
                    {
                        userName: 'pouette',
                        friends: [
                            {id: 1, userName: "kevin"},
                            {id: 2, userName: "Sabine"}
                        ],
                    },
                ])
            })
        
            this.player = await promise
        //   this.isRequestLoading = true
    
        //   const res = await fetch('http://localhost:3000/user/')
        //   const data = await res.json()

        //  this.player = data
        //  this.player[0].userName = 'Pouette'
        //  this.isRequestLoading = false
        }
    }
})
