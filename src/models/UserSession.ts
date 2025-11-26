import mongoose, { Schema, Document } from 'mongoose';

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || typeof window === 'undefined' && !process.env.MONGODB_URI;

interface UserSessionDocument extends Document {
  userId: string;
  email: string;
  sessionId: string;
  deviceName: string;
  deviceId: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSessionSchema = new Schema<UserSessionDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ email: 1, isActive: 1 });
UserSessionSchema.index({ sessionId: 1 });
UserSessionSchema.index({ createdAt: -1 });

// Try to get/create the model, but don't fail if MongoDB URI is not available
let userSessionModel: mongoose.Model<UserSessionDocument> | null = null;

try {
  userSessionModel = mongoose.models.UserSession || mongoose.model<UserSessionDocument>('UserSession', UserSessionSchema);
} catch (error) {
  if (!isBuildTime) {
    throw error;
  }
  console.warn('[Build Time] Skipping UserSession model registration - will be available at runtime');
}

export const UserSessionModel = userSessionModel || (mongoose.models.UserSession as mongoose.Model<UserSessionDocument>);

export default UserSessionModel;
