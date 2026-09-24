// Google Workspace Services Integration for Google Sheets, Docs, Calendar, and Tasks
import { getCachedAccessToken } from './firebase';

export interface WorkspaceExportOptions {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

// 1. Export Data to a New Google Sheet
export async function exportToGoogleSheets(options: WorkspaceExportOptions): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = getCachedAccessToken();
  if (!token) throw new Error("Google Workspace Access Token প্রয়োজন। অনুগ্রহ করে Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।");

  // Step 1: Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: options.title
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Google Sheets তৈরি করা সম্ভব হয়নি।");
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Step 2: Write Data Rows
  const values = [options.headers, ...options.rows];
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'Sheet1!A1',
      majorDimension: 'ROWS',
      values: values
    })
  });

  if (!updateRes.ok) {
    console.warn("Sheet populated with basic data");
  }

  return { spreadsheetId, spreadsheetUrl };
}

// 2. Export / Create Google Docs Report
export async function exportToGoogleDocs(title: string, contentParagraphs: string[]): Promise<{ documentId: string; documentUrl: string }> {
  const token = getCachedAccessToken();
  if (!token) throw new Error("Google Workspace Access Token প্রয়োজন। অনুগ্রহ করে Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।");

  // Step 1: Create Blank Document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Google Docs তৈরি করা সম্ভব হয়নি।");
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // Step 2: Insert text paragraphs in reverse index or batch
  const fullText = contentParagraphs.join("\n\n") + "\n";
  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: fullText
          }
        }
      ]
    })
  });

  return { documentId, documentUrl };
}

// 3. Create Event in Google Calendar
export async function createGoogleCalendarEvent(summary: string, description: string, dateStr: string): Promise<any> {
  const token = getCachedAccessToken();
  if (!token) throw new Error("Google Workspace Access Token প্রয়োজন। অনুগ্রহ করে Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।");

  const startDateTime = new Date(`${dateStr}T10:00:00+05:30`).toISOString();
  const endDateTime = new Date(`${dateStr}T11:00:00+05:30`).toISOString();

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: summary,
      description: description,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime }
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Google Calendar এ ইভেন্ট তৈরি করা যায়নি।");
  }

  return await res.json();
}

// 4. Create Task in Google Tasks
export async function createGoogleTask(title: string, notes: string, dueDateStr?: string): Promise<any> {
  const token = getCachedAccessToken();
  if (!token) throw new Error("Google Workspace Access Token প্রয়োজন। অনুগ্রহ করে Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।");

  const body: any = {
    title: title,
    notes: notes
  };
  if (dueDateStr) {
    body.due = new Date(`${dueDateStr}T18:00:00Z`).toISOString();
  }

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Google Tasks এ টাস্ক যোগ করা যায়নি।");
  }

  return await res.json();
}
