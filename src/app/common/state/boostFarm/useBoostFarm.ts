import { EEthereumAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  claimBoostFarmLPRewards,
  claimBoostFarmNonLPRewards,
  convertToLP, depositIntoBoostFarm, getBoostFarmInterest,
  getBoostFarmPendingRewards,
  getBoostFarmRewards,
  withdrawFromBoostFarm
} from 'app/common/functions/boostFarm';
import { heapTrack } from 'app/common/functions/heapClient';
import { depositDivided } from 'app/common/functions/utils';
import {
  getTotalAssets,
  getUserDepositedLPAmount,
  getValueOf1LPinUSDC
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { TBoostFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

export const boostFarmOptions: Array<TBoostFarm> = [
  {
    id: 0,
    farmAddress: EEthereumAddresses.FRAXUSDCVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'FRAX/USDC',
    sign: '$',
    icons: [
      'FRAX',
      'USDC',
      'agEUR',
      'CRV',
      'CVX',
      'DAI',
      'EURS',
      'EURT',
      'WETH',
      'WBTC',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.FRAXUSDC,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['FRAX', 'USDC'],
    apyFarmAddresses: {
      baseApyAddress: 'bd072651-d99c-4154-aeae-51f12109c054',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
  },
  {
    id: 1,
    farmAddress: EEthereumAddresses.CVXETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'CVX/ETH',
    sign: '$',
    icons: [
      'CVX',
      'WETH',
      'EURS',
      'agEUR',
      'CRV',
      'EURT',
      'FRAX',
      'USDC',
      'WBTC',
      'DAI',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.CVXETH,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['CVX', 'WETH'],
    apyFarmAddresses: {
      baseApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
  },
  {
    id: 2,
    farmAddress: EEthereumAddresses.STETHETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'stETH/ETH',
    sign: '$',
    icons: [
      'WETH',
      'USDC',
      'DAI',
      'EURS',
      'EURT',
      'FRAX',
      'WBTC',
      'agEUR',
      'CRV',
      'CVX',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.STETHETH,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: [
      'wETH',
    ],
    apyFarmAddresses: {
      baseApyAddress: '5ce23e7e-3800-4c9c-ad30-6db3db0515a1',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
  },
  {
    id: 3,
    farmAddress: EEthereumAddresses.CRVYCRVVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'CRV/yCRV',
    sign: '$',
    icons: [
      'WETH',
      'USDC',
      'DAI',
      'EURS',
      'EURT',
      'FRAX',
      'WBTC',
      'agEUR',
      'CRV',
      'CVX',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.CRVYCRV,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: [
      'CRV',
    ],
    apyFarmAddresses: {
      baseApyAddress: '1fbe7e03-75f3-4d65-8423-2cc023f786d7',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
    isNewest: true,
  },
  {
    id: 4,
    farmAddress: EEthereumAddresses.DOLAFRAXBPVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'DOLA/FRAXBP',
    sign: '$',
    icons: [
      'WETH',
      'USDC',
      'DAI',
      'EURS',
      'EURT',
      'FRAX',
      'WBTC',
      'agEUR',
      'CRV',
      'CVX',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.DOLAFRAXBP,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: [
      'FRAX',
      'USDC'
    ],
    apyFarmAddresses: {
      baseApyAddress: 'd05cb04d-f1e5-451d-95a2-6a3a9da001ad',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
    isNewest: true,
  },
];

const defaultRewards = {
  label: 'CVX-ETH',
  stableLabel: 'USDC',
  stableAddress: EEthereumAddresses.USDC,
};

export const useBoostFarm = ({ id }) => {
  // react
  const navigate = useNavigate();
  const [cookies] = useCookies([
    'has_seen_boost_farms',
    'has_seen_locked_boost_farms',
  ]);

  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // other state control files
  const { setNotification } = useNotification();

  // selected farm control
  const selectedFarm = useRef<TBoostFarm>(
    boostFarmOptions.find(availableFarm => availableFarm.id == id),
  );
  const selectedFarmInfo = useRef<TBoostFarm>();
  const [selectedSupportedToken, setSelectedSupportedToken] =
    useState<TSupportedToken>();

  // booster farm rewards control
  const rewardsInfo = useRef<any>(defaultRewards);
  const pendingRewardsInfo = useRef<any>(false);
  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);
  const [losablePendingRewards, setLosablePendingRewards] = useState<number>();

  // deposit and withdraw values needs to be here to show the confirmation screen
  const [depositValue, setDepositValue] = useState<string>('');
  const [withdrawValue, setWithdrawValue] = useState<string>('');

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  const [isClamingRewards, setIsClamingRewards] = useState<boolean>(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(false);
  const [isLoadingPendingRewards, setIsLoadingPendingRewards] =
    useState<boolean>(false);

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(
    isSafeAppAtom || EChain.POLYGON != selectedFarmInfo.current?.chain
      ? false
      : true,
  );

  // information/confirmation control
  const showBoostFarmPresentation =
    !cookies.has_seen_boost_farms && !selectedFarm.current?.isLocked;
  const showLockedBoostFarmPresentation =
    !cookies.has_seen_locked_boost_farms && selectedFarm.current?.isLocked;
  const [showBoostWithdrawalConfirmation, setShowBoostWithdrawalConfirmation] =
    useState<boolean>(false);
  const [showBoostDepositConfirmation, setShowBoostDepositConfirmation] =
    useState<boolean>(false);
  const showHeading =
    !showBoostFarmPresentation && !showLockedBoostFarmPresentation;
  const showTabs =
    !showBoostFarmPresentation &&
    !showLockedBoostFarmPresentation &&
    !showBoostWithdrawalConfirmation &&
    !showBoostDepositConfirmation;

  // harvest dates for the farms
  const previousHarvestDate = moment().subtract(1, 'days').day('Monday');
  const nextHarvestDate = moment()
    .subtract(1, 'days')
    .add(1, 'week')
    .day('Monday');

  // when entering boost farms set wanted chain to ethereum (for now only ethereum has boost farms)
  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (!selectedFarm) {
      navigate('/');
      return;
    }
    const loadFarmInfo = async () => {
      try {
        heapTrack('farm', {
          pool: 'boost',
          currency: selectedFarm.current.name,
        });

        selectedFarmInfo.current = {
          ...selectedFarm.current,
          ...(await getUpdatedFarmInfo(selectedFarm.current)),
        };
        setSelectedSupportedToken(selectedFarmInfo.current.supportedTokens[0]);

        setIsLoading(false);
        await updateRewardsInfo();
      } catch (error) {
        console.log(error);
      }
    };
    if (walletAccountAtom) {
      loadFarmInfo();
    }
  }, [walletAccountAtom]);

  // used to update the farm info after withdraw or deposit
  const updateFarmInfo = async () => {
    try {
      const farm = await getUpdatedFarmInfo(selectedFarm.current);
      selectedFarmInfo.current = farm;
      setSelectedSupportedToken(
        farm.supportedTokens?.find(
          st => st?.address == selectedSupportedToken?.address,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getUpdatedFarmInfo = async farm => {
    try {
      let farmInfo;

      const valueOf1LPinUSDC = await getValueOf1LPinUSDC(
        farm.lPTokenAddress,
        farm.chain,
      );

      farmInfo = {
        interest: await getBoostFarmInterest(
          farm.farmAddress,
          farm.apyFarmAddresses,
          farm.chain,
        ),
        totalAssetSupply:
          +(await getTotalAssets(farm.farmAddress, farm.chain)) *
          valueOf1LPinUSDC,
        depositedAmount: 0,
        valueOf1LPinUSDC: valueOf1LPinUSDC,
      };
      if (walletAccountAtom) {
        const depositedAmountInLP = await getUserDepositedLPAmount(
          farm.farmAddress,
          farm.chain,
        );
        farmInfo.depositedAmountInLP = depositedAmountInLP;
        // Let's use the depositedAmount to store the deposited amount in USD(C)
        // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
        const depositedAmount = +depositedAmountInLP * valueOf1LPinUSDC;
        farmInfo.depositedAmount = depositedAmount;
        farmInfo.depositDividedAmount = depositDivided(depositedAmount);
      }

      return { ...farm, ...farmInfo };
    } catch (error) {
      console.log(error);
    }
  };

  const selectSupportedToken = supportedToken => {
    setSelectedSupportedToken(supportedToken);
  };

  const updateRewardsInfo = async () => {
    setIsLoadingRewards(true);
    setIsLoadingPendingRewards(true);
    try {
      const CVXETHInUSDC = await getValueOf1LPinUSDC(
        EEthereumAddresses.CVXETH,
        selectedFarmInfo.current.chain,
      );
      // Rewards
      const updatedRewards = {
        ...selectedFarmInfo.current.rewards,
        ...(await getBoostFarmRewards(
          selectedFarmInfo.current.farmAddress,
          CVXETHInUSDC,
          selectedFarmInfo.current.chain,
        )),
      };
      rewardsInfo.current = updatedRewards;
      setIsLoadingRewards(false);

      // Pending Rewards
      const updatedPendingRewards =
        selectedFarmInfo.current.totalAssetSupply > 0
          ? await getBoostFarmPendingRewards(
              selectedFarmInfo.current.farmAddress,
              selectedFarmInfo.current.chain,
            )
          : 0;
      pendingRewardsInfo.current = updatedPendingRewards;
      setIsLoadingPendingRewards(false);
    } catch (error) {
      console.log(error);
    }
  };

  const claimRewards = async () => {
    setIsClamingRewards(true);
    try {
      const tx = seeRewardsAsStable
        ? await claimBoostFarmNonLPRewards(
            selectedFarmInfo.current.farmAddress,
            selectedFarmInfo.current.rewards.stableAddress,
            selectedFarmInfo.current.chain,
          )
        : await claimBoostFarmLPRewards(
            selectedFarmInfo.current.farmAddress,
            selectedFarmInfo.current.chain,
          );
      await updateRewardsInfo();
      setNotification(
        'Rewards claimed successfully',
        'success',
        tx.transactionHash,
        selectedFarmInfo.current.chain,
      );
    } catch (error) {
      setNotification(error, 'error');
    }
    setIsClamingRewards(false);
  };

  const startBoostDepositConfirmation = async () => {
    setShowBoostDepositConfirmation(true);
  };

  const cancelBoostDepositConfirmation = async () => {
    setShowBoostDepositConfirmation(false);
  };

  const startBoostWithdrawalConfirmation = async boostDepositedAmount => {
    // Losable rewards will be the pending value * % of shares to withdraw
    const projectedLosableRewards =
      +pendingRewardsInfo.current * (+withdrawValue / +boostDepositedAmount);
    setLosablePendingRewards(projectedLosableRewards);
    setShowBoostWithdrawalConfirmation(true);
  };

  const cancelBoostWithdrawalConfirmation = async () => {
    setShowBoostWithdrawalConfirmation(false);
  };

  // withdraw method
  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setShowBoostWithdrawalConfirmation(false);
    try {
      const tx = await withdrawFromBoostFarm(
        selectedFarmInfo.current.farmAddress,
        selectedSupportedToken.address,
        // The withdraw value is always referent to the selected supported token
        // But the contract for booster farm withdrawal expects the value as LP/Shares
        // Thus, convert the value into LP
        await convertToLP(
          withdrawValue,
          selectedSupportedToken.address,
          selectedSupportedToken.decimals,
          selectedFarmInfo.current.valueOf1LPinUSDC,
        ),
        selectedSupportedToken.decimals,
        selectedFarmInfo.current.chain,
        useBiconomy,
      );

      setNotification(
        'Withdrew successfully',
        'success',
        tx.transactionHash,
        selectedFarmInfo.current.chain,
      );
      await updateFarmInfo();
    } catch (error) {
      setNotification(error, 'error');
    }

    setIsWithdrawing(false);
  };

  // deposit method
  const handleDeposit = async () => {
    setIsDepositing(true);
    setShowBoostDepositConfirmation(false);
    try {
      heapTrack('startedDepositing', {
        pool: 'boost',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      const tx = await depositIntoBoostFarm(
        selectedFarmInfo.current.farmAddress,
        selectedSupportedToken.address,
        depositValue,
        selectedSupportedToken.decimals,
        selectedFarmInfo.current.chain,
        useBiconomy,
      );
      setDepositValue('');
      heapTrack('depositTransactionMined', {
        pool: 'boost',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      setNotification(
        'Deposit successful',
        'success',
        tx.transactionHash,
        selectedFarmInfo.current.chain,
      );
      await updateFarmInfo();
    } catch (error) {
      setNotification(error, 'error');
    }

    setIsDepositing(false);
  };

  return {
    // presentation
    showTabs,
    showHeading,
    showBoostFarmPresentation,
    showLockedBoostFarmPresentation,
    // farm
    isLoading,
    selectedFarmInfo,
    selectSupportedToken,
    selectedSupportedToken,
    // rewards
    isLoadingRewards,
    rewardsInfo,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    claimRewards,
    isClamingRewards,
    // pending rewards
    isLoadingPendingRewards,
    pendingRewardsInfo,
    previousHarvestDate,
    nextHarvestDate,
    losablePendingRewards,
    // biconomy
    useBiconomy,
    setUseBiconomy,
    // deposit
    depositValue,
    setDepositValue,
    handleDeposit,
    isDepositing,
    showBoostDepositConfirmation,
    startBoostDepositConfirmation,
    cancelBoostDepositConfirmation,
    //withdraw
    withdrawValue,
    setWithdrawValue,
    handleWithdraw,
    isWithdrawing,
    showBoostWithdrawalConfirmation,
    startBoostWithdrawalConfirmation,
    cancelBoostWithdrawalConfirmation,
  };
};
