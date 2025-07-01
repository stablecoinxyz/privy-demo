import React from 'react';
import { encodeFunctionData } from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { SBC_TOKEN_ADDRESS, SBC_DECIMALS, DEMO_RECIPIENT, DEMO_AMOUNT } from '../constants';

export function GaslessTransferButton({
  onTxSent,
  setStatusMessage,
}: {
  onTxSent?: (txHash: string) => void;
  setStatusMessage: (msg: string) => void;
}) {
  const { client: smartWalletClient } = useSmartWallets();

  const handleTransfer = async () => {
    if (!smartWalletClient) {
      setStatusMessage('Smart wallet not ready.');
      return;
    }

    try {
      const data = encodeFunctionData({
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
        args: [DEMO_RECIPIENT, BigInt(Number(DEMO_AMOUNT) * 10 ** SBC_DECIMALS)],
      });

      const txHash = await smartWalletClient.sendTransaction({
        to: SBC_TOKEN_ADDRESS,
        data,
      });

      setStatusMessage(`Gasless transfer successful! Tx: ${txHash}`);
      onTxSent?.(txHash);
    } catch (error) {
      console.error(error);
      setStatusMessage('Transfer failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handleTransfer}
      disabled={!smartWalletClient}
      className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors cursor-pointer"
    >
      <div className="text-center">
        <div>Send Gasless Transfer ({DEMO_AMOUNT} SBC) to</div>
        <div className="font-mono text-sm mt-1">{DEMO_RECIPIENT.slice(0, 8)}...{DEMO_RECIPIENT.slice(-6)}</div>
      </div>
    </button>
  );
} 