export enum GameModeType {
  NORMAL = 'NORMAL',
}

export type GameModeConfig = {
  INITIAL_HEIGHT: number;
  GAME_HEIGHT: number;
  GAME_WIDTH: number;
  BALL_SPEED: number;
  BALL_DIAMETER: number;
  PADDLE_SPEED: number;
  PADDLE_SIZE: number;
  NUMBER_OF_ROUNDS: number;
};

export const GameModeList = new Map<GameModeType, GameModeConfig>();
GameModeList.set(GameModeType.NORMAL, {
  INITIAL_HEIGHT: 300,
  GAME_HEIGHT: 498,
  GAME_WIDTH: 756,
  BALL_SPEED: 2,
  BALL_DIAMETER: 10,
  PADDLE_SPEED: 10,
  PADDLE_SIZE: 60,
  NUMBER_OF_ROUNDS: 3,
});
