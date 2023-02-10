import { EChain } from 'app/common/constants/chains';
import { TSupportedToken } from './global';

export type TBoostFarmRewards = {
  icons?: any[];
  label?: string;
  value?: string;
  stableLabel?: string;
  stableValue?: number;
  address?: string; // locked boost need to know the address of the rewards aswel
  stableAddress?: string;
  pendingValue?: number;
};

export type TApyFarmAddresses = {
  baseApyAddress?: string;
  boostApyAddress?: string;
};

export type TFarm = {
  id: number;
  type: string;
  chain: EChain;
  name: string;
  sign: string;
  icons: string[];
  supportedTokens?: TSupportedToken[];
  interest?: string;
  totalAssetSupply?: string | number;
  depositedAmount?: string;
  depositedAmountInUSD?: string;
  depositDividedAmount?: { first: any; second: any };
  farmAddress?: string;
  poolShare?: number;
  isBoost?: boolean;
  isNewest?: boolean;
  underlyingTokenAddress?: string;
};

export type TBoostFarm = TFarm & {
  // For boost farms
  rewards?: TBoostFarmRewards;
  lPTokenAddress?: string;
  lowSlippageTokenLabels?: string[];
  apyFarmAddresses?: TApyFarmAddresses;
  // To store boost farm deposited amount to improve ui and functionality
  depositedAmountInLP?: number;
  valueOf1LPinUSDC?: number;
  // For locked boost farms
  isLocked?: boolean;
  unlockingBalance?: string;
  unlockedBalance?: string;
  isUnlocking?:boolean;
  withdrawToken?: TSupportedToken;
  // forced apy when it cant be calculated
  forcedInterest?: string;
};
