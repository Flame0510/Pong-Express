"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid4_1 = __importDefault(require("uuid4"));
var express_1 = __importDefault(require("express"));
var matches_1 = require("../data/matches");
var users_1 = require("../data/users");
var app_1 = require("../app");
var router = express_1.default.Router();
router.get("/:id", function (_a, res) {
    var id = _a.params.id;
    var match = matches_1.matches.find(function (match) { return match.id === id; });
    res
        .status(match ? 200 : 404)
        .json(match ? match : { message: "Match not found" });
});
router.post("/", function (_a, res) {
    var playerId = _a.headers.playerId;
    if (users_1.users.find(function (user) { return user.id === playerId; })) {
        var match = {
            id: (0, uuid4_1.default)(),
            player1: playerId,
            player1Position: 200,
            player2: null,
            player2Position: 200,
            ballPosition: { x: 200, y: 200 },
            status: "pre_start",
        };
        matches_1.matches.push(match);
        res.status(200).json(match);
    }
    else {
        res.status(404).json({ message: "Wrong ID" });
    }
});
router.post("/:id/play", function (_a, res) {
    var id = _a.params.id;
    var matchIndex = matches_1.matches.findIndex(function (match) { return match.id === id; });
    if (matchIndex !== -1) {
        matches_1.matches[matchIndex].status = "in_progress";
        var playerWidth_1 = 100;
        var playerHeight_1 = 20;
        var player1Position_1 = matches_1.matches[matchIndex].player1Position - playerWidth_1 / 2;
        var player2Position_1 = matches_1.matches[matchIndex].player2Position - playerWidth_1 / 2;
        var ballPosition_1 = { x: 150, y: 280 };
        var ballXDirection_1 = 1;
        var ballYDirection_1 = 1;
        var player2Direction_1 = 1;
        var windowWidth_1 = 300;
        var windowHeight_1 = 560;
        var ballMoving_1 = function () {
            var prevBallXDirection = ballXDirection_1;
            var prevBallYDirection = ballYDirection_1;
            var position = {
                x: ballXDirection_1 > 0
                    ? ballPosition_1.x < windowWidth_1 - 20
                        ? ballPosition_1.x++
                        : (ballXDirection_1 = -1)
                    : ballPosition_1.x-- > 0
                        ? ballPosition_1.x--
                        : (ballXDirection_1 = 1),
                y: ballYDirection_1 > 0
                    ? ballPosition_1.y > windowHeight_1 - (playerHeight_1 + 30) &&
                        ballPosition_1.x > player1Position_1 &&
                        ballPosition_1.x < player1Position_1 + playerWidth_1
                        ? (ballYDirection_1 = -1)
                        : ballPosition_1.y < windowHeight_1 - 20
                            ? ballPosition_1.y++
                            : (ballYDirection_1 = -1)
                    : ballPosition_1.y-- < playerHeight_1 + 20 &&
                        ballPosition_1.x > player2Position_1 &&
                        ballPosition_1.x < player2Position_1 + playerWidth_1
                        ? (ballYDirection_1 = 1)
                        : ballPosition_1.y-- > 0
                            ? ballPosition_1.y--
                            : (ballYDirection_1 = 1),
            };
            /* ballXDirection !== prevBallXDirection && io.to("match1").emit("sendData");
            ballYDirection !== prevBallYDirection && io.to("match1").emit("sendData"); */
            matches_1.matches[matchIndex].ballPosition = position;
        };
        var player2AutoMoving = function () {
            var position = player2Direction_1 > 0
                ? player2Position_1 + playerWidth_1 < windowWidth_1
                    ? player2Position_1++
                    : (player2Direction_1 = -1)
                : player2Position_1-- > 0
                    ? player2Position_1--
                    : (player2Direction_1 = 1);
            matches_1.matches[matchIndex].player2Position = position;
        };
        var gameRun_1 = setInterval(function () {
            ballMoving_1();
            if (matches_1.matches[matchIndex].status === "finished") {
                clearInterval(gameRun_1);
                res.status(200).json({ message: "Match stopped" });
            }
        }, 10);
    }
});
router.post("/:id/stop", function (_a, res) {
    var id = _a.params.id;
    var matchIndex = matches_1.matches.findIndex(function (match) { return match.id === id; });
    if (matchIndex !== -1) {
        matches_1.matches[matchIndex].status = "finished";
        res.status(200).json(matches_1.matches[matchIndex]);
    }
    else {
        res.status(404).json({ message: "Match not found" });
    }
});
router.post("/:id/move", function (_a, res) {
    var id = _a.params.id, _b = _a.body, playerId = _b.playerId, playerPosition = _b.playerPosition;
    var matchIndex = matches_1.matches.findIndex(function (match) { return match.id === id; });
    if (matchIndex !== -1) {
        //playerId = sessions.find(({ userId }) => userId === playerId);
        /* console.log(matches[matchIndex].player1 + " - " + playerId);
        console.log(matches[matchIndex].player2 + " - " + playerId); */
        matches_1.matches[matchIndex].player1 === playerId
            ? (matches_1.matches[matchIndex].player1Position = playerPosition)
            : matches_1.matches[matchIndex].player2 === playerId
                ? (matches_1.matches[matchIndex].player2Position = playerPosition)
                : res.status(404).json({ message: "Wrong player ID" });
        app_1.io.emit("playerMoved");
        res.status(200).json(matches_1.matches[matchIndex]);
    }
    else {
        res.status(404).json({ message: "Match not found" });
    }
});
exports.default = router;
