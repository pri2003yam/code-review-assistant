import mongoose, { Schema, Document } from 'mongoose';
import { ReviewResult, AnalysisMetadata, ProgrammingLanguage } from '@/types';

interface ReportDocument extends Document {
  fileName: string;
  language: ProgrammingLanguage;
  originalCode: string;
  review: ReviewResult;
  metadata: AnalysisMetadata;
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
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ language: 1 });
ReportSchema.index({ 'review.overallScore': -1 });

export const ReportModel = mongoose.models.Report || mongoose.model<ReportDocument>('Report', ReportSchema);

export default ReportModel;
