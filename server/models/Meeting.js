const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['host', 'participant', 'co-host'],
      default: 'participant',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
    timestamps: false,
  }
);

const meetingSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: [true, 'Meeting ID is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Instant Collaboration Session',
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'ended', 'scheduled'],
      default: 'active',
      index: true,
    },
    participants: [participantSchema],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    settings: {
      isMutedByDefault: { type: Boolean, default: false },
      isCameraOffByDefault: { type: Boolean, default: false },
      allowScreenShare: { type: Boolean, default: true },
      allowWhiteboard: { type: Boolean, default: true },
      allowChat: { type: Boolean, default: true },
      allowFileUpload: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Transform output JSON
meetingSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
