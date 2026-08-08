const ConsultationSession = require("../models/ConsultationSession");
const { createRequest, acceptRequest, rejectRequest, endSession, getSessionsForUser, addReview } = require("../services/consultationService");
const { getIO } = require("../config/socket");

const emit = (event, room, data) => { try { getIO().to(String(room)).emit(event, data); } catch (_) {} };

const requestSession = async (req, res, next) => {
  try {
    const { session, alreadyExists } = await createRequest(req.user.id, req.body);
    const populated = await ConsultationSession.findById(session._id).populate("customerId", "fullName photo").populate("astrologerId", "fullName userId").lean();
    if (!alreadyExists) emit("consultation_request", populated.astrologerId.userId, { session: populated });
    return res.status(alreadyExists ? 200 : 201).json({ success: true, data: populated, alreadyExists });
  } catch (error) { return next(error); }
};
const accept = async (req, res, next) => { try { const session = await acceptRequest(req.params.sessionId, req.user.id); const data = session.toObject(); emit("consultation_accepted", session.customerId, { session: data }); emit("session_started", String(session._id), { session: data }); return res.json({ success: true, data }); } catch (error) { return next(error); } };
const reject = async (req, res, next) => { try { const session = await rejectRequest(req.params.sessionId, req.user.id); const data = session.toObject(); emit("consultation_rejected", session.customerId, { session: data }); return res.json({ success: true, data }); } catch (error) { return next(error); } };
const end = async (req, res, next) => { try { const session = await endSession(req.params.sessionId, req.user.id); const data = session.toObject(); emit("session_ended", String(session._id), { session: data }); return res.json({ success: true, data }); } catch (error) { return next(error); } };
const listMine = async (req, res, next) => { try { return res.json({ success: true, data: await getSessionsForUser(req.user.id, req.query.status) }); } catch (error) { return next(error); } };
const review = async (req, res, next) => { try { const rating = Number(req.body?.rating); if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." }); return res.json({ success: true, data: await addReview(req.params.sessionId, req.user.id, rating, req.body?.text) }); } catch (error) { return next(error); } };
module.exports = { requestSession, accept, reject, end, listMine, review };
