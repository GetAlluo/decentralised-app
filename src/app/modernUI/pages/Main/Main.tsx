import { useRecoilState } from 'recoil';
import {
  Box,
  Heading,
  Paragraph,
  Text,
  Button,
  Card,
  Grid,
  ResponsiveContext,
} from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { toExactFixed } from 'app/common/functions/utils';
import { isSmall } from 'app/modernUI/theme';
import { useMain } from 'app/common/state/shortcuts';
import { Spinner, Layout } from 'app/modernUI/components';
import { Assets } from './blocks';
import { walletAccount } from 'app/common/state/atoms';

export const Main = () => {
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const {
    headingData,
    availableFarms,
    isLoading,
    filterToYourFarms,
    resetFilters,
    filterType,
  } = useMain();

  const headingText = isLoading ? (
    <Box fill>
      <Skeleton count={2} />
    </Box>
  ) : (
    <>
      {headingData.numberOfAssets == 0 ? (
        'You don’t have available assets to farm in your wallet.'
      ) : (
        <span>
          You have {headingData.numberOfAssets}{' '}
          {headingData.numberOfAssets > 1 ? 'assets' : 'asset'} across{' '}
          {headingData.numberOfChainsWithAssets}{' '}
          {headingData.numberOfChainsWithAssets > 1 ? 'networks' : 'network'}{' '}
          available to farm.
        </span>
      )}
    </>
  );

  return (
    <Layout>
      <ResponsiveContext.Consumer>
        {size => (
          <>
            <Box
              align="center"
              justify="start"
              gap="none"
              pad="xsmall"
              margin={{ top: 'small' }}
              direction="column"
              fill="horizontal"
            >
              <Box justify="center" fill direction="column">
                <Heading margin="none" fill size={'36px'}>
                  {!walletAccountAtom
                    ? 'Connect your wallet to see your available assets to farm.'
                    : headingText}
                </Heading>
                <Paragraph margin={{ top: '35px' }} fill>
                  Fund your wallet using stablecoin or fiat currency here to
                  start investing. Get your yield in the same coin and withdraw
                  at any time with no cost and no lock-in period.{' '}
                </Paragraph>
                <Box
                  align="center"
                  justify="center"
                  fill="horizontal"
                  direction="column"
                >
                  <Box
                    gap="small"
                    direction="column"
                    fill
                    margin={{ top: '72px' }}
                  >
                    <Box
                      direction="row"
                      justify="start"
                      gap="small"
                      style={{ fontSize: '16px' }}
                    >
                      <Button
                        size="small"
                        onClick={resetFilters}
                        label="All farms"
                        plain
                        style={
                          !filterType ? { textDecoration: 'underline' } : {}
                        }
                      />
                      <Button
                        size="small"
                        onClick={filterToYourFarms}
                        label="Your farms"
                        plain
                        style={
                          filterType == 'your'
                            ? { textDecoration: 'underline' }
                            : {}
                        }
                      />
                    </Box>
                    {!isSmall(size) && (
                      <Card
                        pad={{ horizontal: 'medium', vertical: 'none' }}
                        height="65px"
                        background="card"
                        margin="none"
                        align="center"
                        justify="center"
                        fill="horizontal"
                      >
                        <Grid
                          fill="horizontal"
                          rows="xxsmall"
                          align="center"
                          columns={{ size: 'xsmall', count: 'fit' }}
                          pad="none"
                          style={{ fontSize: '16px' }}
                        >
                          <span>asset</span>
                          <span>supported tokens</span>
                          <span>network</span>
                          <span>TVL</span>
                          <span>APY</span>
                        </Grid>
                      </Card>
                    )}
                    {isLoading ? (
                      <Card
                        pad={{ horizontal: 'medium', vertical: 'none' }}
                        height="xsmall"
                        background="card"
                        margin="none"
                        align="center"
                        justify="center"
                        fill="horizontal"
                      >
                        <Spinner pad="medium" />
                      </Card>
                    ) : (
                      <>
                        <Assets
                          availableFarms={availableFarms}
                          isLoading={isLoading}
                        />
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box pad="large" />
          </>
        )}
      </ResponsiveContext.Consumer>
    </Layout>
  );
};
