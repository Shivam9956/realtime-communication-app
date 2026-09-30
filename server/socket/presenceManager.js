/**
 * In-memory room presence manager for Socket.io real-time participants
 */
class PresenceManager {
  constructor() {
    // Map<meetingId, Map<socketId, participantInfo>>
    this.rooms = new Map();
  }

  /**
   * Add a participant to a meeting room
   */
  addParticipant(meetingId, socketId, user) {
    if (!this.rooms.has(meetingId)) {
      this.rooms.set(meetingId, new Map());
    }

    const room = this.rooms.get(meetingId);
    const participant = {
      socketId,
      userId: user.id || user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      joinedAt: new Date().toISOString(),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
    };

    room.set(socketId, participant);
    return participant;
  }

  /**
   * Remove a participant from a meeting room
   */
  removeParticipant(meetingId, socketId) {
    if (!this.rooms.has(meetingId)) return null;

    const room = this.rooms.get(meetingId);
    const participant = room.get(socketId);
    room.delete(socketId);

    if (room.size === 0) {
      this.rooms.delete(meetingId);
    }

    return participant;
  }

  /**
   * Get all active participants in a meeting room
   */
  getParticipants(meetingId) {
    if (!this.rooms.has(meetingId)) return [];
    return Array.from(this.rooms.get(meetingId).values());
  }

  /**
   * Remove a socket from any meeting room they are in (on disconnect)
   */
  handleDisconnect(socketId) {
    const affectedRooms = [];

    for (const [meetingId, room] of this.rooms.entries()) {
      if (room.has(socketId)) {
        const participant = room.get(socketId);
        room.delete(socketId);

        if (room.size === 0) {
          this.rooms.delete(meetingId);
        }

        affectedRooms.push({ meetingId, participant });
      }
    }

    return affectedRooms;
  }
}

const presenceManager = new PresenceManager();

module.exports = presenceManager;
