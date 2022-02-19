import { Match } from "./../models/match";
export const matches: Match[] = [
  {
    id: "1",

    player1: { id: "1", username: "mike" },
    player1Position: 200,

    player2: { id: "2", username: "fede" },
    player2Position: 200,

    points: { player1: 0, player2: 0 },

    lastPoint: null,

    ballPosition: { x: 200, y: 200 },

    ballXDirection: 1,
    ballYDirection: 1,

    status: "pre_start",
  },
];
