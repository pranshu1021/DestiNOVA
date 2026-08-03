const numerologyService = require("../services/numerologyService");

const getNumerology = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await numerologyService.getNumerologyForUser(userId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNumerology,
};
