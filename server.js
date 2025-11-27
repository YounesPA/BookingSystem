// server.js
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const { init: initDB, init } = require('./db/init');
const { ensureWeeklyFreshnessOnBoot, scheduleWeeklyResetFor } = require('./utils/schedule');
const { getTodayKey } = require('./utils/timeHelpers')
const { getDataDir } = require('./utils/paths')

const authRouter = require('./routes/auth')

const MondayClass = require("./classes/MondayClass");
const WednesdayClass = require("./classes/WednesdayClass");
const FridayClass = require("./classes/FridayClass");
const SaturdayClass = require("./classes/SaturdayClass");

// -----------------------
// App & middleware
// -----------------------
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Serve a simple frontend from /public
app.use(express.static(path.join(__dirname, "public")));

const DATA_DIR = getDataDir();

initDB();

const classes = {
  monday: new MondayClass(),
  wednesday: new WednesdayClass(),
  friday: new FridayClass(),
  saturday: new SaturdayClass(),
};

// Attach storage paths, load from disk, Wire startup freshness + weekly schedules
for (const [key, cls] of Object.entries(classes)) {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  cls.setStoragePath(filePath);
  cls.loadFromDisk();
  ensureWeeklyFreshnessOnBoot(key, cls, filePath);
  scheduleWeeklyResetFor(key, cls);
}

//Routes
app.use('/auth', authRouter);
app.use('/health', require('./routes/health'));
app.use('/classes', require('./routes/classes')(classes));
app.use('/book', require('./routes/bookings')(classes));
app.use('/admin', require('./routes/admin')(classes));


// -----------------------
// Start server
// -----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Booking API listening on http://localhost:${PORT}`);
  console.log(`📄 Frontend available at http://localhost:${PORT}/`);
});
