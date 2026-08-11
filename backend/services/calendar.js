function createMeetEvent({ bookingId }) {
  const meetLink = `https://meet.jit.si/SunLo-${bookingId}`;
  return {
    eventId: null,
    meetLink,
    htmlLink: meetLink,
  };
}

module.exports = { createMeetEvent };
