import { EChain } from 'app/common/constants/chains';
import {
  approveToken,
  callContract,
  getAlluoPrice,
  getCurrentWalletAddress,
  sendTransaction
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import { EEthereumAddresses } from '../constants/addresses';
import { toExactFixed } from './utils';

export const alluoToUsd = async alluoValueInWei => {
  const alluoPrice = await getAlluoPrice();
  return toExactFixed(+(+alluoValueInWei * alluoPrice), 2);
};

export const getTotalAlluoStakedInLp = async () => {
  const abi = [
    {
      inputs: [],
      name: 'totalLocked',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const totalLocked = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'totalLocked()',
    null,
    EChain.ETHEREUM,
  );

  return totalLocked;
};

export const getAlluoStakingRewardPerDistribution = async () => {
  const abi = [
    {
      inputs: [],
      name: 'rewardPerDistribution',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const rewardPerDistribution = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'rewardPerDistribution()',
    null,
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(rewardPerDistribution);
};

export const getAlluoStakingAPR = async () => {
  const alluoPrice = await getAlluoPrice();
  if (!alluoPrice) return 0;

  const alluoStakingRewardPerDistribution =
    await getAlluoStakingRewardPerDistribution();

  const totalAlluoStaked = await getTotalAlluoStaked();

  const exactApr =
    (+alluoStakingRewardPerDistribution / +totalAlluoStaked) * 100 * 365;

  return +exactApr.toFixed(2);
};

export const getAlluoBalance = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const alluoAddress = EEthereumAddresses.ALLUO;

  const balance = await callContract(
    abi,
    alluoAddress,
    'balanceOf(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(balance);
};

export const getEarnedAlluo = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_locker', type: 'address' }],
      name: 'getClaim',
      outputs: [{ internalType: 'uint256', name: 'reward', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const earnedAlluo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'getClaim(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(earnedAlluo);
};

export const getAlluoStakingWalletAddressInfo = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getInfoByAddress',
      outputs: [
        { internalType: 'uint256', name: 'locked_', type: 'uint256' },
        { internalType: 'uint256', name: 'unlockAmount_', type: 'uint256' },
        { internalType: 'uint256', name: 'claim_', type: 'uint256' },
        {
          internalType: 'uint256',
          name: 'depositUnlockTime_',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'withdrawUnlockTime_',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'convertLpToAlluo',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];
  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const alluoStakingWalletAddressInfo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'getInfoByAddress(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  const walletStakedAlluo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'convertLpToAlluo(uint256)',
    [alluoStakingWalletAddressInfo.locked_],
    EChain.ETHEREUM,
  );

  return {
    stakedInUsd: alluoToUsd(ethers.utils.formatEther(walletStakedAlluo)),
  };
};

/*export const getTokenInfo = async walletAddress => {
  let tokenInfo: TTokenInfo = {
    isLoading: false,
  };
  try {
    const alluoAbi = [
      {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'address', name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];
    const ethereumAlluoAddress = EEthereumAddresses.ALLUO;

    const vlAlluoAbi = [
      {
        inputs: [],
        name: 'totalLocked',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ internalType: 'address', name: '_locker', type: 'address' }],
        name: 'getClaim',
        outputs: [{ internalType: 'uint256', name: 'reward', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'rewardPerDistribution',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: '_address', type: 'address' },
        ],
        name: 'getInfoByAddress',
        outputs: [
          { internalType: 'uint256', name: 'locked_', type: 'uint256' },
          { internalType: 'uint256', name: 'unlockAmount_', type: 'uint256' },
          { internalType: 'uint256', name: 'claim_', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'depositUnlockTime_',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'withdrawUnlockTime_',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: '_address', type: 'address' },
        ],
        name: 'unlockedBalanceOf',
        outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'withdrawLockDuration',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
        name: 'convertLpToAlluo',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];
    const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

    const getTotalLockedInLB = await callContract(
      vlAlluoAbi,
      ethereumVlAlluoAddress,
      'totalLocked()',
      null,
      EChain.ETHEREUM,
    );

    const [
      getBalanceOfAlluo,
      getAllowance,
      getEarnedAlluo,
      getRewardPerDistribution,
      getInfoByAddress,
      getUnlockedBalanceOf,
      getWithdrawLockDuration,
      getTotalLockedInAlluo,
    ] = await Promise.all([
      callContract(
        alluoAbi,
        ethereumAlluoAddress,
        'balanceOf(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        alluoAbi,
        ethereumAlluoAddress,
        'allowance(address,address)',
        [walletAddress, ethereumVlAlluoAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'getClaim(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'rewardPerDistribution()',
        null,
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'getInfoByAddress(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'unlockedBalanceOf(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'withdrawLockDuration()',
        null,
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'convertLpToAlluo(uint256)',
        [getTotalLockedInLB],
        EChain.ETHEREUM,
      ),
    ]);

    // Change all user vesting infos to human-readable allue value
    const lockedAlluoBalanceOfUser = await callContract(
      vlAlluoAbi,
      ethereumVlAlluoAddress,
      'convertLpToAlluo(uint256)',
      [getInfoByAddress.locked_],
      EChain.ETHEREUM,
    );

    const [
      claimedAlluoInUsd,
      alluoBalanceInUsd,
      apr,
      totalLockedInUsd,
      lockedAlluoValueOfUserInUsd,
      unlockedAlluoValueOfUserInUsd,
    ] = await Promise.all([
      alluoToUsd(getEarnedAlluo),
      alluoToUsd(getBalanceOfAlluo),
      calculateApr(getRewardPerDistribution, getTotalLockedInLB),
      alluoToUsd(getTotalLockedInAlluo),
      alluoToUsd(lockedAlluoBalanceOfUser),
      alluoToUsd(getUnlockedBalanceOf),
    ]);
    tokenInfo = {
      isLoading: false,
      allowance: toAlluoValue(getAllowance),
      claimedAlluo: toAlluoValue(getEarnedAlluo),
      claimedAlluoInUsd,
      alluoBalance: toAlluoValue(getBalanceOfAlluo),
      alluoBalanceInUsd,
      apr,
      totalLocked: toAlluoValue(getTotalLockedInAlluo),
      totalLockedInUsd,
      infoByAddress: getInfoByAddress,
      lockedLPValueOfUser: !!walletAddress
        ? Web3.utils.fromWei(getInfoByAddress.locked_)
        : null,
      lockedAlluoValueOfUser: toAlluoValue(lockedAlluoBalanceOfUser),
      lockedAlluoValueOfUserInUsd,
      unlockedAlluoValueOfUser: toAlluoValue(getUnlockedBalanceOf),
      unlockedAlluoValueOfUserInUsd,
      withdrawLockDuration: getWithdrawLockDuration,
    };

    return tokenInfo;
  } catch (err) {
    console.log('error', err.message);
  }
  return { isLoading: false };
};*/

export const getTotalAlluoStaked = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'convertLpToAlluo',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const totalAlluoStakedInLp = await getTotalAlluoStakedInLp();

  const totalAlluoStaked = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'convertLpToAlluo(uint256)',
    [totalAlluoStakedInLp],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(totalAlluoStaked);
};

export const getTotalAlluoStakedInUsd = async () => {
  const totalAlluoStaked = await getTotalAlluoStaked();
  return await alluoToUsd(totalAlluoStaked);
};

export const getAlluoStakingAllowance = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumAlluoAddress = EEthereumAddresses.ALLUO;

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const allowance = callContract(
    abi,
    ethereumAlluoAddress,
    'allowance(address,address)',
    [getCurrentWalletAddress(), ethereumVlAlluoAddress],
    EChain.ETHEREUM,
  );

  return allowance;
};

export const approveAlluoStaking = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const tx = await approveToken(
    EEthereumAddresses.ALLUO,
    EEthereumAddresses.VLALLUO,
    EChain.ETHEREUM,
  );

  return tx;
};

export const stakeAlluo = async alluoAmount => {
  const abi = [
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'lock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const alluoAmountInWei = ethers.utils.parseUnits(alluoAmount);

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'lock(uint256)',
    [alluoAmountInWei],
    EChain.ETHEREUM,
  );

  return tx;
};
