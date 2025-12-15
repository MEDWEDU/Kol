import Joi from 'joi';

export const subscribeSchema = Joi.object({
  endpoint: Joi.string().uri().required(),
  keys: Joi.object({
    p256dh: Joi.string().required(),
    auth: Joi.string().required(),
  }).required(),
});

export const unsubscribeSchema = Joi.object({
  endpoint: Joi.string().uri().optional(),
});