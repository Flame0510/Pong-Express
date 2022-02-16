"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var uuid4_1 = __importDefault(require("uuid4"));
var users_1 = require("../data/users");
var sessions_1 = require("../data/sessions");
var router = express_1.default.Router();
router.post("/login", function (_a, res) {
    var _b = _a.body, username = _b.username, password = _b.password;
    var user = users_1.users.find(function (user) { return user.username === username && user.password === password; });
    if (user) {
        var session = { id: (0, uuid4_1.default)(), userId: user.id, username: username, password: password };
        sessions_1.sessions.push(session);
        res.status(200).json(session);
    }
    else {
        res.status(404).json({ message: "Wrong Credentials" });
    }
});
router.get("/sessions", function (_, res) { return res.status(200).json(sessions_1.sessions); });
router.get("/me/:playerId", function (_a, res) {
    var playerId = _a.params.playerId;
    var user = sessions_1.sessions.find(function (_a) {
        var id = _a.id;
        return id === playerId;
    });
    console.log(playerId);
    res
        .status(user ? 200 : 404)
        .json(users_1.users ? user : { message: "Not logged user" });
});
exports.default = router;
