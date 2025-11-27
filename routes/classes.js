
const express = require('express');
const router = express.Router();

module.exports = (classes) => {
  router.get('/', (_req, res) => {
    const payload = Object.fromEntries(Object.entries(classes).map(([key, c]) => [key, c.getInfo()]));
    res.json(payload);
  });

  router.get('/today', (_req, res) => {
    const { getTodayKey } = require('../utils/timeHelpers');
    const todayKey = getTodayKey();
    if (!classes[todayKey]) return res.json({ message: "No classes on weekends." });
    res.json(classes[todayKey].getInfo());
  });

  router.get('/:day', (req, res) => {
    const key = (req.params.day || "").toLowerCase();
    if (!classes[key]) return res.status(404).json({ error: "Unknown or unsupported day." });
    res.json(classes[key].getInfo());
  });

  return router;
};
