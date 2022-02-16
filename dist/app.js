"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
var cors_1 = __importDefault(require("cors"));
var socket_io_1 = require("socket.io");
exports.io = new socket_io_1.Server({
    cors: {
        origin: "http://localhost:8100",
    },
});
exports.io.on("connection", function (socket) { return socket.join("match1"); });
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true }));
var httpServer = (0, http_1.createServer)(app);
var auth_1 = __importDefault(require("./routes/auth"));
var matches_1 = __importDefault(require("./routes/matches"));
app.use("/auth", auth_1.default);
app.use("/matches", matches_1.default);
httpServer.listen(3000);
