export class GameUpdateDto {
  id: number;

  p: [{ id: number; y: number }, { id: number; y: number }];

  b: { x: number; y: number };
}
