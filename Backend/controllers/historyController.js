const KundliCache = require("../models/KundliCache");
const MatchingCache = require("../models/MatchingCache");
const PanchangCache = require("../models/PanchangCache");
const NumerologyCache = require("../models/NumerologyCache");
const ChatHistory = require("../models/ChatHistory");

const getUserHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [kundlis, matchings, panchangs, numerologies, chat] = await Promise.all([
      KundliCache.find().sort({ updatedAt: -1 }).limit(5).lean(),
      MatchingCache.find().sort({ updatedAt: -1 }).limit(5).lean(),
      PanchangCache.find().sort({ date: -1 }).limit(5).lean(),
      NumerologyCache.find().sort({ updatedAt: -1 }).limit(5).lean(),
      ChatHistory.findOne({ userId }).lean(),
    ]);

    const items = [];

    (kundlis || []).forEach((k) => {
      items.push({
        id: k._id,
        type: "Kundli",
        title: "Vedic Kundli Chart Generated",
        subtitle: `Latitude: ${k.latitude}, Longitude: ${k.longitude}`,
        date: k.createdAt || k.updatedAt,
      });
    });

    (matchings || []).forEach((m) => {
      items.push({
        id: m._id,
        type: "Matching",
        title: "Kundli Matching Assessment",
        subtitle: `Guna score cached for partners`,
        date: m.createdAt || m.updatedAt,
      });
    });

    (panchangs || []).forEach((p) => {
      items.push({
        id: p._id,
        type: "Panchang",
        title: `Daily Panchang (${p.date})`,
        subtitle: "Solar & lunar transitions recorded",
        date: p.createdAt || p.updatedAt,
      });
    });

    (numerologies || []).forEach((n) => {
      items.push({
        id: n._id,
        type: "Numerology",
        title: `Life Path Numerology (${n.dateOfBirth})`,
        subtitle: "Birth grid number calculation",
        date: n.createdAt || n.updatedAt,
      });
    });

    if (chat && chat.messages && chat.messages.length > 0) {
      items.push({
        id: chat._id,
        type: "AI Chat",
        title: "Astro AI Guide Consultations",
        subtitle: `${chat.messages.length} cosmic messages exchanged`,
        date: chat.updatedAt || chat.createdAt,
      });
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUserHistory,
};
