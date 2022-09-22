import { isNumeric } from 'app/common/functions/utils';
import {
  approveStableCoin,
  approveToken,
  depositIntoBoosterFarm,
  depositStableCoin,
} from 'app/common/functions/Web3Client';
import { useNotification } from 'app/common/state';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isSafeApp } from '../atoms';

export const useDepositForm = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
}) => {
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const { setNotificationt } = useNotification();
  const [depositValue, setDepositValue] = useState<string>();
  const [error, setError] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [useBiconomy, setUseBiconomy] = useState(!isSafeAppAtom);

  const resetState = () => {
    setError('');
    setIsApproving(false);
    setIsDepositing(false);
  };

  const handleApprove = async () => {
    setError('');
    setIsApproving(true);
    try {
      if (selectedFarm?.isBooster) {
        await approveToken(
          selectedSupportedToken.value,
          selectedFarm.farmAddress,
          selectedFarm.chain,
          useBiconomy,
        );
      } else {
        await approveStableCoin(
          selectedSupportedToken.value,
          selectedSupportedToken.decimals,
          selectedFarm.type,
          selectedFarm.chain,
        );
      }
      await updateFarmInfo();
      setNotificationt('Approved successfully', 'success');
    } catch (err) {
      setError(err.message);
    }
    setIsApproving(false);
  };

  const handleDepositFieldChange = e => {
    const { value } = e.target;
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setError('Write a valid number');
    } else if (+value > +selectedSupportedToken?.balance) {
      setError('Not enough balance');
    }
    setDepositValue(value);
  };

  const setToMax = () => {
    setError('');
    setDepositValue(selectedSupportedToken?.balance);
  };

  const handleDeposit = async () => {
    setError('');
    setIsDepositing(true);
    try {
      if (selectedFarm?.isBooster) {
        await depositIntoBoosterFarm(
          selectedFarm.farmAddress,
          selectedSupportedToken.value,
          depositValue,
          selectedSupportedToken.decimals,
          selectedFarm.chain,
          useBiconomy,
        );
      } else {
        await depositStableCoin(
          selectedSupportedToken.value,
          depositValue,
          selectedSupportedToken.decimals,
          selectedFarm.type,
          selectedFarm.chain,
          useBiconomy,
        );
      }
      await updateFarmInfo();
      resetState();
      setDepositValue(null);
      setNotificationt('Deposit successfully', 'success');
    } catch (err) {
      resetState();
      setNotificationt(err.message, 'error');
    }
    setIsDepositing(false);
  };

  return {
    error,
    depositValue,
    handleDepositFieldChange,
    setToMax,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setUseBiconomy,
    useBiconomy,
    resetState,
  };
};
