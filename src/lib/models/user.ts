import mongoose, { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => validator.isMobilePhone(v, 'any'), // Supports international numbers
        message: 'Please provide a valid phone number',
      },
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    referralID: {
      type: String,
      trim: true,
      uppercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true },
  }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); // Increased salt rounds for better security
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for profile URL (example)
userSchema.virtual('profileURL').get(function () {
  return `/users/${this.username}`;
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;