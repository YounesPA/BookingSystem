
// routes/admin.js
const express = require('express');

module.exports = (classes) => {
  const router = express.Router();

  /**
   * POST /admin/reset/:day
   * Header: x-admin-token: <ADMIN_TOKEN>
   * Supported :day values: monday, wednesday, friday, saturday
   */
  router.post('/reset/:day', (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const key = (req.params.day || "").toLowerCase();
    const cls = classes[key];

    if (!cls) return res.status(404).json({ error: "Unknown or unsupported day." });

    cls.resetParticipants();
    cls.saveToDisk();

    return res.json({ ok: true, message: `Manually reset ${key}.` });
  });

  return router;
};
