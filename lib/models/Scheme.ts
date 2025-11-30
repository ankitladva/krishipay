import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScheme extends Document {
  title: string;
  description: string;
  benefits: string;
  loanType: string;
  eligibility: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SchemeSchema = new Schema<IScheme>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    benefits: {
      type: String,
      required: true,
    },
    loanType: {
      type: String,
      required: true,
      enum: ['Tractor', 'Dairy', 'Equipment', 'Land', 'Seeds', 'General'],
    },
    eligibility: {
      type: String,
      default: 'All farmers',
    },
    icon: {
      type: String,
      default: 'Sprout', // Lucide React icon name
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
SchemeSchema.index({ loanType: 1, isActive: 1 });

const Scheme: Model<IScheme> = mongoose.models.Scheme || mongoose.model<IScheme>('Scheme', SchemeSchema);

export default Scheme;

