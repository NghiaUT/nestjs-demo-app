import { ValueTransformer } from 'typeorm';

export const bigintToNumber: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) => (value == null ? value : Number(value)),
};
