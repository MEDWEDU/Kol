import Joi from 'joi';

export const startConversationSchema = Joi.object({
  participantId: Joi.string().required().messages({
    'string.empty': 'Participant ID is required',
  }),
});

export const sendMessageSchema = Joi.object({
  conversationId: Joi.string().required().messages({
    'string.empty': 'Conversation ID is required',
  }),
  text: Joi.string().required().trim().messages({
    'string.empty': 'Message text is required',
  }),
  attachments: Joi.array().items(Joi.string()).default([]),
});

export const markMessagesReadSchema = Joi.object({
  conversationId: Joi.string().required().messages({
    'string.empty': 'Conversation ID is required',
  }),
});
