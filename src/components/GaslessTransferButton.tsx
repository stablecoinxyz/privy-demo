import React, { useState } from 'react';
import { encodeFunctionData } from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { SBC_TOKEN_ADDRESS, SBC_DECIMALS, DEMO_AMOUNT } from '../constants';

function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function GaslessTransferButton({
  onTxSent,
  setStatusMessage,
}: {
  onTxSent?: (txHash: string) => void;
  setStatusMessage: (msg: string) => void;
}) {
  const { client: smartWalletClient } = useSmartWallets();
  const [recipient, setRecipient] = useState<`0x${string}`|''>('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleTransfer = async () => {
    setError(null);
    if (!isValidAddress(recipient)) {
      setError('Please enter a valid Ethereum address.');
      return;
    }
    if (!smartWalletClient) {
      setStatusMessage('Smart wallet not ready.');
      return;
    }
    setIsSending(true);
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
        args: [recipient, BigInt(Number(DEMO_AMOUNT) * 10 ** SBC_DECIMALS)],
      });
      const txHash = await smartWalletClient.sendTransaction({
        to: SBC_TOKEN_ADDRESS,
        data,
      });
      setStatusMessage(`Gasless transfer successful! Tx: ${txHash}`);
      onTxSent?.(txHash);
      setRecipient('');
    } catch (error) {
      console.error(error);
      setStatusMessage('Transfer failed. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="recipient-address">
        Recipient Address
      </label>
      <input
        id="recipient-address"
        type="text"
        value={recipient}
        onChange={e => setRecipient(e.target.value as `0x${string}`)}
        placeholder="0x..."
        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm bg-white text-gray-900"
        autoComplete="off"
        spellCheck={false}
        maxLength={42}
      />
      {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
      <button
        onClick={handleTransfer}
        disabled={!smartWalletClient || isSending}
        className="w-full mt-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors cursor-pointer"
      >
        <div className="text-center">
          <div>Send Gasless Transfer ({DEMO_AMOUNT} SBC)</div>
          {recipient && isValidAddress(recipient) && (
            <div className="font-mono text-sm mt-1">{recipient.slice(0, 8)}...{recipient.slice(-6)}</div>
          )}
        </div>
      </button>
    </div>
  );
} 