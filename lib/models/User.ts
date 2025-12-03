import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  phoneNumber: string;
  kycVerified: boolean;
  voicePrintId: string;
  faceId: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[0-9]{10}$/,
    },
    kycVerified: {
      type: Boolean,
      default: false,
    },
    voicePrintId: {
      type: String,
      default: '',
    },
    faceId: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'hi',
      enum: ['hi', 'en'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
UserSchema.index({ phoneNumber: 1 });

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
