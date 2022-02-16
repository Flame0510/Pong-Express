export interface Match {
  id: string;

  player1: string;
  player1Position: number;

  player2: string | null;
  player2Position: number;

  ballPosition: ICoordinates;

  ballXDirection: number;
  ballYDirection: number;

  status: string;
}

interface ICoordinates {
  x: number;
  y: number;
}
