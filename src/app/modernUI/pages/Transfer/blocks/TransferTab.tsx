import { getCoinIcon } from 'app/common/functions/getCoinIcon';
import { usePolygonInfoAtom } from 'app/common/state/shortcuts';
import { NewInput, Spinner, SubmitButton } from 'app/modernUI/components';
import { Info } from 'app/modernUI/components';
import SlideButton from 'app/modernUI/components/SlideButton';
import { useState } from 'react';
import { Box, Text, TextInput } from 'grommet';
import { useTransfer } from 'app/common/state/transfer';
import { TopHeader } from './TopHeader';

export const TransferTab = ({ ...rest }) => {
  const [biconomyStatus, setBiconomyStatus] = useState(false);

  const {
    error,
    transferValue,
    selectedIbAlluoInfo,
    setSelectedIbAlluoBySymbol,
    handleTransferValueChange,
    setToMax,
    isTransferring,
    handleTransfer,
    ibAlluosInfo,
    recipientAddress,
    handleRecipientAddressChange,
  } = useTransfer();

  const coinIcon = getCoinIcon(selectedIbAlluoInfo?.type);
  return (
    <Box fill>
      {isTransferring ? (
        <Box
          align="center"
          justify="center"
          fill="vertical"
          margin={{ top: 'large', bottom: 'medium' }}
        >
          <Spinner pad="large" />
        </Box>
      ) : (
        <Box margin={{ top: 'large' }}>
          <TopHeader ibAlluosInfo={ibAlluosInfo} />
          <Box margin={{ top: 'medium' }}>
            <NewInput
              inputLabel="Transfer"
              coinIcon={coinIcon}
              inputProps={{
                value: transferValue || '',
                onChange: handleTransferValueChange,
                max: selectedIbAlluoInfo?.balance || 0,
              }}
              maxButtonProps={{
                onClick: setToMax,
              }}
              selectProps={{
                options: ibAlluosInfo,
              }}
              selectedTokenInfo={selectedIbAlluoInfo}
              setSelectedToken={setSelectedIbAlluoBySymbol}
            />
          </Box>
          <Box margin={{ top: 'medium' }}>
            <Box direction="row" justify="between">
              <Text size="medium" color="soul">
                Recipient
              </Text>
            </Box>
            <TextInput
              value={recipientAddress}
              onChange={handleRecipientAddressChange}
              placeholder="Address"
            />
            <Text color="error" size="small" margin={{ top: 'small' }}>
              {error}
            </Text>
          </Box>
          <Info label="Gas fee" value={null} border={false}>
            <div style={{ textAlign: 'right', fontSize: 'small' }}>
              {biconomyStatus ? (
                <>
                  <span>No fees 🎉 - Paid for by Alluo via </span>
                  <a href="https://twitter.com/biconomy">Biconomy</a>
                </>
              ) : (
                'View Fee in metamask'
              )}
            </div>
            <SlideButton
              biconomyStatus={biconomyStatus}
              setBiconomyStatus={setBiconomyStatus}
            />
          </Info>
        </Box>
      )}
      <Box margin={{ top: 'large' }}>
        <SubmitButton
          primary
          disabled={
            isTransferring ||
            !(+(transferValue || 0) > 0) ||
            error !== '' ||
            recipientAddress === ''
          }
          label="Transfer"
          onClick={() => handleTransfer(biconomyStatus)}
        />
      </Box>
    </Box>
  );
};
