const config = require("../config");
const logger = require("../utils/logger");

let GoogleGenAI = null;
try {
  const genai = require("@google/genai");
  GoogleGenAI = genai.GoogleGenAI || genai.GoogleGenerativeAI;
} catch (e) {
  logger.warn("gemini.sdk.not_loaded", { message: e.message });
}

const DEFAULT_FALLBACK_MESSAGE =
  "The cosmic stars are aligning. I am currently experiencing high spiritual traffic. Please ask your celestial question again in a moment.";

const generateAstrologyReply = async (user, chatHistory, userQuestion) => {
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    logger.warn("gemini.api_key_missing");
    return DEFAULT_FALLBACK_MESSAGE;
  }

  const systemInstruction = `You are DestiNOVA AI, an experienced Vedic astrology assistant.

You should answer naturally, conversationally and intelligently.

Use the user's birth details as context:
- Name: ${user.fullName || "Astro Seeker"}
- Gender: ${user.gender || "Not specified"}
- Date of Birth: ${user.dateOfBirth || "Not specified"}
- Birth Time: ${user.birthTime || "Not specified"}
- Birth Place: ${user.birthPlace || "Not specified"}

Never guarantee future events.
Never claim certainty.
Present predictions as astrology-based guidance.

Maintain conversation context from previous chat history.`;

  try {
    // Convert previous chat history into messages format
    const contents = [];

    // Add recent conversation history (up to last 10 messages)
    const recentHistory = (chatHistory || []).slice(-10);
    recentHistory.forEach((msg) => {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      });
    });

    // Add current user question
    contents.push({
      role: "user",
      parts: [{ text: userQuestion }],
    });

    const candidateModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    if (GoogleGenAI) {
      const ai = new GoogleGenAI({ apiKey });
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.9,
            },
          });

          if (response && response.text) {
            return response.text.trim();
          }
        } catch (modelErr) {
          logger.warn("gemini.model_attempt_failed", { model: modelName, message: modelErr.message });
        }
      }
    }

    // Direct REST API Fallback
    const axios = require("axios");
    for (const modelName of candidateModels) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const payload = {
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
        };

        const restRes = await axios.post(restUrl, payload, { timeout: 12000 });
        const replyText = restRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return replyText.trim();
        }
      } catch (restErr) {
        logger.warn("gemini.rest_attempt_failed", { model: modelName, message: restErr.message });
      }
    }

    return DEFAULT_FALLBACK_MESSAGE;
  } catch (error) {
    logger.error("gemini.generation_failed", { message: error.message, details: error.response?.data });
    return DEFAULT_FALLBACK_MESSAGE;
  }
};

module.exports = {
  generateAstrologyReply,
};
