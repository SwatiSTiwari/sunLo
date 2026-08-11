const { google } = require("googleapis");

function getServiceAccountJson() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON:", err);
    return null;
  }
}

async function getCalendarClient() {
  const credentials = getServiceAccountJson();
  if (!credentials) return null;
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  try {
    await auth.authorize();
  } catch (err) {
    console.error("Google Calendar service account authorization failed:", err);
    throw new Error("Google Calendar service account authorization failed: " + err.message);
  }

  return google.calendar({ version: "v3", auth });
}

async function createMeetEvent({ summary, description, startTime, endTime, attendees, calendarId = "primary" }) {
  const calendar = await getCalendarClient();
  if (!calendar) {
    throw new Error("Google Calendar service account not configured");
  }

  const event = {
    summary,
    description,
    start: { dateTime: new Date(startTime).toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: new Date(endTime).toISOString(), timeZone: "Asia/Kolkata" },
    conferenceData: {
      createRequest: {
        requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    requestBody: event,
  });

  const meetLink = res.data.conferenceData?.entryPoints?.[0]?.uri || res.data.hangoutLink;
  const eventId = res.data.id;

  // Delete the calendar event so it does not appear on any calendar.
  // The Meet link usually remains usable.
  if (eventId && calendarId) {
    try {
      await calendar.events.delete({ calendarId, eventId, sendUpdates: "none" });
    } catch (deleteErr) {
      console.error("Failed to delete temporary calendar event:", deleteErr);
    }
  }

  return {
    eventId,
    meetLink,
    htmlLink: res.data.htmlLink,
  };
}

module.exports = { createMeetEvent, getCalendarClient };
