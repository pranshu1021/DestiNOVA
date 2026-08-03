const panchangService = require("../services/panchangService");

const getPanchang = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await panchangService.getPanchangForUser(userId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPanchang,
};
