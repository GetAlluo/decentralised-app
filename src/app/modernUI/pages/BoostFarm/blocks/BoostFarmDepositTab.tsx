import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useBoostFarmDeposit } from 'app/common/state/boostFarm';
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

export const BoostFarmDepositTab = ({
  isLoading,
  selectedFarm,
  selectSupportedToken,
  selectedSupportedToken,
  ...rest
}) => {
  const {
    hasErrors,
    depositValueError,
    depositValue,
    handleDepositValueChange,
    isApproving,
    isDepositing,
    setUseBiconomy,
    useBiconomy,
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  } = useBoostFarmDeposit({ selectedFarm, selectedSupportedToken });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: selectedFarm?.chain == EChain.POLYGON ? '462px' : '433px',
        }}
      >
        {isApproving || isDepositing ? (
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
              <TopHeader selectedFarm={selectedFarm} isLoading={isLoading} />
            </Box>
            <Box margin={{ top: 'medium' }}>
              <NumericInput
                label={`Deposit ${
                  selectedSupportedToken ? selectedSupportedToken?.label : ''
                }`}
                tokenSign={selectedFarm?.sign}
                onValueChange={handleDepositValueChange}
                value={depositValue}
                isLoadingMaxValue={isFetchingSupportedTokenInfo}
                maxButton={true}
                maxValue={selectedSupportedTokenInfo?.balance}
                tokenOptions={selectedFarm?.supportedTokens || []}
                selectedToken={selectedSupportedToken}
                setSelectedToken={selectSupportedToken}
                error={depositValueError}
                disabled={isLoading}
              />
            </Box>
            <Box margin={{ top: '11px' }}>
              <ProjectedWeeklyInfo
                depositedAmount={selectedFarm?.depositedAmount}
                inputValue={depositValue}
                interest={selectedFarm?.interest}
                sign={selectedFarm?.sign}
                isLoading={isLoading}
              />
              <Info
                label="APY"
                value={
                  toExactFixed(selectedFarm?.interest, 2).toLocaleString() + '%'
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
                isLoading={isLoading}
              />
            </Box>
          </>
        )}
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          disabled={
            isLoading ||
            isApproving ||
            isDepositing ||
            !(+depositValue > 0) ||
            isFetchingSupportedTokenInfo ||
            hasErrors
          }
          label={
            isFetchingSupportedTokenInfo
              ? 'Loading...'
              : selectedSupportedTokenSteps?.length > 1
              ? `Step ${currentStep + 1} of ${
                  selectedSupportedTokenSteps?.length
                }: ${selectedSupportedTokenSteps[currentStep]?.label}`
              : `${selectedSupportedTokenSteps[currentStep]?.label}`
          }
          onClick={handleCurrentStep}
        />
      </Box>
    </Box>
  );
};
