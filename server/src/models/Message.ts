import mongoose, { type InferSchemaType, Schema } from 'mongoose';

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1 });

messageSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as Record<string, any>;
    obj.id = String(obj._id);
    delete obj._id;
    delete obj.__v;
    return ret;
  },
});

export type MessageDocument = InferSchemaType<typeof messageSchema>;

export const MessageModel =
  (mongoose.models.Message as mongoose.Model<MessageDocument> | undefined) ??
  mongoose.model<MessageDocument>('Message', messageSchema);
