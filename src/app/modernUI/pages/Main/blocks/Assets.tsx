import { AssetCard } from '../components';
import { Box } from 'grommet';
import { EChain } from 'app/common/constants/chains';

export const Assets = ({ availableFarms, isLoading, viewType }) => {
  return (
    <Box gap="6px">
      {Array.isArray(availableFarms) &&
        availableFarms.map(farm => {
          return (
            <AssetCard
              id={farm.id}
              key={farm.id}
              type={farm.type}
              name={farm.name}
              totalAssetSupply={farm.totalAssetSupply}
              poolShare={farm.poolShare}
              balance={farm.depositedAmount}
              interest={farm.interest}
              disabled={false}
              sign={farm.sign}
              icons={farm.icons}
              isLoading={isLoading}
              chain={farm.chain as EChain}
              isBooster={farm.isBooster}
              viewType={viewType}
            />
          );
        })}
    </Box>
  );
};
