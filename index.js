/*const fs = require("fs");
const path = require("path");
const readline = require("readline");

const MondayClass = require("./MondayClass");
const WednesdayClass = require("./WednesdayClass");
const FridayClass = require("./FridayClass");
const SaturdayClass = require("./SaturdayClass");
const SundayClass = require("./SundayClass");

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

// Instantiate classes
const classes = {
  monday: new MondayClass(),
  wednesday: new WednesdayClass(),
  friday: new FridayClass(),
  saturday: new SaturdayClass(),
  sunday: new SundayClass()
};

// Attach storage paths (one file per weekday) + load from disk
for (const [key, cls] of Object.entries(classes)) {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  cls.setStoragePath(filePath);
  cls.loadFromDisk();
}

// --- Helpers ---
function getTodayKey() {
  // 0=Sun ... 6=Sat
  const dayIdx = new Date().getDay();
  const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[dayIdx];
}

function scheduleMidnightReset() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0); // next local midnight
  const msUntilMidnight = next.getTime() - now.getTime();

  setTimeout(() => {
    resetAllClasses();
    scheduleMidnightReset(); // reschedule after firing (handles DST)
  }, msUntilMidnight);
}

function resetAllClasses() {
  for (const key of Object.keys(classes)) {
    classes[key].resetParticipants();
    classes[key].saveToDisk(); // persist the cleared list
  }
  console.log("🔁 All classes have been reset at midnight.");
}

// --- CLI (loop) — allows multiple bookings today ---
function startCli() {
  const todayKey = getTodayKey();

  if (!classes[todayKey]) {
    console.log("ℹ️ No bookable class today");
    process.exit(0);
    return;
  }

  const todaysClass = classes[todayKey];
  console.log(
    `📅 Today is ${todaysClass.classDay}. Bookings open for: ${todaysClass.className} (limit: ${todaysClass.classParticipantLimit}).`
  );
  console.log(
    `👥 Current participants: ${todaysClass.classParticipants.join(", ") || "none"}`
  );
  console.log('Type a name to book, or type "exit" to quit.');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "> " });
  rl.prompt();

  rl.on("line", (line) => {
    const name = line.trim();
    if (!name) {
      rl.prompt();
      return;
    }
    if (name.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    try {
      todaysClass.addParticipant(name);
      todaysClass.saveToDisk(); // persist after each successful booking
      const info = todaysClass.getInfo();
      console.log(`✅ Booked ${name}. Spots left: ${info.spotsLeft}`);
      console.log(`👥 Now: ${info.currentParticipants.join(", ")}`);
    } catch (err) {
      console.error("❌ " + err.message);
    } finally {
      rl.prompt();
    }
  });

  rl.on("close", () => {
    console.log("Bye!");
    process.exit(0);
  });
}

// Kick off
scheduleMidnightReset();
startCli();*/