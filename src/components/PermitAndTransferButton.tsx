import React from 'react';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { encodeFunctionData, parseSignature } from 'viem';

type SmartWalletClient = NonNullable<ReturnType<typeof useSmartWallets>['client']>;

export function PermitAndTransferButton({
  permitData,
  smartWalletClient,
  setStatusMessage,
}: {
  permitData: any;
  smartWalletClient: SmartWalletClient | undefined;
  setStatusMessage: (msg: string) => void;
}) {
  const SBC_TOKEN_ADDRESS = '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16' as `0x${string}`;
  return (
    <button
      className="cursor-pointer mt-4 rounded-full border border-solid border-orange-400 text-orange-700 transition-colors flex items-center justify-center hover:bg-orange-50 hover:border-transparent font-medium text-sm px-6 py-2 w-full"
      disabled={!permitData || !smartWalletClient}
      onClick={async () => {
        if (!permitData || !smartWalletClient) {
          setStatusMessage('Permit signature or smart wallet client missing.');
          return;
        }
        try {
          const { owner, spender, value, deadline, signature } = permitData;
          const { v, r, s } = parseSignature(signature as `0x${string}`);
          // 1. permit calldata
          const permitCall = {
            to: SBC_TOKEN_ADDRESS,
            data: encodeFunctionData({
              abi: [
                {
                  name: 'permit',
                  type: 'function',
                  stateMutability: 'nonpayable',
                  inputs: [
                    { name: 'owner', type: 'address' },
                    { name: 'spender', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                    { name: 'v', type: 'uint8' },
                    { name: 'r', type: 'bytes32' },
                    { name: 's', type: 'bytes32' },
                  ],
                  outputs: [],
                },
              ],
              functionName: 'permit',
              args: [owner, spender, value, deadline, v as unknown as number, r, s],
            }),
          };
          // 2. transferFrom calldata
          const transferFromCall = {
            to: SBC_TOKEN_ADDRESS,
            data: encodeFunctionData({
              abi: [
                {
                  name: 'transferFrom',
                  type: 'function',
                  stateMutability: 'nonpayable',
                  inputs: [
                    { name: 'from', type: 'address' },
                    { name: 'to', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                  ],
                  outputs: [{ name: '', type: 'bool' }],
                },
              ],
              functionName: 'transferFrom',
              args: [owner, spender, value],
            }),
          };
          // Batch both calls
          const txHash = await smartWalletClient.sendTransaction({
            calls: [permitCall, transferFromCall],
          });
          setStatusMessage('permit + transferFrom sent! Tx: ' + txHash);
        } catch (e) {
          setStatusMessage('Failed to batch permit + transferFrom.');
          console.error(e);
        }
      }}
    >
      Smart Wallet: Permit + Transfer 1.000 SBC from Embedded Wallet
    </button>
  );
} 