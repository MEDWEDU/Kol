import mongoose, { type InferSchemaType, Schema } from 'mongoose';

const conversationSchema = new Schema(
  {
    participantIds: {
      type: [String],
      required: true,
      validate: {
        validator(v: string[]) {
          return v.length === 2 && v[0] !== v[1];
        },
        message: 'A conversation must have exactly 2 different participants',
      },
    },
    lastMessage: {
      text: String,
      senderId: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ participantIds: 1 });

conversationSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as Record<string, any>;
    obj.id = String(obj._id);
    delete obj._id;
    delete obj.__v;
    return ret;
  },
});

export type ConversationDocument = InferSchemaType<typeof conversationSchema>;

export const ConversationModel =
  (mongoose.models.Conversation as mongoose.Model<ConversationDocument> | undefined) ??
  mongoose.model<ConversationDocument>('Conversation', conversationSchema);
