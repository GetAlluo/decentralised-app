import { approveAlluoStaking, stakeAlluo } from 'app/common/functions/stake';
import { isNumeric } from 'app/common/functions/utils';
import { useNotification } from 'app/common/state';
import { walletAccount } from 'app/common/state/atoms';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

export const useLock = ({ alluoInfo, updateAlluoInfo }) => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);

  // other state control files
  const { setNotificationt, resetNotification } = useNotification();

  // inputs
  const [lockValue, setLockValue] = useState<string>();
  const [lockValueError, setLockValueError] = useState<string>();

  // loading control
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);

  const resetState = () => {
    setLockValueError('');
    setIsApproving(false);
    setIsLocking(false);
  };

  const handleLockValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setLockValueError('Write a valid number');
    } else if (+value > +alluoInfo?.balance) {
      setLockValueError('Not enough balance');
    }
    setLockValue(value);
  };

  const handleApprove = async () => {
    resetState();
    setIsApproving(true);

    try {
      await approveAlluoStaking();
      await updateAlluoInfo();
    } catch (err) {
      console.error('Error', err.message);
      setNotificationt(err.message, 'error');
    }

    setIsApproving(false);
  };

  const handleLock = async () => {
    resetState();
    setIsLocking(true);

    try {
      await stakeAlluo(lockValue);
      await updateAlluoInfo();
      setLockValue(null);
      setNotificationt('Successfully locked', 'success');
    } catch (error) {
      setNotificationt(error, 'error');
    }

    setIsLocking(false);
  };

  return {
    lockValue,
    isApproving,
    isLocking,
    handleLockValueChange,
    handleApprove,
    handleLock,
    lockValueError,
    hasErrors: lockValueError != '',
  };
};
