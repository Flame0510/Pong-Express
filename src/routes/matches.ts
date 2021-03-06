import uuid4 from "uuid4";
import express from "express";
import { matches } from "../data/matches";
import { users } from "../data/users";
import { Socket } from "socket.io";
import { io } from "../app";
import checkToken from "../middlewares/checkToken";
import { ICoordinates, Match, Points } from "../models/match";

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

    points: { player1: 0, player2: 0 },

    lastPoint: null,

    ballPosition: { x: 200, y: 200 },

    ballXDirection: 1,
    ballYDirection: 1,

    status: "pre_start",
  };

  matches.push(match);

  io.emit("refreshMatches");

  res.status(200).json(match);
});

router.put("/:id/join", checkToken, ({ params: { id } }, res) => {
  const matchIndex = matches.findIndex((match) => match.id === id);

  if (matchIndex !== -1) {
    const user = users.find(
      (user) => user.id === res.locals.checkTokenResponse.userId
    );

    if (matches[matchIndex].player1.id !== user!.id) {
      matches[matchIndex].player2 = {
        id: user!.id,
        username: user!.username,
      };

      io.to(id).emit("player2-join");
      io.emit("refreshMatches");

      res.status(200).json(matches[matchIndex]);
    } else {
      res.status(400).json({
        message: "You can't be player 1 and player 2 in the same match",
      });
    }
  } else {
    res.status(404).json({ message: "Match not found" });
  }
});

router.post("/:id/play", checkToken, ({ params: { id } }, res) => {
  const matchIndex = matches.findIndex((match) => match.id === id);

  if (matchIndex !== -1) {
    matches[matchIndex].status = "in_progress";

    const matchId = matches[matchIndex].id;

    const pointsToWin = 6;

    const playerWidth = 100;
    const playerHeight = 20;

    const ballStartPosition: ICoordinates = { x: 150, y: 250 };

    const ballPosition = ballStartPosition;

    let ballXDirection = matches[matchIndex].ballXDirection;
    let ballYDirection = matches[matchIndex].ballYDirection;

    let player2Direction = 1;

    const windowWidth: number = 300;
    const windowHeight: number = 500;

    const ballMoving = () => {
      let player1Position = matches[matchIndex].player1Position;
      let player2Position = matches[matchIndex].player2Position;

      let points = matches[matchIndex].points;

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
              : player2Point(-1, points)
            : ballPosition.y < playerHeight + 20 &&
              ballPosition.x > player2Position &&
              ballPosition.x < player2Position + playerWidth
            ? (ballYDirection = 1)
            : ballPosition.y > 0
            ? ballPosition.y--
            : player1Point(1, points),
      };

      // ballXDirection !== prevBallXDirection && io.to("match1").emit("sendData");
      //ballYDirection !== prevBallYDirection && io.to("match1").emit("sendData");

      //ballYDirection !== prevBallYDirection && pause();

      matches[matchIndex].points = points;

      matches[matchIndex].ballPosition = position;
      matches[matchIndex].ballXDirection = ballXDirection;
      matches[matchIndex].ballYDirection = ballYDirection;
    };

    const pause = () => (matches[matchIndex].status = "pause");

    const resetBallPosition = () =>
      (matches[matchIndex].ballPosition = ballStartPosition);

    const player1Point = (direction: number, points: Points) => {
      pause();

      points.player1++;
      if (points.player1 >= pointsToWin) {
        win(true);
        points.player1 = pointsToWin;
      } else {
        matches[matchIndex].lastPoint = matches[matchIndex].player1;
        //matches[matchIndex].ballYDirection = 1;
        //pause();
        //resetBallPosition();

        io.to(matchId).emit("point", matches[matchIndex].player1);
      }

      return (ballYDirection = direction);
    };

    const player2Point = (direction: number, points: Points) => {
      pause();

      points.player2++;
      if (points.player2 >= pointsToWin) {
        win(false);
        points.player2 = pointsToWin;
      } else {
        matches[matchIndex].lastPoint = matches[matchIndex].player2;
        //matches[matchIndex].ballYDirection = -1;
        //pause();
        //resetBallPosition();
        io.to(matchId).emit("point", matches[matchIndex].player2);
      }

      return (ballYDirection = direction);
    };

    const win = (isPlayer1: boolean) => {
      matches[matchIndex].status = "finished";

      io.to(matchId).emit(isPlayer1 ? "player-1-win" : "player-2-win");

      io.to(matchId).emit("leave-match");
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
      if (
        matches[matchIndex].status === "pause" ||
        matches[matchIndex].status === "finished"
      ) {
        clearInterval(gameRun);

        io.emit("refreshMatches");

        res.status(200).json({ message: "Match stopped" });
      } else {
        ballMoving();
      }
    }, 3);
  }
});

router.post("/:id/status", ({ params: { id }, body: { status } }, res) => {
  const matchIndex = matches.findIndex((match) => match.id === id);

  if (matchIndex !== -1) {
    matches[matchIndex].status = status;

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

      matches[matchIndex].player1.id === playerId
        ? (matches[matchIndex].player1Position = playerPosition)
        : matches[matchIndex].player2?.id === playerId
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
