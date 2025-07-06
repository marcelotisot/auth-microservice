import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  DATABASE_URL: string;
}

// Validar el esquema
const envsSchema = joi.object({
  PORT: joi.number().required(),
  POSTGRES_PASSWORD: joi.string().required(),
  POSTGRES_DB: joi.string().required(),
  DATABASE_URL: joi.string().required(),
})
.unknown(true);

const { error, value }  = envsSchema.validate( process.env );

if (error) {
  throw new Error(`Config validation error: ${ error.message }`);
}

// Exponer las variables
const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  pgPassword: envVars.POSTGRES_PASSWORD,
  pgDatabase: envVars.POSTGRES_DB,
  pgPass: envVars.POSTGRES_PASSWORD,
  dbUrl: envVars.DATABASE_URL,
}