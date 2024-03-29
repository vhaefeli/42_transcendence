import { mode_type } from '@prisma/client';

export type GameModeConfig = {
  GAME_HEIGHT: number;
  GAME_WIDTH: number;
  BALL_SPEED: number;
  BALL_DIAMETER: number;
  BALL_START_ROUND_WAIT: number;
  PADDLE_SPEED: number;
  PADDLE_SIZE: number;
  PADDLE_COLLISION_EXTENSION: number;
  POINTS_TO_WIN: number;
  PADDLE_DISTANCE_FROM_BORDER: number;
  GAME_COLOR: string;
};

export const GameModeList = new Map<mode_type, GameModeConfig>();

/*
 *
 * ***TODO***
 * Create fun game modes by changing the following variables:
 *    BALL_SPEED
 *    BALL_DIAMETER
 *    PADDLE_SPEED
 *    PADDLE_SIZE
 *    PADDLE_COLLISION_EXTENSION
 *    POINTS_TO_WIN
 *
 */

GameModeList.set(mode_type.BEGINNER, {
  GAME_HEIGHT: 498,
  GAME_WIDTH: 756,
  BALL_SPEED: 1.1,
  BALL_DIAMETER: 20,
  BALL_START_ROUND_WAIT: 1,
  PADDLE_SPEED: 10,
  PADDLE_SIZE: 100,
  PADDLE_COLLISION_EXTENSION: 0,
  POINTS_TO_WIN: 3,
  PADDLE_DISTANCE_FROM_BORDER: 15,
  GAME_COLOR: "rgba(148, 255, 237, 0.839)",
});

GameModeList.set(mode_type.INTERMEDIATE, {
  GAME_HEIGHT: 498,
  GAME_WIDTH: 756,
  BALL_SPEED: 2,
  BALL_DIAMETER: 10,
  BALL_START_ROUND_WAIT: 1,
  PADDLE_SPEED: 10,
  PADDLE_SIZE: 60,
  PADDLE_COLLISION_EXTENSION: 10,
  POINTS_TO_WIN: 5,
  PADDLE_DISTANCE_FROM_BORDER: 15,
  GAME_COLOR: "rgba(148, 221, 255, 0.839)",
});

GameModeList.set(mode_type.EXPERT, {
  GAME_HEIGHT: 498,
  GAME_WIDTH: 756,
  BALL_SPEED: 2.5,
  BALL_DIAMETER: 10,
  BALL_START_ROUND_WAIT: 1,
  PADDLE_SPEED: 13,
  PADDLE_SIZE: 40,
  PADDLE_COLLISION_EXTENSION: 20,
  POINTS_TO_WIN:11,
  PADDLE_DISTANCE_FROM_BORDER: 15,
  GAME_COLOR: "rgba(148, 169, 255, 0.839)",
});
