const Group = require("../models/Group");
const User = require("../models/User");
const generateInviteCode = require("../utils/generateInviteCode");

const resolveUserGroup = async (user) => {
  if (!user) return null;

  if (user.currentGroup) {
    return Group.findById(user.currentGroup);
  }

  return Group.findOne({
    members: user._id,
  });
};

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    const group = await Group.create({
      name,
      inviteCode: generateInviteCode(),
      admin: req.user.id,
      members: [req.user.id],
    });

    await User.findByIdAndUpdate(req.user.id, {
      currentGroup: group._id,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const user = await User.findById(req.user.id);

    if (user.currentGroup) {
      return res.status(400).json({
        success: false,
        message: "Already joined a group",
      });
    }

    const group = await Group.findOne({
      inviteCode,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite code",
      });
    }

    group.members.push(user._id);

    await group.save();

    user.currentGroup = group._id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Joined successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const user = await User.findById(req.user.id);
    const group = await resolveUserGroup(user);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can remove members",
      });
    }

    if (memberId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove themselves",
      });
    }

    const member = await User.findById(memberId);

    if (!member || member.currentGroup?.toString() !== group._id.toString()) {
      return res.status(404).json({
        success: false,
        message: "Member not found in the group",
      });
    }

    group.members = group.members.filter(
      (id) => id.toString() !== memberId
    );

    await group.save();

    member.currentGroup = null;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Member removed",
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const group = await resolveUserGroup(user);
    const populatedGroup = group
      ? await Group.findById(group._id)
          .populate("members", "name email role")
          .populate("admin", "name email role")
      : null;

    res.status(200).json({
      success: true,
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.refreshInviteCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const group = await resolveUserGroup(user);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Only group admin can refresh invite code",
      });
    }

    let newInviteCode = generateInviteCode();
    let existingGroup = await Group.findOne({
      inviteCode: newInviteCode,
    });

    while (
      existingGroup &&
      existingGroup._id.toString() !==
        group._id.toString()
    ) {
      newInviteCode = generateInviteCode();
      existingGroup = await Group.findOne({
        inviteCode: newInviteCode,
      });
    }

    group.inviteCode = newInviteCode;
    await group.save();

    const populatedGroup = await Group.findById(
      group._id
    )
      .populate("members", "name email role")
      .populate("admin", "name email role");

    res.status(200).json({
      success: true,
      message: "Invite code refreshed",
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
