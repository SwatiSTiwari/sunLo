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

function getCalendarClient() {
  const credentials = getServiceAccountJson();
  if (!credentials) return null;
  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/calendar"],
    null
  );
  return google.calendar({ version: "v3", auth });
}

async function createMeetEvent({ summary, description, startTime, endTime, attendees, calendarId = "primary" }) {
  const calendar = getCalendarClient();
  if (!calendar) {
    throw new Error("Google Calendar service account not configured");
  }

  const event = {
    summary,
    description,
    start: { dateTime: new Date(startTime).toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: new Date(endTime).toISOString(), timeZone: "Asia/Kolkata" },
    attendees: attendees.filter((a) => a?.email).map((a) => ({ email: a.email })),
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

  return {
    eventId: res.data.id,
    meetLink: res.data.conferenceData?.entryPoints?.[0]?.uri || res.data.hangoutLink,
    htmlLink: res.data.htmlLink,
  };
}

module.exports = { createMeetEvent, getCalendarClient };
