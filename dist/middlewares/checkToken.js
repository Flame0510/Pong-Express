"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sessions_1 = require("../data/sessions");
var checkToken = function (_a, res, next) {
    var authorization = _a.headers.authorization;
    var token = (authorization === null || authorization === void 0 ? void 0 : authorization.includes("Bearer")) &&
        (authorization === null || authorization === void 0 ? void 0 : authorization.substring(authorization.lastIndexOf("Bearer ") + 7));
    var session = sessions_1.sessions.find(function (session) { return session.token === token; });
    return token
        ? session
            ? ((res.locals.checkTokenResponse = {
                id: session.id,
                userId: session.userId,
                token: token,
            }),
                next())
            : res.status(401).json({ message: "Wrong or Invalid Token" })
        : res.status(404).json({ message: "Token not found" });
};
exports.default = checkToken;
