import React from 'react';
import { encodeFunctionData } from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

type SmartWalletClient = NonNullable<ReturnType<typeof useSmartWallets>['client']>;

export function SendGaslessButton({
  smartWalletClient,
  setStatusMessage,
  onTxSent,
}: {
  smartWalletClient: SmartWalletClient | undefined;
  setStatusMessage: (msg: string) => void;
  onTxSent?: (txHash: string) => void;
}) {
  const SBC_TOKEN_ADDRESS = '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16' as `0x${string}`;
  const decimals = 6;
  function encodeSbcTransfer(to: `0x${string}`, amount: string) {
    return encodeFunctionData({
      abi: [
        {
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'transfer',
      args: [to, BigInt(Math.floor(Number(amount) * 10 ** decimals))],
    });
  }
  return (
    <button
      className="cursor-pointer mt-4 rounded-full border border-solid border-green-400 text-green-700 transition-colors flex items-center justify-center hover:bg-green-50 hover:border-transparent font-medium text-sm px-6 py-2 w-full"
      disabled={!smartWalletClient}
      onClick={async () => {
        if (!smartWalletClient) {
          setStatusMessage('Smart wallet client not ready.');
          return;
        }
        try {
          const to = '0x124b082e8DF36258198da4Caa3B39c7dFa64D9cE' as `0x${string}`;
          const data = encodeSbcTransfer(to, '0.01');
          const txHash = await smartWalletClient.sendTransaction({
            to: SBC_TOKEN_ADDRESS,
            data,
          });
          setStatusMessage('Gasless transaction sent! Tx: ' + txHash);
          if (onTxSent) onTxSent(txHash);
        } catch (e) {
          setStatusMessage('Failed to send transaction.');
          console.error(e);
        }
      }}
    >
      Send Gasless Transaction
    </button>
  );
} 