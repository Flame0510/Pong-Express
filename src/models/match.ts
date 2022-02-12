export interface IMatch {
  id: string;
  player1Position: number;
  player2Position: number;
  ballPosition: ICoordinates;
}

interface ICoordinates {
  x: number;
  y: number;
}
