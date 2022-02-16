export interface IMatch {
  id: string;

  player1: string;
  player1Position: number;

  player2: string | null;
  player2Position: number;

  ballPosition: ICoordinates;

  status: string;
}

interface ICoordinates {
  x: number;
  y: number;
}
