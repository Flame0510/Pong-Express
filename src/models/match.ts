export interface Match {
  id: string;

  player1: Player;
  player1Position: number;

  player2: Player | null;
  player2Position: number;

  ballPosition: ICoordinates;

  ballXDirection: number;
  ballYDirection: number;

  status: string;
}

interface Player {
  id: string;
  username: string;
}

interface ICoordinates {
  x: number;
  y: number;
}
