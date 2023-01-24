import {
  changeNetwork,
  getChainNameById,
  getCurrentChainId,
  onWalletUpdated,
  tryAutoWalletConnection
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import {
  isCorrectNetwork,
  isSafeApp,
  walletAccount,
  wantedChain
} from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { EChain, EChainId } from '../constants/chains';

export const useWallet = () => {
  const { resetNotification, setNotification } = useNotification();
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);
  const [wantedChainAtom] = useRecoilState(wantedChain);
  const [, setIsCorrectNetworkAtom] = useRecoilState(isCorrectNetwork);
  const [, setSafeAppAtom] = useRecoilState(isSafeApp);
  const [wantedChainId, setWantedChainId] = useState<EChainId>();
  const [currentChainId, setCurrentChainId] = useState<EChain>();

  const handleSafeAppConnection = (walletAddress, isGnosisSafe) => {
    setWalletAccountAtom(walletAddress);
    if (isGnosisSafe) {
      setSafeAppAtom(true);
    }
  };

  useEffect(() => {
    tryAutoWalletConnection(handleSafeAppConnection);
  }, []);

  const handleWalletChanged = (chainId, walletAddress) => {
    setCurrentChainId(chainId);
    setWalletAccountAtom(walletAddress);
  };

  useEffect(() => {
    onWalletUpdated(handleWalletChanged);
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom) {
      checkCurrentChain();
    }
  }, [currentChainId, wantedChainId]);

  useEffect(() => {
    if (walletAccountAtom) {
      setIsCorrectNetworkAtom(false);
      networkChange();
    }
  }, [wantedChainAtom]);

  const networkChange = async () => {
    if (wantedChainAtom != undefined) {
      const chainId = await changeNetwork(wantedChainAtom);
      setWantedChainId(chainId);
    } else {
      resetNotification();
    }
  };

  const checkCurrentChain = async () => {
    if (wantedChainId != undefined) {
      const isCorrectNetwork = (await getCurrentChainId()) == wantedChainId;
      setIsCorrectNetworkAtom(isCorrectNetwork);
      if (!isCorrectNetwork) {
        setNotification(
          `Please change your wallet network to ${getChainNameById(
            wantedChainId,
          )}`,
          'info',
          null,
          null,
          true,
        );
      } else {
        resetNotification();
      }
    } else {
      resetNotification();
    }
  };

  return {};
};
