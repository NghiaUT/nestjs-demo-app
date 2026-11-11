export enum PaymentMethod {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

export enum PaymentType {
  TRANSFER = 'TRANSFER',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  PAY = 'PAY',
}
