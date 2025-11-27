// -----------------------
// Time helpers (weekly, per-day midnight resets)
// -----------------------
const WEEKDAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function getTodayKey() {
  const dayIdx = new Date().getDay(); // 0..6 (Sun..Sat)
  const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[dayIdx];
}

// Next local 00:00 of the given weekday index (schedule into the future)
function nextLocalMidnightOfWeekday(weekdayIndex) {
  const now = new Date();

  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  let daysAhead = (weekdayIndex - now.getDay() + 7) % 7;
  const target = new Date(todayMidnight);
  target.setDate(target.getDate() + daysAhead);

  if (target <= now) {
    target.setDate(target.getDate() + 7);
  }
  return target;
}

// Most recent local 00:00 of that weekday (<= now)
function mostRecentLocalMidnightOfWeekday(weekdayIndex) {
  const now = new Date();
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  const daysSince = (now.getDay() - weekdayIndex + 7) % 7;
  const target = new Date(todayMidnight);
  target.setDate(target.getDate() - daysSince);
  return target;
}

module.exports = { WEEKDAY_INDEX, getTodayKey, nextLocalMidnightOfWeekday, mostRecentLocalMidnightOfWeekday };