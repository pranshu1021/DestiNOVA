const PanchangCache = require("../models/PanchangCache");

const getPanchang = async ({ date, latitudeRounded, longitudeRounded, ayanamsa }) => {
  return PanchangCache.findOne({
    date,
    latitudeRounded,
    longitudeRounded,
    ayanamsa,
  }).lean();
};

const savePanchang = async ({ date, latitudeRounded, longitudeRounded, ayanamsa, data, expiresAt }) => {
  return PanchangCache.findOneAndUpdate(
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
  getPanchang,
  savePanchang,
};
