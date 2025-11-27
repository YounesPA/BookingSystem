const express = require('express');
const router = express.Router();

module.exports = (health) => {
    // Health check
    router.get("/health", (_req, res) => res.json({ ok: true }));
}