export type PaymentResult = {
  success: boolean;
  txnId?: string;
};

export const processPayment = async (): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        txnId: "CG-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      });
    }, 1800); // simulate network delay
  });
};
