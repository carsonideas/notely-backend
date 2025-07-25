"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const note_controller_1 = __importDefault(require("../controllers/note.controller"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = express_1.default.Router();
router.get('/', auth_1.default, note_controller_1.default.getAllNotes);
router.get('/trash', auth_1.default, note_controller_1.default.getDeletedNotes);
router.get('/:noteId', auth_1.default, note_controller_1.default.getNote);
router.post('/', auth_1.default, note_controller_1.default.createNote);
router.put('/:noteId', auth_1.default, note_controller_1.default.updateNote);
router.patch('/:noteId', auth_1.default, note_controller_1.default.updateNote);
router.patch('/restore/:noteId', auth_1.default, note_controller_1.default.restoreNote);
router.delete('/:noteId', auth_1.default, note_controller_1.default.deleteNote);
exports.default = router;
//# sourceMappingURL=note.routes.js.map