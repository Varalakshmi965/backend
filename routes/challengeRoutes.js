import express from "express";
import {
  createChallenge,
  joinChallenge,
  getLeaderboard,
} from "../controllers/challengeController.js";

const router = express.Router();

router.post("/", createChallenge);
router.post("/join", joinChallenge);
router.get("/:challengeId/leaderboard", getLeaderboard);

export default router;