import mongoose, { type InferSchemaType, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    position: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    notificationsEnabled: {
      type: Boolean,
      default: false,
    },
    webPushSubscriptions: [
      {
        endpoint: {
          type: String,
          required: true,
          unique: true,
        },
        keys: {
          p256dh: {
            type: String,
            required: true,
          },
          auth: {
            type: String,
            required: true,
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as Record<string, any>;
    obj.id = String(obj._id);
    delete obj._id;
    delete obj.__v;
    delete obj.passwordHash;
    return ret;
  },
});

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>('User', userSchema);
