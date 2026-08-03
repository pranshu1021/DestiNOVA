const kundliService = require("../services/kundliService");
const AppError = require("../utils/AppError");

const getKundli = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const kundliData = await kundliService.getKundliForUser(userId);
    res.json({
      success: true,
      data: kundliData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKundli,
};
