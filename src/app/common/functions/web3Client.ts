import { Biconomy } from '@biconomy/mexa';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import Onboard from '@web3-onboard/core';
import gnosisModule from '@web3-onboard/gnosis';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import polygonHandlerAbi from 'app/common/abis/polygonHandler.json';
import {
  EEthereumAddresses,
  EEthereumAddressesMainnet,
  EPolygonAddresses
} from 'app/common/constants/addresses';
import logo from 'app/modernUI/images/logo.svg';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { EChain, EChainId } from '../constants/chains';
import {
  fromDecimals,
  maximumUint256Value,
  roundNumberDown,
  toDecimals,
  toExactFixed
} from './utils';

const ethereumTestnetProviderUrl = 'https://rpc.sepolia.org';
const ethereumMainnetProviderUrl =
  'https://eth-mainnet.g.alchemy.com/v2/BQ85p2q56v_fKcKachiDuBCdmpyNCWZr';
const ethereumProviderUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? ethereumMainnetProviderUrl
    : ethereumTestnetProviderUrl;

const polygonTestnetProviderUrl =
  'https://polygon-mumbai.g.alchemy.com/v2/AyoeA90j3ZUTAePwtDKNWP24P7F67LzM';
const polygonMainnetProviderUrl = 'https://polygon-rpc.com/';
const polygonProviderUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? polygonMainnetProviderUrl
    : polygonTestnetProviderUrl;

const injected = injectedModule();
const walletConnect = walletConnectModule({
  qrcodeModalOptions: {
    mobileLinks: [
      'rainbow',
      'metamask',
      'argent',
      'trust',
      'imtoken',
      'pillar',
    ],
  },
});
const gnosis = gnosisModule();
const coinbase = coinbaseWalletModule();

const chains = [
  {
    id: EChainId.ETH_MAINNET,
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: ethereumMainnetProviderUrl,
  },
  {
    id: EChainId.ETH_SEPOLIA,
    token: 'ETH',
    label: 'Ethereum Sepolia',
    rpcUrl: ethereumTestnetProviderUrl,
  },
  {
    id: EChainId.POL_MAINNET,
    token: 'MATIC',
    label: 'Polygon Mainnet',
    rpcUrl: polygonMainnetProviderUrl,
  },
  {
    id: EChainId.POL_MUMBAI,
    token: 'MATIC',
    label: 'Polygon Mumbai',
    rpcUrl: polygonTestnetProviderUrl,
  },
];

