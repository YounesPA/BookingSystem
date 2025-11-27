
// routes/bookings.js
const express = require('express');
const { getTodayKey } = require('../utils/timeHelpers');

module.exports = (classes) => {
  const router = express.Router();

  /**
   * POST /book
   * Body: { name: string, day?: string }  // day is optional and must equal today if provided
   */
  router.post('/', (req, res) => {
    const name = (req.body.name || "").trim();
    const requestedDay = (req.body.day || "").toLowerCase();
    const todayKey = getTodayKey();

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!classes[todayKey]) return res.status(400).json({ error: "No classes on weekends." });

    if (requestedDay && requestedDay !== todayKey) {
      return res.status(400).json({ error: "Can only book the class for today." });
    }

    const cls = classes[todayKey];
    try {
      cls.addParticipant(name);
      cls.saveToDisk();

      return res.status(201).json({
        message: `Booked ${name} into ${cls.className} on ${cls.classDay}.`,
        info: cls.getInfo(),
      });
    } catch (e) {
      // Detect if the person was added to the waiting list
      if (e.message.includes("added to the waiting list") || e.message.includes("waiting list")) {
        cls.saveToDisk();
        return res.status(201).json({
          message: e.message,
          info: cls.getInfo(),
        });
      }
      // Otherwise, regular error
      return res.status(400).json({ error: e.message });
    }
  });

  /**
   * DELETE /book
   * Body: { name: string, day?: string }  // day is optional and must equal today if provided
   */
  router.delete('/', (req, res) => {
    const name = (req.body?.name || "").trim();
    const requestedDay = (req.body?.day || "").toLowerCase();
    const todayKey = getTodayKey();

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!classes[todayKey]) return res.status(400).json({ error: "No classes on weekends." });

    if (requestedDay && requestedDay !== todayKey) {
      return res.status(400).json({ error: "Can only cancel for today's class." });
    }

    const cls = classes[todayKey];
    try {
      cls.removeParticipant(name);
      cls.saveToDisk();

      return res.status(200).json({
        message: `Cancelled ${name} from ${cls.className} on ${cls.classDay}.`,
        info: cls.getInfo(),
      });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

  return router;
};
