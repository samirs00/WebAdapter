export interface PaymentOption {
    amount?: number;
    personName?: string;
    cardNumber?: string;
    expiryMonth?:string;
    expiryYear?: any;
    cvvNumber?: number;
  }