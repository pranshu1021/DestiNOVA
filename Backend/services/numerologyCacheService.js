const NumerologyCache = require("../models/NumerologyCache");

const getNumerology = async ({ dateOfBirth }) => {
  return NumerologyCache.findOne({ dateOfBirth }).lean();
};

const saveNumerology = async ({ dateOfBirth, data }) => {
  return NumerologyCache.findOneAndUpdate(
    { dateOfBirth },
    { $set: { data } },
    { new: true, upsert: true, lean: true }
  ).lean();
};

module.exports = {
  getNumerology,
  saveNumerology,
};
