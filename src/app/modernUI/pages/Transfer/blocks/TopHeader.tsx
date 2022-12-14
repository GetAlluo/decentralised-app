import { toExactFixed } from 'app/common/functions/utils';
import { Text } from 'grommet';

export const TopHeader = ({ ibAlluosInfo, ...rest }) => {
  console.log(ibAlluosInfo)
  const alluoTextBalances = ibAlluosInfo
    .filter(token => token.balance > 0)
    .map(token => {
      return toExactFixed(token.balance, 5) + ' ' + token.label;
    });
  return (
    <>
      {alluoTextBalances.length > 0 ? (
        <Text textAlign="center" weight="bold">
          Assets earning yield: {alluoTextBalances.join(', ')}
        </Text>
      ) : (
        <Text textAlign="center" weight="bold">
          You don’t have any assets earning yield.
        </Text>
      )}
    </>
  );
};
