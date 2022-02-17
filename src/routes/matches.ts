import uuid4 from "uuid4";
import express from "express";
import { matches } from "../data/matches";
import { users } from "../data/users";
import { Socket } from "socket.io";
import { io } from "../app";
import checkToken from "../middlewares/checkToken";

const router = express.Router();

router.get("/:id", ({ params: { id } }: { params: { id: string } }, res) => {
  const match = matches.find((match) => match.id === id);

  res
    .status(match ? 200 : 404)
    .json(match ? match : { message: "Match not found" });
});

router.get("/", (_, res) =>
  matches.length > 0
    ? res.status(200).json(matches)
    : res.status(404).json({ message: "There aren't matches" })
);

router.post("/", checkToken, (_, res) => {
  const user = users.find(
    ({ id }) => res.locals.checkTokenResponse.userId === id
  );

  const match = {
    id: uuid4(),

    player1: {
      id: user!.id,
      username: user!.username,
    },
    player1Position: 200,

    player2: null,
    player2Position: 200,

    ballPosition: { x: 200, y: 200 },

    ballXDirection: 1,
    ballYDirection: 1,

    status: "pre_start",
  };

  matches.push(match);

  res.status(200).json(match);
});

router.post("/:id/play", ({ params: { id } }, res) => {
  const matchIndex = matches.findIndex((match) => match.id === id);

  if (matchIndex !== -1) {
    matches[matchIndex].status = "in_progress";

    const playerWidth = 100;
    const playerHeight = 20;

    const ballPosition = { x: 150, y: 250 };

    let ballXDirection = 1;
    let ballYDirection = 1;

    let player2Direction = 1;

    const windowWidth: number = 300;
    const windowHeight: number = 500;

    const ballMoving = () => {
      let player1Position = matches[matchIndex].player1Position;
      let player2Position = matches[matchIndex].player2Position;

      const prevBallXDirection = ballXDirection;
      const prevBallYDirection = ballYDirection;

      const position = {
        x:
          ballXDirection > 0
            ? ballPosition.x < windowWidth - 20
              ? ballPosition.x++
              : (ballXDirection = -1)
            : ballPosition.x > 0
            ? ballPosition.x--
            : (ballXDirection = 1),
        y:
          ballYDirection > 0
            ? ballPosition.y + 20 > windowHeight - (playerHeight + 10) &&
              ballPosition.x + 20 > player1Position &&
              ballPosition.x < player1Position + playerWidth
              ? (ballYDirection = -1)
              : ballPosition.y + 20 < windowHeight
              ? ballPosition.y++
              : (ballYDirection = -1)
            : ballPosition.y < playerHeight + 20 &&
              ballPosition.x > player2Position &&
              ballPosition.x < player2Position + playerWidth
            ? (ballYDirection = 1)
            : ballPosition.y > 0
            ? ballPosition.y--
            : (ballYDirection = 1),
      };

      /* ballXDirection !== prevBallXDirection && io.to("match1").emit("sendData");
      ballYDirection !== prevBallYDirection && io.to("match1").emit("sendData"); */

      matches[matchIndex].ballPosition = position;
      matches[matchIndex].ballXDirection = ballXDirection;
      matches[matchIndex].ballYDirection = ballYDirection;
    };

    const player2AutoMoving = () => {
      let player2Position = matches[matchIndex].player2Position;

      const position =
        player2Direction > 0
          ? player2Position + playerWidth < windowWidth
            ? player2Position++
            : (player2Direction = -1)
          : player2Position-- > 0
          ? player2Position--
          : (player2Direction = 1);

      matches[matchIndex].player2Position = position;
    };

    const gameRun = setInterval(() => {
      ballMoving();

      if (matches[matchIndex].status === "finished") {
        clearInterval(gameRun);

        res.status(200).json({ message: "Match stopped" });
      }
    }, 5);
  }
});

router.post("/:id/stop", ({ params: { id } }, res) => {
  const matchIndex = matches.findIndex((match) => match.id === id);

  if (matchIndex !== -1) {
    matches[matchIndex].status = "finished";

    res.status(200).json(matches[matchIndex]);
  } else {
    res.status(404).json({ message: "Match not found" });
  }
});

router.post(
  "/:id/move",
  ({ params: { id }, body: { playerId, playerPosition } }, res) => {
    const matchIndex = matches.findIndex((match) => match.id === id);
    if (matchIndex !== -1) {
      //playerId = sessions.find(({ userId }) => userId === playerId);

      /* console.log(matches[matchIndex].player1 + " - " + playerId);
      console.log(matches[matchIndex].player2 + " - " + playerId); */

      matches[matchIndex].player1 === playerId
        ? (matches[matchIndex].player1Position = playerPosition)
        : matches[matchIndex].player2 === playerId
        ? (matches[matchIndex].player2Position = playerPosition)
        : res.status(404).json({ message: "Wrong player ID" });

      io.emit("playerMoved");
      res.status(200).json(matches[matchIndex]);
    } else {
      res.status(404).json({ message: "Match not found" });
    }
  }
);

export default router;
