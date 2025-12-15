import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().trim().max(100).allow(''),
  organization: Joi.string().trim().max(100).allow(''),
  position: Joi.string().trim().max(100).allow(''),
  bio: Joi.string().trim().max(500).allow(''),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).max(128).required(),
});
