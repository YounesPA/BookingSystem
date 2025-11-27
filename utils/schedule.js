const fs = require('fs');
const { mostRecentLocalMidnightOfWeekday, nextLocalMidnightOfWeekday, WEEKDAY_INDEX } = require('./timeHelpers')

// Startup freshness: if server missed a reset while offline, clear now.
function ensureWeeklyFreshnessOnBoot(key, cls, filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    const lastSaved = stat.mtime;
    const lastResetCutoff = mostRecentLocalMidnightOfWeekday(WEEKDAY_INDEX[key]);
    if (lastSaved < lastResetCutoff) {
      cls.resetParticipants();
      cls.saveToDisk();
      console.log(`🧹 Startup freshness: cleared ${key} (missed reset at ${lastResetCutoff.toString()})`);
    }
  } catch (e) {
    console.warn(`Could not apply startup freshness for ${key}:`, e.message);
  }
}

// Weekly schedule: reset that weekday at its local midnight
function scheduleWeeklyResetFor(key, cls) {
  const weekdayIdx = WEEKDAY_INDEX[key];
  const next = nextLocalMidnightOfWeekday(weekdayIdx);
  const delay = next.getTime() - Date.now();

  setTimeout(() => {
    cls.resetParticipants();
    cls.saveToDisk();
    console.log(`🔁 Weekly reset for ${key} ran at ${new Date().toString()}`);
    scheduleWeeklyResetFor(key, cls); // reschedule next week (handles DST)
  }, delay);

  console.log(`⏰ Scheduled weekly reset for ${key} at ${next.toString()}`);
}

module.exports = {ensureWeeklyFreshnessOnBoot, scheduleWeeklyResetFor };