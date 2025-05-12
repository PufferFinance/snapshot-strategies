import { BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { Multicaller } from '../../utils';

export const author = 'bxmmm1';
export const version = '0.1.0';

const abi = [
  'function getPastVotes(address account, uint256 timepoint) view returns (uint256)'
];

export async function strategy(
  _space,
  network,
  provider,
  addresses,
  options
): Promise<Record<string, number>> {
  // We want to use `getPastVotes` because of the delegation happening on the contract
  // We want to use the past timestamp to get the votes at the start of the previous week

  // Date.now() returns milliseconds, so we divide by 1000 to get seconds
  // 7 * 24 * 60 * 60 = 7 days * 24 hours * 60 minutes * 60 seconds = 604800 seconds
  // Past timestamp will always return the votes at the end of the previous interval (-1 second)
  const pastTimestamp = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 - 1;

  const multi = new Multicaller(network, provider, abi);

  addresses.forEach((address) =>
    multi.call(address, options.address, 'getPastVotes', [
      address,
      pastTimestamp.toString()
    ])
  );

  const result: Record<string, BigNumberish> = await multi.execute();

  return Object.fromEntries(
    Object.entries(result).map(([address, balance]) => [
      address,
      parseFloat(formatUnits(balance, options.decimals))
    ])
  );
}
