import mongoose, { Schema, Document } from 'mongoose';
import { ReviewResult, AnalysisMetadata, ProgrammingLanguage } from '@/types';

// Suppress errors during build time
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || typeof window === 'undefined' && !process.env.MONGODB_URI;

interface ReportDocument extends Document {
  fileName: string;
  language: ProgrammingLanguage;
  originalCode: string;
  review: ReviewResult;
  metadata: AnalysisMetadata;
  userId: string;
  sessionId: string;
  deviceId: string;
  deviceName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewIssueSchema = new Schema({
  severity: {
    type: String,
    enum: ['critical', 'warning', 'suggestion'],
    required: true,
  },
  category: {
    type: String,
    enum: ['readability', 'modularity', 'bug', 'performance', 'security', 'best-practice'],
    required: true,
  },
  line: {
    type: Number,
    default: null,
  },
  description: {
    type: String,
    required: true,
  },
  suggestion: {
    type: String,
    required: true,
  },
  codeSnippet: {
    type: String,
    default: null,
  },
}, { _id: false });

const ReviewResultSchema = new Schema({
  summary: {
    type: String,
    required: true,
  },
  overallScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  issues: [ReviewIssueSchema],
  improvements: [String],
  positives: [String],
}, { _id: false });

const AnalysisMetadataSchema = new Schema({
  linesOfCode: {
    type: Number,
    required: true,
  },
  analysisTime: {
    type: Number,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
}, { _id: false });

const ReportSchema = new Schema<ReportDocument>(
  {
    fileName: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'jsx', 'tsx'],
    },
    originalCode: {
      type: String,
      required: true,
    },
    review: {
      type: ReviewResultSchema,
      required: true,
    },
    metadata: {
      type: AnalysisMetadataSchema,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ language: 1 });
ReportSchema.index({ 'review.overallScore': -1 });
ReportSchema.index({ userId: 1 });
ReportSchema.index({ sessionId: 1 });
ReportSchema.index({ deviceId: 1 });
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ sessionId: 1, createdAt: -1 });
ReportSchema.index({ deviceId: 1, createdAt: -1 });

// Try to get/create the model, but don't fail if MongoDB URI is not available
let reportModel: mongoose.Model<ReportDocument> | null = null;

try {
  reportModel = mongoose.models.Report || mongoose.model<ReportDocument>('Report', ReportSchema);
} catch (error) {
  if (!isBuildTime) {
    throw error;
  }
  // During build time, silently ignore the error
  console.warn('[Build Time] Skipping model registration - will be available at runtime');
}

export const ReportModel = reportModel || (mongoose.models.Report as mongoose.Model<ReportDocument>);

export default ReportModel;
