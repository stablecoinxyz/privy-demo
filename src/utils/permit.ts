import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { ERC20_ABI } from './erc20';

export async function signPermitForSmartWallet({
  owner,
  spender,
  token,
  signTypedData,
}: {
  owner: `0x${string}`;
  spender: `0x${string}`;
  token: `0x${string}`;
  signTypedData: (data: any, options: any) => Promise<{ signature: string }>;
}) {
  // Use viem public client
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });
  // Get nonce
  const nonce = await publicClient.readContract({
    address: token,
    abi: [
      { name: 'nonces', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
    ],
    functionName: 'nonces',
    args: [owner],
  });
  // Get name
  const name = await publicClient.readContract({
    address: token,
    abi: [
      { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
    ],
    functionName: 'name',
  });
  
  // Get raw balance
  const balance = await publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [owner],
  });
  // Deadline: now + 1 hour
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  // EIP-2612 domain
  const domain = {
    name,
    version: '1',
    chainId: baseSepolia.id,
    verifyingContract: token,
  };
  // EIP-2612 types
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };
  const balanceBigInt = BigInt((balance as unknown as string));
  const nonceBigInt = BigInt((nonce as unknown as string));
  const deadlineBigInt = BigInt((deadline as unknown as string));
  const message = {
    owner,
    spender,
    value: balanceBigInt.toString(),
    nonce: nonceBigInt.toString(),
    deadline: deadlineBigInt.toString(),
  };
  const { signature } = await signTypedData(
    {
      domain,
      types,
      primaryType: 'Permit',
      message,
    },
    { address: owner }
  );
  return {
    signature,
    owner,
    spender,
    value: balanceBigInt,
    deadline: deadlineBigInt,
  };
} 