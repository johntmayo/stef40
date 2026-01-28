/**
 * Google Apps Script for The Redwood Portal
 * 
 * Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Paste this code
 * 3. Replace 'YOUR_SPREADSHEET_ID' with your actual Google Sheet ID
 * 4. Deploy as a Web App with:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and use it as NEXT_PUBLIC_GOOGLE_SCRIPT_URL
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAMES = {
  EVENTS: 'Events',
  GUEST_NOTES: 'GuestNotes',
  MIST_LEVEL: 'MistLevel',
  USER_MOODS: 'UserMoods'
};

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getEvents':
        return ContentService.createTextOutput(JSON.stringify(getEvents(e.parameter.userName)))
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
    switch(action) {
      case 'updateEventResponse':
        updateEventResponse(data.eventId, data.userName, data.response);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'addGuestNote':
        addGuestNote(data.name, data.message);
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

function getEvents(userName) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.EVENTS);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const events = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const event = {};
    
    headers.forEach((header, index) => {
      event[header.toLowerCase().replace(/\s+/g, '')] = row[index];
    });
    
    // Parse responses JSON if it's a string
    if (typeof event.responses === 'string') {
      try {
        event.responses = JSON.parse(event.responses);
      } catch (e) {
        event.responses = {};
      }
    }
    
    // Check if event is secret and if user is invited
    if (event.issecret === true || event.issecret === 'TRUE' || event.issecret === 'true') {
      const inviteList = event.invitelist ? event.invitelist.split(',').map(n => n.trim()) : [];
      if (!inviteList.includes(userName)) {
        continue; // Skip secret events user is not invited to
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
  const headers = data[0];
  const idCol = headers.indexOf('id');
  const responsesCol = headers.indexOf('responses');
  
  if (idCol === -1 || responsesCol === -1) return;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === eventId) {
      let responses = {};
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

function getGuestNotes() {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.GUEST_NOTES);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const notes = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const note = {};
    headers.forEach((header, index) => {
      note[header.toLowerCase().replace(/\s+/g, '')] = row[index];
    });
    notes.push(note);
  }
  
  return notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function addGuestNote(name, message) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.GUEST_NOTES);
  if (!sheet) return;
  
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  
  sheet.appendRow([id, name, message, timestamp]);
}

function getMistLevel() {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.MIST_LEVEL);
  if (!sheet) return { level: 'Unknown', message: '' };
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { level: 'Unknown', message: '' };
  
  return {
    level: data[1][0] || 'Unknown',
    message: data[1][1] || ''
  };
}

function getUserMood(userName) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.USER_MOODS);
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const nameCol = headers.indexOf('userName');
  const moodCol = headers.indexOf('mood');
  
  if (nameCol === -1 || moodCol === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][nameCol] === userName) {
      return data[i][moodCol];
    }
  }
  
  return null;
}

function updateUserMood(userName, mood) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.USER_MOODS);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const nameCol = headers.indexOf('userName');
  const moodCol = headers.indexOf('mood');
  
  if (nameCol === -1 || moodCol === -1) return;
  
  // Check if user already exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][nameCol] === userName) {
      sheet.getRange(i + 1, moodCol + 1).setValue(mood);
      return;
    }
  }
  
  // Add new row if user doesn't exist
  sheet.appendRow([userName, mood]);
}

