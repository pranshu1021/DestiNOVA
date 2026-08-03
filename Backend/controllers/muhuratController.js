const muhuratService = require("../services/muhuratService");

const getMuhurat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await muhuratService.getMuhuratForUser(userId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMuhurat,
};
