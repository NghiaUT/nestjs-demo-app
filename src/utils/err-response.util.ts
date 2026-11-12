import { Response } from 'express';

export const sendErrorResponse = (
  res: Response,
  status: number,
  message: string,
) => {
  return res.status(status).json({
    statusCode: status,
    message,
    timestamp: new Date().toISOString(),
  });
};
