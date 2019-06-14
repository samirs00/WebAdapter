export interface PaymentOption {
    amount?: number;
    personName?: string;
    cardNumber?: number;
    expiryMonth?:string;
    expiryYear?: any;
    cvvNumber?: number;
  }