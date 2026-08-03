const KundliCache = require("../models/KundliCache");

const getKundli = async ({ datetime, latitude, longitude, ayanamsa }) => {
  return KundliCache.findOne({
    datetime,
    latitude,
    longitude,
    ayanamsa,
  }).lean();
};

const saveKundli = async ({ datetime, latitude, longitude, ayanamsa, data }) => {
  return KundliCache.findOneAndUpdate(
    {
      datetime,
      latitude,
      longitude,
      ayanamsa,
    },
    { $set: { data } },
    { new: true, upsert: true, lean: true }
  ).lean();
};

module.exports = {
  getKundli,
  saveKundli,
};
