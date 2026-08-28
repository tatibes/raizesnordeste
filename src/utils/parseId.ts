import { AppError } from '../errors/AppError';

export function parsePositiveInt(value: unknown, fieldName: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} inválido.`, 400, 'INVALID_ID');
  }

  return parsed;
}

export function parsePositiveBigInt(value: unknown, fieldName: string): bigint {
  return BigInt(parsePositiveInt(value, fieldName));
}
