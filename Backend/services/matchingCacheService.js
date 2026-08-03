const MatchingCache = require("../models/MatchingCache");

const getMatching = async ({ boy_dob, boy_coordinates, girl_dob, girl_coordinates, ayanamsa }) => {
  return MatchingCache.findOne({
    boy_dob,
    boy_coordinates,
    girl_dob,
    girl_coordinates,
    ayanamsa,
  }).lean();
};

const saveMatching = async ({ boy_dob, boy_coordinates, girl_dob, girl_coordinates, ayanamsa, data }) => {
  return MatchingCache.findOneAndUpdate(
    {
      boy_dob,
      boy_coordinates,
      girl_dob,
      girl_coordinates,
      ayanamsa,
    },
    { $set: { data } },
    { new: true, upsert: true, lean: true }
  ).lean();
};

module.exports = {
  getMatching,
  saveMatching,
};
