export function transformLevel(level: string): string {
  switch (level) {
    case 'BEGINNER':
      return 'PICKLE';
    case 'INTERMEDIATE':
      return 'PINEAPPLE';
    case 'EXPERT':
      return 'PITAYA';
    default:
      return 'POTATO';
  }
}
