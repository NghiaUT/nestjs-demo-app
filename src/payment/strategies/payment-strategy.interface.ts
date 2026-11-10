export interface PaymentStrategy {
  pay(amount: number): Promise<PaymentResult>;
}

export type PaymentResult = {
  transactionId: string;
  status: PaymentStatus;
  paymentUrl?: string;
};

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
