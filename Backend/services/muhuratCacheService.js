const MuhuratCache = require("../models/MuhuratCache");

const getMuhurat = async ({ date, latitudeRounded, longitudeRounded, ayanamsa }) => {
  return MuhuratCache.findOne({
    date,
    latitudeRounded,
    longitudeRounded,
    ayanamsa,
  }).lean();
};

const saveMuhurat = async ({ date, latitudeRounded, longitudeRounded, ayanamsa, data, expiresAt }) => {
  return MuhuratCache.findOneAndUpdate(
    {
      date,
      latitudeRounded,
      longitudeRounded,
      ayanamsa,
    },
    { $set: { data, expiresAt } },
    { new: true, upsert: true, lean: true }
  ).lean();
};

module.exports = {
  getMuhurat,
  saveMuhurat,
};
