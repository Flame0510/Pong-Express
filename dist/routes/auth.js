"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var uuid4_1 = __importDefault(require("uuid4"));
var users_1 = require("../data/users");
var sessions_1 = require("../data/sessions");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var checkToken_1 = __importDefault(require("../middlewares/checkToken"));
var router = express_1.default.Router();
router.post("/sign-up", function (_a, res) {
    var _b = _a.body, username = _b.username, password = _b.password;
    if (users_1.users.find(function (user) { return user.username === username; })) {
        res.status(409).json({
            message: "There is another user with this username, please use another username",
        });
    }
    else {
        var user = { id: (0, uuid4_1.default)(), username: username, password: password };
        users_1.users.push(user), res.status(200).json(user);
    }
});
router.post("/login", function (_a, res) {
    var _b = _a.body, username = _b.username, password = _b.password;
    var user = users_1.users.find(function (user) { return user.username === username && user.password === password; });
    if (user) {
        var session = {
            id: (0, uuid4_1.default)(),
            userId: user.id,
            token: jsonwebtoken_1.default.sign({ data: Math.floor(Date.now() / 1000) }, username),
            lastAccess: new Date()
                .toLocaleString()
                .split("/")
                .join("-")
                .split(",")
                .join(" -"),
        };
        sessions_1.sessions.push(session);
        res.status(200).json(session);
    }
    else {
        res.status(404).json({ message: "Wrong Credentials" });
    }
});
router.get("/sessions", checkToken_1.default, function (_, res) { return res.status(200).json(sessions_1.sessions); });
router.get("/token", checkToken_1.default, function (_, res) {
    res.status(200).json(res.locals.checkTokenResponse);
});
router.get("/session", checkToken_1.default, function (_, res) {
    return res
        .status(200)
        .json(sessions_1.sessions.find(function (_a) {
        var userId = _a.userId;
        return res.locals.checkTokenResponse.userId === userId;
    }));
});
router.get("/me", checkToken_1.default, function (_, res) {
    return res
        .status(200)
        .json(users_1.users.find(function (_a) {
        var id = _a.id;
        return res.locals.checkTokenResponse.userId === id;
    }));
});
exports.default = router;
