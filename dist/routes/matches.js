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
var checkToken_1 = __importDefault(require("../middlewares/checkToken"));
var router = express_1.default.Router();
router.get("/:id", function (_a, res) {
    var id = _a.params.id;
    var match = matches_1.matches.find(function (match) { return match.id === id; });
    res
        .status(match ? 200 : 404)
        .json(match ? match : { message: "Match not found" });
});
router.get("/", function (_, res) {
    return matches_1.matches.length > 0
        ? res.status(200).json(matches_1.matches)
        : res.status(404).json({ message: "There aren't matches" });
});
router.post("/", checkToken_1.default, function (_, res) {
    var user = users_1.users.find(function (_a) {
        var id = _a.id;
        return res.locals.checkTokenResponse.userId === id;
    });
    var match = {
        id: (0, uuid4_1.default)(),
        player1: {
            id: user.id,
            username: user.username,
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
    matches_1.matches.push(match);
    app_1.io.emit("refreshMatches");
    res.status(200).json(match);
});
router.put("/:id/join", checkToken_1.default, function (_a, res) {
    var id = _a.params.id;
    var matchIndex = matches_1.matches.findIndex(function (match) { return match.id === id; });
    if (matchIndex !== -1) {
        var user = users_1.users.find(function (user) { return user.id === res.locals.checkTokenResponse.userId; });
        if (matches_1.matches[matchIndex].player1.id !== user.id) {
            matches_1.matches[matchIndex].player2 = {
                id: user.id,
                username: user.username,
            };
            app_1.io.to(id).emit("player2-join");
            app_1.io.emit("refreshMatches");
            res.status(200).json(matches_1.matches[matchIndex]);
        }
        else {
            res.status(400).json({
                message: "You can't be player 1 and player 2 in the same match",
            });
        }
    }
    else {
        res.status(404).json({ message: "Match not found" });
    }
});
router.post("/:id/play", checkToken_1.default, function (_a, res) {
    var id = _a.params.id;
    var matchIndex = matches_1.matches.findIndex(function (match) { return match.id === id; });
    if (matchIndex !== -1) {
        matches_1.matches[matchIndex].status = "in_progress";
        var matchId_1 = matches_1.matches[matchIndex].id;
        var pointsToWin_1 = 6;
        var playerWidth_1 = 100;
        var playerHeight_1 = 20;
        var ballStartPosition_1 = { x: 150, y: 250 };
        var ballPosition_1 = ballStartPosition_1;
        var ballXDirection_1 = matches_1.matches[matchIndex].ballXDirection;
        var ballYDirection_1 = matches_1.matches[matchIndex].ballYDirection;
        var player2Direction_1 = 1;
        var windowWidth_1 = 300;
        var windowHeight_1 = 500;
        var ballMoving_1 = function () {
            var player1Position = matches_1.matches[matchIndex].player1Position;
            var player2Position = matches_1.matches[matchIndex].player2Position;
            var points = matches_1.matches[matchIndex].points;
            var prevBallXDirection = ballXDirection_1;
            var prevBallYDirection = ballYDirection_1;
            var position = {
                x: ballXDirection_1 > 0
                    ? ballPosition_1.x < windowWidth_1 - 20
                        ? ballPosition_1.x++
                        : (ballXDirection_1 = -1)
                    : ballPosition_1.x > 0
                        ? ballPosition_1.x--
                        : (ballXDirection_1 = 1),
                y: ballYDirection_1 > 0
                    ? ballPosition_1.y + 20 > windowHeight_1 - (playerHeight_1 + 10) &&
                        ballPosition_1.x + 20 > player1Position &&
                        ballPosition_1.x < player1Position + playerWidth_1
                        ? (ballYDirection_1 = -1)
                        : ballPosition_1.y + 20 < windowHeight_1
                            ? ballPosition_1.y++
                            : player2Point_1(-1, points)
                    : ballPosition_1.y < playerHeight_1 + 20 &&
                        ballPosition_1.x > player2Position &&
                        ballPosition_1.x < player2Position + playerWidth_1
                        ? (ballYDirection_1 = 1)
                        : ballPosition_1.y > 0
                            ? ballPosition_1.y--
                            : player1Point_1(1, points),
            };
            // ballXDirection !== prevBallXDirection && io.to("match1").emit("sendData");
            //ballYDirection !== prevBallYDirection && io.to("match1").emit("sendData");
            //ballYDirection !== prevBallYDirection && pause();
            matches_1.matches[matchIndex].points = points;
            matches_1.matches[matchIndex].ballPosition = position;
            matches_1.matches[matchIndex].ballXDirection = ballXDirection_1;
            matches_1.matches[matchIndex].ballYDirection = ballYDirection_1;
        };
        var pause_1 = function () { return (matches_1.matches[matchIndex].status = "pause"); };
        var resetBallPosition = function () {
            return (matches_1.matches[matchIndex].ballPosition = ballStartPosition_1);
        };
        var player1Point_1 = function (direction, points) {
            pause_1();
            points.player1++;
            if (points.player1 >= pointsToWin_1) {
                win_1(true);
            }
            else {
                matches_1.matches[matchIndex].lastPoint = matches_1.matches[matchIndex].player1;
                //matches[matchIndex].ballYDirection = 1;
                //pause();
                //resetBallPosition();
                app_1.io.to(matchId_1).emit("point", matches_1.matches[matchIndex].player1);
            }
            return (ballYDirection_1 = direction);
        };
        var player2Point_1 = function (direction, points) {
            pause_1();
            points.player2++;
            if (points.player2 >= pointsToWin_1) {
                win_1(false);
            }
            else {
                matches_1.matches[matchIndex].lastPoint = matches_1.matches[matchIndex].player2;
                //matches[matchIndex].ballYDirection = -1;
                //pause();
                //resetBallPosition();
                app_1.io.to(matchId_1).emit("point", matches_1.matches[matchIndex].player2);
            }
            return (ballYDirection_1 = direction);
        };
        var win_1 = function (isPlayer1) {
            matches_1.matches[matchIndex].status = "finished";
            app_1.io.to(matchId_1).emit(isPlayer1 ? "player-1-win" : "player-2-win");
            app_1.io.to(matchId_1).emit("leave-match");
        };
        var player2AutoMoving = function () {
            var player2Position = matches_1.matches[matchIndex].player2Position;
            var position = player2Direction_1 > 0
                ? player2Position + playerWidth_1 < windowWidth_1
                    ? player2Position++
                    : (player2Direction_1 = -1)
                : player2Position-- > 0
                    ? player2Position--
                    : (player2Direction_1 = 1);
            matches_1.matches[matchIndex].player2Position = position;
        };
        var gameRun_1 = setInterval(function () {
            if (matches_1.matches[matchIndex].status === "pause" ||
                matches_1.matches[matchIndex].status === "finished") {
                clearInterval(gameRun_1);
                app_1.io.emit("refreshMatches");
                res.status(200).json({ message: "Match stopped" });
            }
            else {
                ballMoving_1();
            }
        }, 3);
    }
});
router.post("/:id/status", function (_a, res) {
    var id = _a.params.id, status = _a.body.status;
    var matchIndex = matches_1.matches.findIndex(function (match) { return match.id === id; });
    if (matchIndex !== -1) {
        matches_1.matches[matchIndex].status = status;
        res.status(200).json(matches_1.matches[matchIndex]);
    }
    else {
        res.status(404).json({ message: "Match not found" });
    }
});
router.post("/:id/move", function (_a, res) {
    var _b;
    var id = _a.params.id, _c = _a.body, playerId = _c.playerId, playerPosition = _c.playerPosition;
    var matchIndex = matches_1.matches.findIndex(function (match) { return match.id === id; });
    if (matchIndex !== -1) {
        //playerId = sessions.find(({ userId }) => userId === playerId);
        /* console.log(matches[matchIndex].player1 + " - " + playerId);
        console.log(matches[matchIndex].player2 + " - " + playerId); */
        matches_1.matches[matchIndex].player1.id === playerId
            ? (matches_1.matches[matchIndex].player1Position = playerPosition)
            : ((_b = matches_1.matches[matchIndex].player2) === null || _b === void 0 ? void 0 : _b.id) === playerId
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