const onboard = Onboard({
  wallets: [],
  chains: chains,
  appMetadata: {
    name: 'Alluo',
    icon: logo,
    description: 'A description here',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});

onboard.state.actions.setWalletModules([
  injected,
  walletConnect,
  gnosis,
  coinbase,
]);

const permitOnlyTokenAddresses = [
  '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c',
  //'0x4bf7737515EE8862306Ddc221cE34cA9d5C91200',
];

const usesNoncesAddresses = [
  //mumbai
  '0xB579C5ba3Bc8EA2F5DD5622f1a5EaC6282516fB1', //tUSDC
  '0x4bf7737515EE8862306Ddc221cE34cA9d5C91200', //tjEUR
  '0x8EE1eDEE93B10e9b02628254eBd610D6b42020A8', //wETH
  //mainnet
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
  '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c', // jEUR
];

let walletAddress;
let walletProvider;
let web3;

export const trySafeAppConnection = async callback => {
  const gnosisLabel = 'Gnosis Safe';
  const onboardState = onboard.state.get();

  if (
    onboardState.walletModules.find(
      walletModule => walletModule.label == gnosisLabel,
    )
  ) {
    try {
      callback(
        await connectToWallet({
          autoSelect: { label: gnosisLabel, disableModals: true },
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }
};

export const connectToWallet = async (connectOptions?) => {
  let wallets;

  try {
    wallets = await onboard.connectWallet(connectOptions);

    if (wallets[0]) {
      walletProvider = wallets[0].provider;
      web3 = new Web3(walletProvider);
      walletAddress = wallets[0].accounts[0].address;
      return walletAddress;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentWalletAddress = () => {
  return walletAddress;
};

export const changeNetwork = async (chain: EChain) => {
  let chainId;

  if (!walletAddress) return;

  if (chain === EChain.ETHEREUM) {
    chainId =
      process.env.REACT_APP_NET === 'mainnet'
        ? EChainId.ETH_MAINNET
        : EChainId.ETH_SEPOLIA;
  }

  if (chain === EChain.POLYGON) {
    chainId = chainId =
      process.env.REACT_APP_NET === 'mainnet'
        ? EChainId.POL_MAINNET
        : EChainId.POL_MUMBAI;
  }

  const success = await onboard.setChain({ chainId: chainId });

  return { success, chainId };
};

export const getChainById = chainId => {
  return chainId === EChainId.POL_MAINNET || chainId === EChainId.POL_MUMBAI
    ? EChain.POLYGON
    : chainId === EChainId.ETH_MAINNET || chainId === EChainId.ETH_SEPOLIA
    ? EChain.ETHEREUM
    : null;
};

export const onWalletUpdated = async callback => {
  const wallets = onboard.state.select('wallets');
  wallets.subscribe(wallets => {
    if (wallets[0]) {
      walletAddress = wallets[0].accounts[0].address;
      callback(wallets[0].chains[0].id, wallets[0].accounts[0].address);
    }
  });
};

export const getCurrentChainId = async () => {
  const state = onboard.state.get();

  if (state.wallets[0]?.chains[0]) {
    return state.wallets[0].chains[0].id;
  }
};

export const getChainNameById = chainId => {
  return chains.find(chain => chain.id == chainId).label;
};

export const startBiconomy = async (chain, provider) => {
  try {
    const biconomy = new Biconomy(provider, {
      apiKey:
        chain === EChain.ETHEREUM
          ? process.env.REACT_APP_ETHEREUM_BICONOMY_KEY
          : process.env.REACT_APP_POLYGON_BICONOMY_KEY,
    });

    await waitForBiconomyReady(biconomy);

    return biconomy;
  } catch (error) {
    console.log(error);
  }
};

const waitForBiconomyReady = biconomy =>
  new Promise<void>((resolve, reject) => {
    biconomy
      .onEvent(biconomy.READY, () => {
        resolve();
      })
      .onEvent(biconomy.ERROR, error => {
        console.log(error);
        reject(error);
      });
  });

export const sendTransaction = async (
  abi,
  address,
  functionSignature,
  params,
  chain,
  useBiconomy = false,
) => {
  let web3ToUse;

  try {
    if (useBiconomy) {
      const biconomy = await startBiconomy(chain, walletProvider);
      web3ToUse = new Web3(biconomy);
    } else {
      web3ToUse = new Web3(walletProvider);
    }

    const contract = new web3ToUse.eth.Contract(abi as any, address);

    const method = contract.methods[functionSignature].apply(null, params);
    const tx = await method.send({
      from: walletAddress,
    });

    return tx;
  } catch (error) {
    console.log(error);
    console.log({
      abi: abi,
      address: address,
      functionSignature: functionSignature,
      params: params,
      walletAddress: walletAddress,
    });

    if (error.code == 4001) {
      throw 'User denied message signature';
    }

    if (error.code == 417) {
      throw 'Error while estimating gas. Please try again';
    }

    if (error.toString().includes('reverted by the EVM')) {
      throw 'Transaction has been reverted by the EVM. Please try again';
    }

    throw 'Something went wrong with your transaction. Please try again';
  }
};

export const callContract = async (
  abi,
  address,
  functionSignature,
  params,
  chain,
) => {
  const providerUrl =
    chain === EChain.ETHEREUM ? ethereumProviderUrl : polygonProviderUrl;
  const ethersProvider = new ethers.providers.JsonRpcProvider(providerUrl);
  const contract = new ethers.Contract(address, abi, ethersProvider);

  try {
    const method = contract[functionSignature].apply(null, params);
    const txResult = await method;

    if (ethers.BigNumber.isBigNumber(txResult)) {
      return txResult.toString();
    }

    return txResult;
  } catch (error) {
    console.log(abi, address, functionSignature, params);
    // here do all error handling to readable stuff
    console.log(error);
  }
};

const alluoPriceUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? 'https://protocol-mainnet.gnosis.io/api'
    : 'https://protocol-mainnet.dev.gnosisdev.com/api';

export const getAlluoPrice = async (): Promise<number> => {
  const pathforUSDC =
    alluoPriceUrl +
    `/v1/markets/${EEthereumAddressesMainnet.ALLUO}-${EEthereumAddressesMainnet.USDC}/sell/1000000000000000000`;

  const usdcPrice = await fetch(pathforUSDC).then(res => res.json());

  const alluoPrice = +fromDecimals(usdcPrice.amount, 6);
  return alluoPrice;
};

export const getAlluoPriceInWETH = async (value = 1): Promise<string> => {
  const valueInDecimals = toDecimals(value, 18);

  const pathforWETH =
    alluoPriceUrl +
    `/v1/markets/${EEthereumAddressesMainnet.WETH}-${EEthereumAddressesMainnet.ALLUO}/sell/${valueInDecimals}`;

  const wethPriceObj = await fetch(pathforWETH).then(res => res.json());
  const wethPrice = wethPriceObj?.amount || 0;

  return fromDecimals(wethPrice, 18);
};

export const isExpectedPolygonEvent = (type, depositAddress) => {
  const ibAlluoAddress = getIbAlluoAddress(type);
  return depositAddress.toLowerCase() === ibAlluoAddress.toLowerCase();
};

export const unlockAlluo = async value => {
  const abi = [
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'unlock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const alluoAmountInWei = Web3.utils.toWei(value + '');

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'unlock(uint256)',
    [alluoAmountInWei],
    EChain.ETHEREUM,
  );

  return tx;
};

export const unlockAllAlluo = async () => {
  const abi = [
    {
      inputs: [],
      name: 'unlockAll',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'unlockAll()',
    null,
    EChain.ETHEREUM,
  );

  return tx;
};

export const withdrawAlluo = async () => {
  const abi = [
    {
      inputs: [],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'withdraw()',
    null,
    EChain.ETHEREUM,
  );

  return tx;
};

export const getSupportedTokensList = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'getListSupportedTokens',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const ibAlluoAddress = getIbAlluoAddress(type, chain);

    const supportedTokenAddressesList = await callContract(
      abi,
      ibAlluoAddress,
      'getListSupportedTokens()',
      null,
      chain,
    );

    const supportedTokensWithBasicInfo = [];

    const requests = supportedTokenAddressesList.map(async tokenAddress => {
      const info = await getSupportedTokensBasicInfo(tokenAddress, chain);
      supportedTokensWithBasicInfo.push(info);
    });

    await Promise.allSettled(requests);

    supportedTokensWithBasicInfo.sort((a, b) => b.balance - a.balance);

    return supportedTokensWithBasicInfo;
  } catch (error) {
    console.log(error);
  }
};

export const getListSupportedTokens = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'getListSupportedTokens',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const ibAlluoAddress = getIbAlluoAddress(type, chain);

    const supportedTokenList = await callContract(
      abi,
      ibAlluoAddress,
      'getListSupportedTokens()',
      null,
      chain,
    );

    const tokensWithInfo = [];

    const requests = supportedTokenList.map(async tokenAddress => {
      const info = await getStableCoinInfo(tokenAddress, type, chain);
      tokensWithInfo.push(info);
    });

    await Promise.allSettled(requests);

    tokensWithInfo.sort((a, b) => b.balance - a.balance);

    return tokensWithInfo;
  } catch (error) {
    console.log(error);
  }
};

const getIbAlluoAddress = (type, chain = EChain.POLYGON) => {
  let VLALLUOAddr;
  switch (chain) {
    case EChain.POLYGON:
      VLALLUOAddr = {
        usd: EPolygonAddresses.IBALLUOUSD,
        eur: EPolygonAddresses.IBALLUOEUR,
        eth: EPolygonAddresses.IBALLUOETH,
        btc: EPolygonAddresses.IBALLUOBTC,
      };
      break;

    case EChain.ETHEREUM:
      VLALLUOAddr = {
        usd: EEthereumAddresses.IBALLUOUSD,
        eur: EEthereumAddresses.IBALLUOEUR,
        eth: EEthereumAddresses.IBALLUOETH,
        btc: EEthereumAddresses.IBALLUOBTC,
      };
      break;
    default:
      break;
  }

  return VLALLUOAddr[type];
};

export const getSupportedTokensBasicInfo = async (
  tokenAddress,
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const symbol = await callContract(
      abi,
      tokenAddress,
      'symbol()',
      null,
      chain,
    );

    const decimals = await callContract(
      abi,
      tokenAddress,
      'decimals()',
      null,
      chain,
    );

    return {
      tokenAddress,
      symbol,
      decimals,
    };
  } catch (error) {
    throw error;
  }
};

export const getSupportedTokensAdvancedInfo = async (
  farmAddress,
  supportedToken,
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
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

    const balance = await callContract(
      abi,
      supportedToken.tokenAddress,
      'balanceOf(address)',
      [walletAddress],
      chain,
    );

    const allowance = await callContract(
      abi,
      supportedToken.tokenAddress,
      'allowance(address,address)',
      [walletAddress, farmAddress],
      chain,
    );

    return {
      balance: fromDecimals(balance, supportedToken.decimals),
      allowance: allowance,
    };
  } catch (error) {
    throw error;
  }
};

export const getStableCoinInfo = async (
  tokenAddress,
  type,
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
      {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
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

    const symbol = await callContract(
      abi,
      tokenAddress,
      'symbol()',
      null,
      chain,
    );

    const decimals = await callContract(
      abi,
      tokenAddress,
      'decimals()',
      null,
      chain,
    );

    const balance = await callContract(
      abi,
      tokenAddress,
      'balanceOf(address)',
      [walletAddress],
      chain,
    );

    const ibAlluoAddress = getIbAlluoAddress(type, chain);

    const allowance = await callContract(
      abi,
      tokenAddress,
      'allowance(address,address)',
      [walletAddress, ibAlluoAddress],
      chain,
    );

    return {
      tokenAddress,
      symbol,
      decimals,
      balance: fromDecimals(balance, decimals),
      allowance: fromDecimals(allowance, decimals),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * @description Get meta transaction nonce for on contract.
 * @param {string} metaTxContractAddress - Contract address to which nonce is requested.
 * @param {string} user - Address of user whose nonce is requested.
 * @returns {Promise<number>} User nonce.
 */
async function getAddressNonce(metaTxContractAddress, user) {
  // this is merged combination of abi of different contracts - nonces
  // are fetched differently on some contracts.
  const abi = [
    // get nonce of specific address for signing message
    // (increments on every successful tx)
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'nonces',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'getNonce',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const metaTxContract = new web3.eth.Contract(abi, metaTxContractAddress);

  // get user nonce
  let nonce;
  try {
    if (usesNoncesAddresses.includes(metaTxContractAddress)) {
      nonce = await metaTxContract.methods.nonces(user).call();
    } else {
      nonce = await metaTxContract.methods.getNonce(user).call();
    }
  } catch (error) {
    console.log(error);
  }

  return nonce;
}

const getSignatureParameters = signature => {
  if (!Web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.'),
    );
  }
  let r = signature.slice(0, 66);
  let s = '0x'.concat(signature.slice(66, 130));
  let v = Web3.utils.hexToNumber('0x'.concat(signature.slice(130, 132)));
  if (![27, 28].includes(v)) v += 27;

  return {
    r: r,
    s: s,
    v: v,
  };
};

export const approveStableCoin = async (
  farmAddress,
  tokenAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  if (chain == EChain.ETHEREUM || !useBiconomy) {
    try {
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

      const tx = await sendTransaction(
        abi,
        tokenAddress,
        'approve(address,uint256)',
        [farmAddress, maximumUint256Value],
        chain,
      );

      return tx;
    } catch (error) {
      throw error;
    }
  } else {
    const biconomy = await startBiconomy(chain, walletProvider);
    const biconomyWeb3 = new Web3(biconomy);

    const nonce = await getAddressNonce(tokenAddress, walletAddress);

    let domain;
    let types;
    let message;
    let primaryType;
    let contract;

    const abiNameMethod = {
      inputs: [],
      name: 'name',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    };

    const chainId = await web3.eth.getChainId();

    let usePermit = false;

    if (permitOnlyTokenAddresses.includes(tokenAddress)) {
      usePermit = true;
      const abi = [
        {
          inputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'address', name: 'spender', type: 'address' },
            { internalType: 'uint256', name: 'value', type: 'uint256' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' },
            { internalType: 'uint8', name: 'v', type: 'uint8' },
            { internalType: 'bytes32', name: 'r', type: 'bytes32' },
            { internalType: 'bytes32', name: 's', type: 'bytes32' },
          ],
          name: 'permit',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        abiNameMethod,
      ];

      contract = new biconomyWeb3.eth.Contract(abi as any, tokenAddress);

      const name = await contract.methods.name().call();

      domain = {
        name: name,
        version: '1',
        chainId: chainId,
        verifyingContract: tokenAddress,
      };
      primaryType = 'Permit';
      const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ];
      const permit = [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ];
      types = { Permit: permit, EIP712Domain: EIP712Domain };
      message = {
        owner: walletAddress,
        spender: farmAddress,
        value: maximumUint256Value,
        nonce: nonce,
        deadline: maximumUint256Value,
      };
    } else {
      const abi = [
        {
          inputs: [
            { internalType: 'address', name: 'userAddress', type: 'address' },
            { internalType: 'bytes', name: 'functionSignature', type: 'bytes' },
            { internalType: 'bytes32', name: 'sigR', type: 'bytes32' },
            { internalType: 'bytes32', name: 'sigS', type: 'bytes32' },
            { internalType: 'uint8', name: 'sigV', type: 'uint8' },
          ],
          name: 'executeMetaTransaction',
          outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
          stateMutability: 'payable',
          type: 'function',
        },
        abiNameMethod,
      ];
      contract = new biconomyWeb3.eth.Contract(abi as any, tokenAddress);

      const name = await contract.methods.name().call();
      const functionSignature =
        '0x095ea7b3' +
        web3.utils.padLeft(farmAddress, 64).replace('0x', '') +
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      const salt = web3.utils.padLeft(web3.utils.toHex(chainId), 64, '0');

      domain = {
        name: name,
        version: '1',
        verifyingContract: tokenAddress,
        salt: salt,
      };
      primaryType = 'MetaTransaction';
      const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ];
      const metaTransaction = [
        { name: 'nonce', type: 'uint256' },
        { name: 'from', type: 'address' },
        { name: 'functionSignature', type: 'bytes' },
      ];
      types = { MetaTransaction: metaTransaction, EIP712Domain: EIP712Domain };
      message = {
        nonce: nonce,
        from: walletAddress,
        functionSignature: functionSignature,
      };
    }

    let msgParams = JSON.stringify({
      domain: domain,
      message: message,
      primaryType: primaryType,
      types: types,
    });

    let params = [walletAddress, msgParams];
    let method = 'eth_signTypedData_v4';

    const res = new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method,
          params,
          walletAddress,
        },
        async function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          if (result.error) {
            reject(result);
            return;
          }

          const { r, s, v } = getSignatureParameters(result.result);

          try {
            let tx;
            if (usePermit) {
              tx = await contract.methods
                .permit(
                  message.owner,
                  message.spender,
                  message.value,
                  message.deadline,
                  v,
                  r,
                  s,
                )
                .send({
                  from: walletAddress,
                });
            } else {
              tx = await contract.methods
                .executeMetaTransaction(
                  walletAddress,
                  message.functionSignature,
                  r,
                  s,
                  v,
                )
                .send({
                  from: walletAddress,
                });
            }
            resolve(tx);
          } catch (err) {
            console.log('handle errors like signature denied here');
            console.log(err);
            reject(err);
          }
        },
      );
    });

    return await res;
  }
};

