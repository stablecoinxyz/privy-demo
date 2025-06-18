'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from "next/image";
import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createWalletClient, custom, formatUnits, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Minimal ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

const SBC_TOKEN_ADDRESS = '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16';

export default function Home() {
  const { ready, login, authenticated, user, linkWallet, unlinkWallet, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const linkedWallets = wallets.filter((wallet) => wallet.linked || wallet.connectorType === 'embedded');
  const [sbcBalance, setSbcBalance] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [refreshWalletsKey, setRefreshWalletsKey] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletsReady || !authenticated || !wallets.length || !user?.wallet?.address) return;
      
      const wallet = wallets[0];
      const address = wallet.address as `0x${string}`;
      console.log(`Fetching balance for ${address}`);

      // Use public client for readContract
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });
      // Get decimals
      const decimals = await publicClient.readContract({
        address: SBC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
      });
      // Get balance
      const balance = await publicClient.readContract({
        address: SBC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      setSbcBalance(Number(formatUnits(balance as bigint, decimals as number)).toFixed(3));
    };
    fetchBalance();
  }, [walletsReady, authenticated, wallets, user?.wallet?.address, refreshWalletsKey]);

  useEffect(() => {
    if (statusMessage) {
      const timeout = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [statusMessage]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-2xl">

        {statusMessage && (
          <div className="w-full mb-2 p-3 rounded bg-blue-100 text-blue-900 text-center font-medium border border-blue-200">
            {statusMessage}
          </div>
        )}

        {!authenticated ? (
          <div className="w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Privy Demo</h1>
            <button
              onClick={login}
              className="cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto mx-auto"
            >
              Connect with Privy
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold mb-4">Privy Demo</h1>
            {/* <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">User Profile</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email?.address || 'Not set'}</p>
                <p><strong>Telegram:</strong> {user?.telegram?.username || 'Not set'}</p>
              </div>
            </div> */}

            <div className="bg-white/5 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Linked Wallets</h2>
              </div>
              {linkedWallets.length === 0 ? (
                <p>No wallets connected</p>
              ) : (
                <div className="space-y-2">
                  {linkedWallets.map((wallet) => (
                    <div key={wallet.address} className="flex items-center justify-between">
                      <p className="font-mono text-sm">{wallet.address}</p>
                      <button
                        onClick={async () => {
                          try {
                            await unlinkWallet(wallet.address);
                            setStatusMessage('Wallet unlinked successfully.');
                          } catch (e) {
                            console.error(e);
                            setStatusMessage('Failed to unlink wallet.');
                          }
                        }}
                        className="cursor-pointer text-red-500 hover:text-red-600 text-sm"
                      >
                        Unlink
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={async () => {
                  try {
                    linkWallet();
                    setStatusMessage('Wallet linking started. Complete the flow in the modal.');
                  } catch (e) {
                    setStatusMessage('Failed to link wallet.');
                  }
                }}
                className="cursor-pointer mt-4 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm px-4 py-2"
              >
                Link New Wallet
              </button>
            </div>

            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">SBC Balance</h2>
              {user?.wallet?.address ? (
                <p className="font-mono text-lg">
                  {sbcBalance === null ? 'Loading...' : `${sbcBalance} SBC (Base Sepolia)`}
                </p>
              ) : (
                <p>Connect a wallet to view your SBC balance.</p>
              )}
            </div>

            {authenticated && (
              <button
                onClick={async () => {
                  try {
                    await logout();
                    setStatusMessage('Logged out successfully.');
                  } catch (e) {
                    setStatusMessage('Failed to log out.');
                  }
                }}
                className="cursor-pointer mt-6 rounded-full border border-solid border-red-400 text-red-600 transition-colors flex items-center justify-center hover:bg-red-50 hover:border-transparent font-medium text-sm px-6 py-2 w-full"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
