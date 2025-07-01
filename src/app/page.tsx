'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useWallets } from '@privy-io/react-auth';
import { GaslessTransferButton } from '../components/GaslessTransferButton';
import { ERC20_ABI } from '../utils/erc20';
import { formatSbc } from '../utils/format';
import { SBC_TOKEN_ADDRESS } from '../constants';

export default function Home() {
  const { ready, login, authenticated, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [embeddedBalance, setEmbeddedBalance] = useState<string | null>(null);
  const [smartWalletBalance, setSmartWalletBalance] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [txHistory, setTxHistory] = useState<string[]>([]);

  // Get wallets with better detection
  const embeddedWallet = wallets.find(w => w.connectorType === 'embedded');
  const smartWalletFromWallets = wallets.find(w => w.connectorType === 'smart_wallet');
  const smartWalletFromUser = user?.linkedAccounts?.find(account => account.type === 'smart_wallet');
  
  // Use smart wallet from either source
  const smartWallet = smartWalletFromWallets || smartWalletFromUser;

  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!authenticated) return;

      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      try {
        // Embedded wallet balance
        if (embeddedWallet?.address) {
          const balance = await publicClient.readContract({
            address: SBC_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [embeddedWallet.address],
          });
          setEmbeddedBalance(formatSbc(balance as bigint));
        }

        // Smart wallet balance
        if (smartWallet?.address) {
          const smartBalance = await publicClient.readContract({
            address: SBC_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [smartWallet.address],
          });
          setSmartWalletBalance(formatSbc(smartBalance as bigint));
        }
      } catch (error) {
        console.error('Failed to fetch balances:', error);
        setStatusMessage('Failed to fetch wallet balances');
      }
    };

    fetchBalances();
  }, [authenticated, embeddedWallet?.address, smartWallet?.address]);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timeout = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [statusMessage]);

  const addTxToHistory = (txHash: string) => {
    setTxHistory(prev => [txHash, ...prev]);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

      return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 text-gray-900">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Privy + SBC Paymaster Demo</h1>
        
        {statusMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-center">
            {statusMessage}
          </div>
        )}

        {!authenticated ? (
          <div className="text-center">
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-xl mb-4 text-gray-900">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">Connect with Privy to start using gasless transactions</p>
              <button
                onClick={login}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Connect with Privy
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Wallet Information</h2>
              
              {/* Embedded Wallet */}
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-800">Embedded Wallet</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Regular Transactions</span>
                </div>
                {embeddedWallet?.address ? (
                  <>
                    <p className="font-mono text-sm text-gray-800 mb-1">{embeddedWallet.address}</p>
                    <p className="text-lg font-bold text-green-600">
                      Balance: {embeddedBalance !== null ? `${embeddedBalance} SBC` : 'Loading...'}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">Not connected</p>
                )}
              </div>

              {/* Smart Wallet */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-800">Smart Wallet</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Gasless Transactions</span>
                </div>
                {smartWallet?.address ? (
                  <>
                    <p className="font-mono text-sm text-gray-800 mb-1">{smartWallet.address}</p>
                    <p className="text-lg font-bold text-blue-600">
                      Balance: {smartWalletBalance !== null ? `${smartWalletBalance} SBC` : 'Loading...'}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">Creating smart wallet...</p>
                )}
              </div>

              {/* Debug info for troubleshooting */}
              {/* {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <p><strong>Debug:</strong> Found {wallets.length} wallets</p>
                  <p>Wallet types: {wallets.map(w => w.connectorType).join(', ')}</p>
                  {user?.linkedAccounts && (
                    <p>Linked accounts: {user.linkedAccounts.map(a => a.type).join(', ')}</p>
                  )}
                </div>
              )} */}
            </div>

                        {/* Gasless Transfer */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Gasless Transfer</h2>
              <p className="text-gray-600 mb-4">
                Send SBC tokens without paying gas fees using SBC&apos;s paymaster
              </p>
              
              <GaslessTransferButton
                onTxSent={addTxToHistory}
                setStatusMessage={setStatusMessage}
              />
            </div>

            {/* Transaction History */}
            {txHistory.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Transaction History</h2>
                <div className="space-y-2">
                  {txHistory.map((tx, index) => (
                    <div key={tx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <a
                        href={`https://sepolia.basescan.org/tx/${tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:underline truncate flex-1 mr-4 cursor-pointer"
                      >
                        {tx}
                      </a>
                      {index === 0 && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Latest
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="text-center">
              <button
                onClick={logout}
                className="px-6 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
