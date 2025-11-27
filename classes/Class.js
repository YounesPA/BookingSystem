const fs = require("fs");
const path = require("path");

class Class {
  constructor(classDay, className, classParticipantLimit) {
    this.classDay = classDay;
    this.className = className;
    this.classParticipantLimit = classParticipantLimit;
    this.classParticipants = [];
    this.waitingList = []
    this._storagePath = null; // set by index.js
  }

  setStoragePath(filePath) {
    this._storagePath = filePath;
  }

  isFull() {
    return this.classParticipants.length >= this.classParticipantLimit;
  }

    addParticipant(name) {
    // Normalize name input
    const actualName = String(name).trim();
    if (!actualName) throw new Error("Name is required.");

    // If they're already booked, don't add again
    if (
      this.classParticipants.some(
        (n) => String(n).trim().toLowerCase() === actualName.toLowerCase()
      )
    ) {
      throw new Error(`${name} is already booked.`);
    }

    // Also check waiting list to avoid duplicates
    if (
      this.waitingList.some(
        (n) => String(n).trim().toLowerCase() === actualName.toLowerCase()
      )
    ) {
      throw new Error(`${name} is already on the waiting list.`);
    }

    if (this.isFull()) {
      // Add to waiting list if full
      this.waitingList.push(actualName);
      throw new Error(`Class is full. ${actualName} added to the waiting list.`);
    }

    this.classParticipants.push(actualName);
  }

  removeParticipant(name) {
    const target = String(name).trim().toLowerCase();
    const idx = this.classParticipants.findIndex(
      (n) => String(n).trim().toLowerCase() === target
    );
    if (idx === -1) throw new Error(`${name} is not enrolled in this class.`);
    this.classParticipants.splice(idx, 1);

    // If there’s room and people waiting, promote first person
    if (this.waitingList.length > 0 && !this.isFull()) {
      const promoted = this.waitingList.shift();
      this.classParticipants.push(promoted);
    }
  }

  resetParticipants() {
    this.classParticipants = [];
    this.waitingList = [];
  }

  // ---- Persistence helpers ----
  loadFromDisk() {
    if (!this._storagePath) return;
    if (!fs.existsSync(this._storagePath)) {
      // seed a new file
      this.saveToDisk();
      return;
    }
    const raw = fs.readFileSync(this._storagePath, "utf8");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data.classParticipants)) {
        this.classParticipants = data.classParticipants;
      }
      if (Array.isArray(data.waitingList)) {
        this.waitingList = data.waitingList;
      } else {
        this.waitingList = []; // default if missing
      }
      if (typeof data.className === "string") this.className = data.className;
      if (typeof data.classParticipantLimit === "number")
        this.classParticipantLimit = data.classParticipantLimit;
    } catch {
      // corrupt file? reset it
      this.saveToDisk();
    }
  }

  saveToDisk() {
    if (!this._storagePath) return;
    const payload = {
      classDay: this.classDay,
      className: this.className,
      classParticipantLimit: this.classParticipantLimit,
      classParticipants: this.classParticipants,
      waitingList: this.waitingList, // <<<< NEW LINE
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(this._storagePath, JSON.stringify(payload, null, 2), "utf8");
  }

  getInfo() {
    return {
      classDay: this.classDay,
      className: this.className,
      classParticipantLimit: this.classParticipantLimit,
      currentParticipants: this.classParticipants,
      waitingList: this.waitingList, // <<<< NEW LINE
      spotsLeft: this.classParticipantLimit - this.classParticipants.length,
    };
  }
}

module.exports = Class;
