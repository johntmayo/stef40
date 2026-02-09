/**
 * Google Apps Script for The Redwood Portal
 *
 * Uses your existing sheet tabs: Guests, Itinerary, Wall
 * Optional: MistLevel and UserMoods (created automatically if missing).
 *
 * 1. Replace 'YOUR_SPREADSHEET_ID' with your Google Sheet ID (from the URL)
 * 2. Deploy as Web App: Execute as Me, Who has access: Anyone
 * 3. Use the Web App URL as NEXT_PUBLIC_GOOGLE_SCRIPT_URL
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

const SHEET_NAMES = {
  GUESTS: 'Guests',
  EVENTS: 'Itinerary',
  GUEST_NOTES: 'Wall',
  MIST_LEVEL: 'MistLevel',
  USER_MOODS: 'UserMoods',
  LOGISTICS: 'Logistics',
};

function doGet(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case 'getGuests':
        return ContentService.createTextOutput(JSON.stringify(getGuests()))
          .setMimeType(ContentService.MimeType.JSON);

      case 'getEvents':
        return ContentService.createTextOutput(JSON.stringify(getEvents(e.parameter.userName)))
          .setMimeType(ContentService.MimeType.JSON);

      case 'getAllEvents':
        return ContentService.createTextOutput(JSON.stringify(getAllEvents()))
          .setMimeType(ContentService.MimeType.JSON);

      case 'getGuestNotes':
        return ContentService.createTextOutput(JSON.stringify(getGuestNotes()))
          .setMimeType(ContentService.MimeType.JSON);

      case 'getMistLevel':
        return ContentService.createTextOutput(JSON.stringify(getMistLevel()))
          .setMimeType(ContentService.MimeType.JSON);

      case 'getUserMood':
        return ContentService.createTextOutput(JSON.stringify({ mood: getUserMood(e.parameter.userName) }))
          .setMimeType(ContentService.MimeType.JSON);

      case 'getLogistics':
        return ContentService.createTextOutput(JSON.stringify(getLogistics()))
          .setMimeType(ContentService.MimeType.JSON);

      default:
        return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  try {
    switch (action) {
      case 'updateEventResponse':
        updateEventResponse(data.eventId, data.userName, data.response);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      case 'addGuestNote':
        addGuestNote(data.name, data.message);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      case 'addPost':
        addPost(data.name, data.message);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      case 'createEvent':
        createEvent(data.event);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      case 'updateUserMood':
        updateUserMood(data.userName, data.mood);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      default:
        return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// ——— Guests ———
// Sheet "Guests": column A header "Name", then one name per row
function getGuests() {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.GUESTS);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const names = [];
  for (let i = 1; i < data.length; i++) {
    const name = (data[i][0] || '').toString().trim();
    if (name) names.push(name);
  }
  return names;
}

// ——— Logistics (Info page) ———
// Sheet "Logistics": columns "key" and "value" (or "label" and "content"). One row per item.
function getLogistics() {
  const ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.LOGISTICS) || ss.getSheetByName('logistics');
  if (!sheet) return [];
  var data;
  try {
    data = sheet.getDataRange().getValues();
  } catch (e) {
    return [];
  }
  if (!data || data.length < 1) return [];
  const headers = data[0].map(function (h) {
    return (h || '').toString().toLowerCase().replace(/\s+/g, '');
  });
  var keyCol = headers.indexOf('key');
  if (keyCol === -1) keyCol = headers.indexOf('label');
  var valCol = headers.indexOf('value');
  if (valCol === -1) valCol = headers.indexOf('content');
  if (keyCol === -1 || valCol === -1) return [];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const key = (data[i][keyCol] || '').toString().trim();
    const value = (data[i][valCol] || '').toString().trim();
    if (key) out.push({ key: key, value: value });
  }
  return out;
}

// ——— Events (Itinerary) ———
// Sheet "Itinerary": id, name, date, time, description, isSecret, inviteList, responses
function getEvents(userName) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.EVENTS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var data;
  try {
    data = sheet.getDataRange().getValues();
  } catch (e) {
    return [];
  }
  if (!data.length || data.length < 2) return [];

  const headers = data[0].map(function (h) {
    return (h || '').toString().toLowerCase().replace(/\s+/g, '');
  });
  const events = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const event = {};
    headers.forEach(function (header, index) {
      event[header] = row[index];
    });

    if (typeof event.responses === 'string') {
      try {
        event.responses = JSON.parse(event.responses);
      } catch (e) {
        event.responses = {};
      }
    }

    var isSecret = event.issecret === true || event.issecret === 'TRUE' || event.issecret === 'true' ||
      event.issecret === 'YES' || event.issecret === 'yes' || event.issecret === 1 || event.issecret === '1';
    if (isSecret) {
      const inviteList = (event.invitelist || '')
        .toString()
        .split(',')
        .map(function (n) {
          return n.trim().toLowerCase();
        })
        .filter(Boolean);
      const userLower = (userName || '').toString().trim().toLowerCase();
      var isInvited = inviteList.some(function (name) {
        return name === userLower;
      });
      if (!isInvited) continue;
    }

    events.push(event);
  }

  return events;
}

// Returns all events (no secret filtering) for admin RSVP view
function getAllEvents() {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.EVENTS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var data;
  try {
    data = sheet.getDataRange().getValues();
  } catch (e) {
    return [];
  }
  if (!data.length || data.length < 2) return [];
  const headers = data[0].map(function (h) {
    return (h || '').toString().toLowerCase().replace(/\s+/g, '');
  });
  const events = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const event = {};
    headers.forEach(function (header, index) {
      event[header] = row[index];
    });
    if (typeof event.responses === 'string') {
      try {
        event.responses = JSON.parse(event.responses);
      } catch (e) {
        event.responses = {};
      }
    }
    events.push(event);
  }
  return events;
}

function updateEventResponse(eventId, userName, response) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.EVENTS);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(function (h) {
    return (h || '').toString().toLowerCase().replace(/\s+/g, '');
  });
  const idCol = headers.indexOf('id');
  const responsesCol = headers.indexOf('responses');
  if (idCol === -1 || responsesCol === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === eventId) {
      var responses = {};
      try {
        responses = JSON.parse(data[i][responsesCol] || '{}');
      } catch (e) {
        responses = {};
      }
      responses[userName] = response;
      sheet.getRange(i + 1, responsesCol + 1).setValue(JSON.stringify(responses));
      break;
    }
  }
}

function createEvent(event) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.EVENTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.EVENTS);
    sheet.appendRow(['id', 'name', 'date', 'time', 'endTime', 'location', 'description', 'isSecret', 'inviteList', 'responses']);
  }
  const id = event.id || Utilities.getUuid();
  const name = event.name || '';
  const date = event.date || '';
  const time = event.time || '';
  const endTime = event.endTime || '';
  const location = event.location || '';
  const description = event.description || '';
  const isSecret = event.isSecret === true || event.isSecret === 'TRUE' || event.isSecret === 'true';
  const inviteList = Array.isArray(event.inviteList)
    ? event.inviteList.join(', ')
    : (event.inviteList || '').toString();
  const responses = typeof event.responses === 'object' ? JSON.stringify(event.responses || {}) : '{}';
  sheet.appendRow([id, name, date, time, endTime, location, description, isSecret, inviteList, responses]);
}

// ——— Wall (guest notes + host posts) ———
// Sheet "Wall": id, name, message, timestamp, isHost (optional)
function getGuestNotes() {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.GUEST_NOTES);
  if (!sheet || sheet.getLastRow() < 1) return [];
  var data;
  try {
    data = sheet.getDataRange().getValues();
  } catch (e) {
    return [];
  }
  if (!data.length) return [];

  const headers = data[0].map(function (h) {
    return (h || '').toString().toLowerCase().replace(/\s+/g, '');
  });
  const notes = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const note = {};
    headers.forEach(function (header, index) {
      note[header] = row[index];
    });
    if (note.ishost === true || note.ishost === 'TRUE' || note.ishost === 'true') {
      note.isHost = true;
    } else {
      note.isHost = false;
    }
    notes.push(note);
  }
  return notes.sort(function (a, b) {
    return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
  });
}

function addGuestNote(name, message) {
  var s = getSpreadsheet().getSheetByName(SHEET_NAMES.GUEST_NOTES);
  if (!s) {
    ensureWallSheet();
    s = getSpreadsheet().getSheetByName(SHEET_NAMES.GUEST_NOTES);
  }
  if (!s) return;
  ensureWallHeaders(s);
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  s.appendRow([id, name, message, timestamp, false]);
}

function addPost(name, message) {
  var sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.GUEST_NOTES);
  if (!sheet) {
    ensureWallSheet();
    sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.GUEST_NOTES);
  }
  if (!sheet) return;
  ensureWallHeaders(sheet);
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  sheet.appendRow([id, name, message, timestamp, true]);
}

function ensureWallSheet() {
  const ss = getSpreadsheet();
  if (ss.getSheetByName(SHEET_NAMES.GUEST_NOTES)) return;
  const sheet = ss.insertSheet(SHEET_NAMES.GUEST_NOTES);
  sheet.appendRow(['id', 'name', 'message', 'timestamp', 'isHost']);
}

function ensureWallHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'name', 'message', 'timestamp', 'isHost']);
  }
}

// ——— MistLevel ———
function getMistLevel() {
  let sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.MIST_LEVEL);
  if (!sheet) {
    sheet = ensureMistLevelSheet();
  }
  if (!sheet) return { level: 'Medium', message: 'Dress in layers.' };
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { level: 'Medium', message: 'Dress in layers.' };
  return {
    level: (data[1][0] || 'Medium').toString(),
    message: (data[1][1] || 'Dress in layers.').toString(),
  };
}

function ensureMistLevelSheet() {
  const ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.MIST_LEVEL);
  if (sheet) return sheet;
  sheet = ss.insertSheet(SHEET_NAMES.MIST_LEVEL);
  sheet.appendRow(['level', 'message']);
  sheet.appendRow(['Medium', 'Dress in layers.']);
  return sheet;
}

// ——— UserMoods ———
function getUserMood(userName) {
  let sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.USER_MOODS);
  if (!sheet) {
    sheet = ensureUserMoodsSheet();
  }
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  const headers = (data[0] || []).map(function (h) {
    return (h || '').toString().toLowerCase().replace(/\s+/g, '');
  });
  const nameCol = headers.indexOf('username');
  const moodCol = headers.indexOf('mood');
  if (nameCol === -1 || moodCol === -1) return null;
  for (let i = 1; i < data.length; i++) {
    if ((data[i][nameCol] || '').toString() === userName) {
      return (data[i][moodCol] || '').toString();
    }
  }
  return null;
}

function updateUserMood(userName, mood) {
  let sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.USER_MOODS);
  if (!sheet) {
    sheet = ensureUserMoodsSheet();
  }
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const headers = (data[0] || []).map(function (h) {
    return (h || '').toString().toLowerCase().replace(/\s+/g, '');
  });
  const nameCol = headers.indexOf('username');
  const moodCol = headers.indexOf('mood');
  if (nameCol === -1 || moodCol === -1) return;
  for (let i = 1; i < data.length; i++) {
    if ((data[i][nameCol] || '').toString() === userName) {
      sheet.getRange(i + 1, moodCol + 1).setValue(mood);
      return;
    }
  }
  sheet.appendRow([userName, mood]);
}

function ensureUserMoodsSheet() {
  const ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.USER_MOODS);
  if (sheet) return sheet;
  sheet = ss.insertSheet(SHEET_NAMES.USER_MOODS);
  sheet.appendRow(['userName', 'mood']);
  return sheet;
}
