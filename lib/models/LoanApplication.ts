import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILoanApplication extends Document {
  userId: Types.ObjectId;
  loanCategory: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  extractedData: {
    name?: string;
    landArea?: number;
    documentType?: string;
    idNumber?: string;
  };
  uploadedDocuments: Array<{
    filename: string;
    gridFSId?: Types.ObjectId;
    type: string;
    uploadedAt: Date;
  }>;
  geoValuation?: number;
  voiceConsentRecording?: string;
  matchedSchemeId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanCategory: {
      type: String,
      required: true,
      enum: ['Tractor', 'Dairy', 'Equipment', 'Land', 'Seeds', 'General'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    extractedData: {
      name: { type: String, default: '' },
      landArea: { type: Number, default: 0 },
      documentType: { type: String, default: '' },
      idNumber: { type: String, default: '' },
    },
    uploadedDocuments: [
      {
        filename: { type: String, required: true },
        gridFSId: { type: Schema.Types.ObjectId },
        type: {
          type: String,
          enum: ['land_record', 'equipment_photo', 'id_proof', 'other'],
          required: true,
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    geoValuation: {
      type: Number,
      default: 0,
    },
    voiceConsentRecording: {
      type: String,
      default: '',
    },
    matchedSchemeId: {
      type: Schema.Types.ObjectId,
      ref: 'Scheme',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
LoanApplicationSchema.index({ userId: 1, createdAt: -1 });
LoanApplicationSchema.index({ status: 1 });

const LoanApplication: Model<ILoanApplication> =
  mongoose.models.LoanApplication ||
  mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);

export default LoanApplication;

