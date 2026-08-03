const matchingService = require("../services/matchingService");

const getMatching = async (req, res, next) => {
  try {
    const { boy, girl } = req.body;
    const result = await matchingService.getMatchingResult({ boy, girl });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatching,
};
