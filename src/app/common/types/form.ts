export type TSupportedToken = {
  label?: string;
  address?: string;
  decimals?: number;
  balance?: string;
  allowance?: string;
  sign?: string;
  // To store boost farm deposited amount converted to the supported token value to improve ui and functionality
  boosterDepositedAmount?: number;
};