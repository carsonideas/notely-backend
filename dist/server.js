"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT) || 5000;
console.log(`HOUSTON!!! are we ok...!!!,are ready to gooo........!!!`);
app_1.default.listen(PORT, '0.0.0.0', () => {
    console.log(`HOUSTON!! the App running on port ${PORT}... Yikes....!!`);
});
//# sourceMappingURL=server.js.map