export const depositStableCoin = async (
  tokenAddress,
  amount,
  decimals,
  type = 'usd',
  chain = EChain.POLYGON,
  useBiconomy,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: '_token', type: 'address' },
          { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
    const ibAlluoAddress = getIbAlluoAddress(type, chain);

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      ibAlluoAddress,
      'deposit(address,uint256)',
      [tokenAddress, amountInDecimals],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const depositIntoBoosterFarm = async (
  farmAddress,
  tokenAddress,
  amount,
  decimals,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  const abi = [
    {
      inputs: [
        { internalType: 'uint256', name: 'assets', type: 'uint256' },
        { internalType: 'address', name: 'entryToken', type: 'address' },
      ],
      name: 'depositWithoutLP',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const amountInDecimals = toDecimals(amount, decimals);

  const tx = await sendTransaction(
    abi,
    farmAddress,
    'depositWithoutLP(uint256,address)',
    [amountInDecimals, tokenAddress],
    chain,
    useBiconomy,
  );

  return tx;
};

export const getBoosterFarmRewards = async (
  farmAddress,
  curvePoolAddress,
  chain,
) => {
  const farmAbi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'earned',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const curvePoolAbi = [
    {
      stateMutability: 'view',
      type: 'function',
      name: 'calc_withdraw_one_coin',
      inputs: [
        { name: '_token_amount', type: 'uint256' },
        { name: 'i', type: 'int128' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
    },
  ];

  const value = await callContract(
    farmAbi,
    farmAddress,
    'earned(address)',
    [walletAddress],
    chain,
  );

  const stableValue =
    value > 0
      ? await callContract(
          curvePoolAbi,
          curvePoolAddress,
          'calc_withdraw_one_coin(uint256,int128)',
          [value, 1],
          chain,
        )
      : 0;

  const valueAmountInDecimals = fromDecimals(value, 18);
  console.log(
    value,
    valueAmountInDecimals,
    roundNumberDown(valueAmountInDecimals, 7),
    stableValue,
    fromDecimals(stableValue || 0, 6),
  );

  return {
    value: roundNumberDown(valueAmountInDecimals, 7),
    stableValue: stableValue ? fromDecimals(stableValue, 6) : 0,
  };
};

export const approve = async (
  tokenAddress,
  spender,
  chain = EChain.ETHEREUM,
  useBiconomy = false,
) => {
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

  const tx = await sendTransaction(
    abi,
    tokenAddress,
    'approve(address,uint256)',
    [spender, maximumUint256Value],
    chain,
    useBiconomy,
  );

  return tx;
};

export const getUserDepositedAmount = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getBalance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const address = getIbAlluoAddress(type, chain);

  const userDepositedAmount = await callContract(
    abi,
    address,
    'getBalance(address)',
    [walletAddress],
    chain,
  );

  return Web3.utils.fromWei(userDepositedAmount);
};

export const getUserDepositedLPAmount = async (farmAddress, chain) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const userDepositedLPAmount = await callContract(
    abi,
    farmAddress,
    'balanceOf(address)',
    [walletAddress],
    chain,
  );

  return Web3.utils.fromWei(userDepositedLPAmount);
};

const boosterFarmInterestApiUrl =
  'https://api-py.llama.airforce/convex/v1/pools/apr/';
const getTotalApr = apr => {
  return apr.baseApr + apr.crvApr + apr.cvxApr + apr.extraRewardsApr;
};
export const getBoosterFarmInterest = async (
  farmAddress,
  convexFarmIds,
  chain,
) => {
  const abi = [
    {
      inputs: [],
      name: 'adminFee',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const f =
    1 -
    (await callContract(abi, farmAddress, 'adminFee()', null, chain)) / 10000;

  const [aJsonResult, bJsonResult] = await Promise.all([
    fetch(boosterFarmInterestApiUrl + convexFarmIds.A).then(res => res.json()),
    fetch(boosterFarmInterestApiUrl + convexFarmIds.B).then(res => res.json()),
  ]);

  const a = getTotalApr(aJsonResult.apr[0]);
  const b = 1 + getTotalApr(bJsonResult.apr[0]);

  return toExactFixed(a * f * b * 100, 2);
};

export const getTotalAssetSupply = async (type, chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'totalAssetSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const totalAssetSupply = await callContract(
    abi,
    ibAlluoAddress,
    'totalAssetSupply()',
    null,
    chain,
  );

  return ethers.utils.formatEther(totalAssetSupply);
};

export const getTotalAssets = async (farmAddress, chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'totalAssets',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const totalAssetSupply = await callContract(
    abi,
    farmAddress,
    'totalAssets()',
    null,
    chain,
  );

  return Web3.utils.fromWei(totalAssetSupply);
};

export const getUserDepositedTransferAmount = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getBalanceForTransfer',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const userDepositedAmount = await callContract(
    abi,
    ibAlluoAddress,
    'getBalanceForTransfer(address)',
    [walletAddress],
    chain,
  );

  return Web3.utils.fromWei(userDepositedAmount);
};

export const getInterest = async (type = 'usd', chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'annualInterest',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const interest = await callContract(
    abi,
    ibAlluoAddress,
    'annualInterest()',
    null,
    chain,
  );

  return fromDecimals(interest, 2);
};

export const withdrawStableCoin = async (
  coinAddress,
  amount,
  type = 'usd',
  chain = EChain.POLYGON,
  useBiconomy,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: '_targetToken', type: 'address' },
          { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const ibAlluoAddress = getIbAlluoAddress(type, chain);

    const amountInWei = Web3.utils.toWei(amount);

    const tx = await sendTransaction(
      abi,
      ibAlluoAddress,
      'withdraw(address,uint256)',
      [coinAddress, amountInWei],
      chain,
      useBiconomy,
    );

    return tx.blockNumber;
  } catch (error) {
    throw error;
  }
};

export const withdrawFromBoosterFarm = async (
  farmAddress,
  tokenAddress,
  amount,
  decimals,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'uint256', name: 'assets', type: 'uint256' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'address', name: 'exitToken', type: 'address' },
        ],
        name: 'withdrawToNonLp',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'withdrawToNonLp(uint256,address,address,address)',
      [amountInDecimals, walletAddress, walletAddress, tokenAddress],
      chain,
      useBiconomy,
    );

    return tx.blockNumber;
  } catch (error) {
    throw error;
  }
};

