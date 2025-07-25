"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const cloudinary_1 = require("../utils/cloudinary");
const router = express_1.default.Router();
router.get('/profile', auth_1.default, user_controller_1.default.getProfile);
router.put('/profile', auth_1.default, user_controller_1.default.updateProfile);
router.post('/avatar', auth_1.default, cloudinary_1.upload.single('avatar'), user_controller_1.default.uploadAvatar);
router.put('/password', auth_1.default, user_controller_1.default.updatePassword);
router.get('/notes', auth_1.default, user_controller_1.default.getUserNotes);
router.patch('/', auth_1.default, user_controller_1.default.updateProfile);
router.patch('/password', auth_1.default, user_controller_1.default.updatePassword);
exports.default = router;
//# sourceMappingURL=user.routes.js.map