import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
<<<<<<< HEAD
import { useBoostFarmWithdrawal } from 'app/common/state/boostFarm/useBoostFarmWithdrawal';
=======
import { useBoostFarmWithdrawal } from 'app/common/state/boostFarm';
>>>>>>> staging
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components';
<<<<<<< HEAD
import { BoostFarmWithdrawalConfirmation } from './BoostFarmWithdrawalConfirmation';

export const BoostFarmWithdrawalTab = ({
  selectedFarm,
  isLoading,
  updateFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  nextHarvestDate,
  showBoostWithdrawalConfirmation,
  startBoostWithdrawalConfirmation,
  cancelBoostWithdrawalConfirmation,
  losablePendingRewards,
  ...rest
=======

export const BoostFarmWithdrawalTab = ({
  // farm
  isLoading,
  selectedFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  // withdraw
  withdrawValue,
  setWithdrawValue,
  startBoostWithdrawalConfirmation,
  isWithdrawing,
  // biconomy
  useBiconomy,
  setUseBiconomy,
>>>>>>> staging
}) => {
  const {
    hasErrors,
    withdrawValueError,
<<<<<<< HEAD
    withdrawValue,
    handleWithdrawalFieldChange,
    isFetchingSupportedTokenInfo,
    isWithdrawing,
    handleWithdraw,
    useBiconomy,
    setUseBiconomy,
    selectedSupportedTokenInfo,
  } = useBoostFarmWithdrawal({
    selectedFarm,
    selectedSupportedToken,
    updateFarmInfo,
    cancelBoostWithdrawalConfirmation
=======
    handleWithdrawalFieldChange,
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
  } = useBoostFarmWithdrawal({
    selectedFarmInfo,
    selectedSupportedToken,
    withdrawValue,
    setWithdrawValue,
>>>>>>> staging
  });

  return (
    <Box fill>
<<<<<<< HEAD
      <Box
        style={{
          minHeight: '504px',
        }}
      >
        {showBoostWithdrawalConfirmation && !isWithdrawing ? (
          <BoostFarmWithdrawalConfirmation
            selectedFarm={selectedFarm}
            withdrawValue={withdrawValue}
            withdrawTokenLabel={selectedSupportedToken?.label}
            handleWithdraw={handleWithdraw}
            cancelBoostWithdrawalConfirmation={
              cancelBoostWithdrawalConfirmation
            }
            nextHarvestDate={nextHarvestDate}
            losablePendingRewards={losablePendingRewards}
          />
        ) : (
          <>
            {isWithdrawing ? (
              <Box
                align="center"
                justify="center"
                fill="vertical"
                margin={{ top: 'large', bottom: 'medium' }}
              >
                <Spinner pad="large" />
              </Box>
            ) : (
              <>
                <Box margin={{ top: 'large' }}>
                  <TopHeader
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                  />
                </Box>
                <Box margin={{ top: 'medium' }}>
                  <NumericInput
                    label={`Withdraw ${
                      selectedSupportedToken
                        ? selectedSupportedToken?.label
                        : ''
                    }`}
                    available={selectedSupportedTokenInfo?.boostDepositedAmount}
                    tokenSign={selectedSupportedToken?.sign}
                    onValueChange={handleWithdrawalFieldChange}
                    value={withdrawValue}
                    maxButton={true}
                    maxValue={selectedSupportedTokenInfo?.boostDepositedAmount}
                    tokenOptions={selectedFarm?.supportedTokens || []}
                    selectedToken={selectedSupportedToken}
                    setSelectedToken={selectSupportedToken}
                    error={withdrawValueError}
                    slippageWarning={true}
                    lowSlippageTokenLabels={
                      selectedFarm?.lowSlippageTokenLabels
                    }
                    disabled={isLoading}
                  />
                </Box>
                <Box margin={{ top: '11px' }}>
                  <ProjectedWeeklyInfo
                    depositedAmount={selectedFarm?.depositedAmount}
                    inputValue={-1 * +withdrawValue}
                    interest={selectedFarm?.interest}
                    sign={selectedFarm?.sign}
                    isLoading={isLoading}
                  />
                  <Info
                    label="APY"
                    value={
                      toExactFixed(selectedFarm?.interest, 2).toLocaleString() +
                      '%'
                    }
                    isLoading={isLoading}
                  />
                  <Info
                    label="Pool liquidity"
                    value={
                      selectedFarm?.sign +
                      (+selectedFarm?.totalAssetSupply).toLocaleString()
                    }
                    isLoading={isLoading}
                  />
                  <FeeInfo
                    biconomyToggle={selectedFarm?.chain == EChain.POLYGON}
                    useBiconomy={useBiconomy}
                    setUseBiconomy={setUseBiconomy}
                    showWalletFee={
                      !useBiconomy || selectedFarm?.chain != EChain.POLYGON
                    }
                    disableBiconomy={isLoading}
                    isLoading={isLoading}
                  />
                </Box>
              </>
            )}
          </>
        )}
      </Box>
      {!showBoostWithdrawalConfirmation && (
        <Box margin={{ top: 'medium' }}>
          <SubmitButton
            primary
            label={+withdrawValue > 0 ? 'Withdraw' : 'Enter amount'}
            disabled={
              isLoading ||
              isWithdrawing ||
              isFetchingSupportedTokenInfo ||
              !+withdrawValue ||
              hasErrors
            }
            onClick={() =>
              startBoostWithdrawalConfirmation(
                withdrawValue,
                selectedSupportedTokenInfo.boostDepositedAmount,
              )
            }
          />
        </Box>
      )}
=======
      <Box style={{
          minHeight: selectedFarmInfo.current?.chain == EChain.POLYGON ? '509px' : '480px',
        }}>
        {isWithdrawing ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <>
            <Box margin={{ top: 'large' }}>
              <TopHeader selectedFarmInfo={selectedFarmInfo} isLoading={isLoading} />
            </Box>
            <Box margin={{ top: 'medium' }}>
              <NumericInput
                label={`Withdraw ${
                  selectedSupportedToken ? selectedSupportedToken?.label : ''
                }`}
                available={
                  selectedSupportedTokenInfo.current?.boostDepositedAmount
                }
                tokenSign={selectedSupportedToken?.sign}
                onValueChange={handleWithdrawalFieldChange}
                value={withdrawValue}
                maxButton={true}
                maxValue={
                  selectedSupportedTokenInfo.current?.boostDepositedAmount
                }
                tokenOptions={selectedFarmInfo.current?.supportedTokens || []}
                selectedToken={selectedSupportedToken}
                setSelectedToken={selectSupportedToken}
                error={withdrawValueError}
                slippageWarning={true}
                lowSlippageTokenLabels={
                  selectedFarmInfo.current?.lowSlippageTokenLabels
                }
                disabled={isLoading}
              />
            </Box>
            <Box margin={{ top: '11px' }}>
              <ProjectedWeeklyInfo
                depositedAmount={selectedFarmInfo.current?.depositedAmount}
                inputValue={-1 * +withdrawValue}
                interest={selectedFarmInfo.current?.interest}
                sign={selectedFarmInfo.current?.sign}
                isLoading={isLoading}
              />
              <Info
                label="APY"
                value={
                  toExactFixed(
                    selectedFarmInfo.current?.interest,
                    2,
                  ).toLocaleString() + '%'
                }
                isLoading={isLoading}
              />
              <Info
                label="Pool liquidity"
                value={
                  selectedFarmInfo.current?.sign +
                  (+selectedFarmInfo.current?.totalAssetSupply).toLocaleString()
                }
                isLoading={isLoading}
              />
              <FeeInfo
                biconomyToggle={selectedFarmInfo.current?.chain == EChain.POLYGON}
                useBiconomy={useBiconomy}
                setUseBiconomy={setUseBiconomy}
                showWalletFee={
                  !useBiconomy || selectedFarmInfo.current?.chain != EChain.POLYGON
                }
                disableBiconomy={isLoading}
                isLoading={isLoading}
              />
            </Box>
          </>
        )}
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          label="Withdraw"
          disabled={
            isLoading ||
            isWithdrawing ||
            isFetchingSupportedTokenInfo ||
            withdrawValue == '' ||
            hasErrors
          }
          onClick={() =>
            startBoostWithdrawalConfirmation(
              selectedSupportedTokenInfo.current?.boostDepositedAmount,
            )
          }
        />
      </Box>
>>>>>>> staging
    </Box>
  );
};
