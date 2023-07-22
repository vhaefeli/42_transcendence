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
  PADDLE_COLLISION_EXTENSION: number;
  NUMBER_OF_ROUNDS: number;
  PADDLE_DISTANCE_FROM_BORDER: number;
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
  PADDLE_COLLISION_EXTENSION: 20,
  NUMBER_OF_ROUNDS: 10,
  PADDLE_DISTANCE_FROM_BORDER: 15,
});
