export interface Match {
  id: string;

  player1: Player;
  player1Position: number;

  player2: Player | null;
  player2Position: number;

  points: Points;

  lastPoint: Player | null;

  ballPosition: ICoordinates;

  ballXDirection: number;
  ballYDirection: number;

  status: string;
}

export interface Points {
  player1: number;
  player2: number;
}

export interface Player {
  id: string;
  username: string;
}

export interface ICoordinates {
  x: number;
  y: number;
}
