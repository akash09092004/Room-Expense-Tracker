const express = require("express");
const router = express.Router();

const {
  createGroup,
  joinGroup,
  getGroup,
  removeMember,
  refreshInviteCode,
} = require("../controllers/groupController");

const authMiddleware = require("../middleware/authMiddleware");

// Create Group
router.post(
  "/create",
  authMiddleware,
  createGroup
);

// Join Group
router.post(
  "/join",
  authMiddleware,
  joinGroup
);

// Remove group member (admin only)
router.delete(
  "/member/:memberId",
  authMiddleware,
  removeMember
);

// Get Current Group Details
router.get(
  "/me",
  authMiddleware,
  getGroup
);

router.put(
  "/invite-code/refresh",
  authMiddleware,
  refreshInviteCode
);

module.exports = router;
