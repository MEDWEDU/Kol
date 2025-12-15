import Joi from 'joi';

export const updateMeSchema = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().trim().max(100).allow(''),
  organization: Joi.string().trim().max(100).allow(''),
  position: Joi.string().trim().max(100).allow(''),
  bio: Joi.string().trim().max(500).allow(''),
});