export const claimBoosterFarmLPRewards = async (
  farmAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'claimRewards',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'claimRewards()',
      null,
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const claimBoosterFarmNonLPRewards = async (
  farmAddress,
  tokenAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: 'exitToken', type: 'address' },
        ],
        name: 'claimRewardsInNonLp',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'claimRewardsInNonLp(address)',
      [tokenAddress],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const listenToHandler = blockNumber => {
  const handlerInstance = new web3.eth.Contract(
    polygonHandlerAbi as any,
    EPolygonAddresses.HANDLER,
  );

  return handlerInstance.events;
};

export const getIfUserHasWithdrawalRequest = async (
  walletAddress,
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: '_ibAlluo', type: 'address' },
        { internalType: 'address', name: '_user', type: 'address' },
      ],
      name: 'isUserWaiting',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'ibAlluoToWithdrawalSystems',
      outputs: [
        {
          internalType: 'uint256',
          name: 'lastWithdrawalRequest',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'lastSatisfiedWithdrawal',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'totalWithdrawalAmount',
          type: 'uint256',
        },
        { internalType: 'bool', name: 'resolverTrigger', type: 'bool' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: '_ibAlluo', type: 'address' },
        { internalType: 'uint256', name: '_id', type: 'uint256' },
      ],
      name: 'getWithdrawal',
      outputs: [
        {
          components: [
            { internalType: 'address', name: 'user', type: 'address' },
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'time', type: 'uint256' },
          ],
          internalType: 'struct LiquidityHandler.Withdrawal',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const polygonHandlerAddress = EPolygonAddresses.HANDLER;

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const isUserWaiting = await callContract(
    abi,
    polygonHandlerAddress,
    'isUserWaiting(address,address)',
    [ibAlluoAddress, walletAddress],
    chain,
  );

  if (!isUserWaiting) return [];

  const ibAlluoToWithdrawalSystems = await callContract(
    abi,
    polygonHandlerAddress,
    'ibAlluoToWithdrawalSystems(address)',
    [ibAlluoAddress],
    chain,
  );

  const { lastSatisfiedWithdrawal, lastWithdrawalRequest } =
    ibAlluoToWithdrawalSystems;
  const allWithdrawalRequests = [];

  for (let i = +lastSatisfiedWithdrawal + 1; i <= +lastWithdrawalRequest; i++) {
    const withdrawal = await callContract(
      abi,
      polygonHandlerAddress,
      'getWithdrawal(address,uint256)',
      [ibAlluoAddress, i],
      chain,
    );
    allWithdrawalRequests.push(withdrawal);
  }

  const allWithdrawals = await Promise.all(allWithdrawalRequests);
  const usersWithdrawals = allWithdrawals.filter(
    w => w.user.toLowerCase() === walletAddress.toLowerCase(),
  );

  return usersWithdrawals;
};
