import { formatUnits } from 'viem';
import { SBC_DECIMALS } from '../constants';

export function formatSbc(balance: bigint | number | string): string {
  return Number(formatUnits(BigInt(balance), SBC_DECIMALS)).toFixed(3);
} 