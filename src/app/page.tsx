'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import { formatUnits, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useWallets, useSignTypedData } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { SignPermitButton } from '../components/SignPermitButton';
import { PermitAndTransferButton } from '../components/PermitAndTransferButton';
import { SendGaslessButton } from '../components/SendGaslessButton';
import { ERC20_ABI } from '../utils/erc20';

const SBC_TOKEN_ADDRESS = '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16' as `0x${string}`;

function formatSbc(balance: bigint | number | string, decimals: number = 18): string {
  return Number(formatUnits(BigInt(balance), decimals)).toFixed(3);
}

export default function Home() {
  const { ready, login, authenticated, user, linkWallet, unlinkWallet, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const linkedWallets = wallets.filter((wallet) => wallet.linked || wallet.connectorType === 'embedded' || wallet.connectorType === 'smart_wallet');
  const smartWalletAccount = user?.linkedAccounts?.find((account) => account.type === 'smart_wallet');
  const [sbcBalance, setSbcBalance] = useState<string | null>(null);
  const [smartWalletSbcBalance, setSmartWalletSbcBalance] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [txHistory, setTxHistory] = useState<string[]>([]);
  const { client: smartWalletClient } = useSmartWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { signTypedData } = useSignTypedData();

  const smartWallet = user?.linkedAccounts?.find((account) => account.type === 'smart_wallet');

  const [isSigningPermit, setIsSigningPermit] = useState(false);
  const [permitData, setPermitData] = useState<
    | {
        signature: string;
        owner: `0x${string}`;
        spender: `0x${string}`;
        value: bigint;
        deadline: bigint;
      }
    | null
  >(null);

  // Callback to add a new tx hash to history
  const addTxToHistory = useCallback((txHash: string) => {
    setTxHistory((prev) => [txHash, ...prev]);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletsReady || !authenticated || !wallets.length || !user?.wallet?.address) return;
      
      const wallet = linkedWallets[0];
      const address = wallet?.address as `0x${string}`;

      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });
      
      const decimals = await publicClient.readContract({
        address: SBC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
      });

      if (address) {
        const balance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        });
        setSbcBalance(formatSbc(balance as bigint, decimals as number));
      }

      if (smartWallet?.address) {
        const smartWalletBalance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [smartWallet.address as `0x${string}`],
        });
        setSmartWalletSbcBalance(formatSbc(smartWalletBalance as bigint, decimals as number));
      } else {
        setSmartWalletSbcBalance(null);
      }
    };
    fetchBalance();
  }, [walletsReady, authenticated, wallets, user?.wallet?.address, smartWallet?.address, linkedWallets]);

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
    <div className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] ${authenticated ? 'pt-4 sm:pt-8' : 'p-8'}`}>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-2xl">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Privy Demo</h1>
        </div>

        {statusMessage && (
          <div className="w-full mb-2 p-3 rounded bg-blue-100 text-blue-900 text-center font-medium border border-blue-200">
            {statusMessage}
          </div>
        )}

        {!authenticated ? (
          <div className="w-full text-center">
            
            <button
              onClick={login}
              className="cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto mx-auto"
            >
              Connect with Privy
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6">
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
                      <div className="flex flex-col">
                        <p className="font-mono text-sm">{wallet.address}</p>
                        {wallet.connectorType === 'smart_wallet' && (
                          <span className="text-xs text-blue-700">Smart Wallet</span>
                        )}
                      </div>
                      {wallet.connectorType !== 'smart_wallet' && (
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
                      )}
                    </div>
                  ))}
                  {smartWalletAccount && !linkedWallets.some(w => w.address === smartWalletAccount.address) && (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="font-mono text-sm">{smartWalletAccount.address}</p>
                        <span className="text-xs text-blue-700">Smart Wallet</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={async () => {
                  try {
                    linkWallet();
                    setStatusMessage('Wallet linking started. Complete the flow in the modal.');
                  } catch (e) {
                    console.error(e);
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
                <>
                  <p className="font-mono text-lg">
                    {sbcBalance === null ? 'Loading...' : `${sbcBalance} SBC (Base Sepolia, Embedded Wallet)`}
                  </p>
                  
                  {smartWalletSbcBalance !== null && (
                    <p className="font-mono text-lg text-blue-700">
                      {smartWalletSbcBalance} SBC (Base Sepolia, Smart Wallet)
                    </p>
                  )}

                  <div className='flex flex-col gap-2 hidden'>
                    <SignPermitButton
                      wallets={wallets}
                      setActiveWallet={setActiveWallet}
                      signTypedData={signTypedData}
                      setPermitData={setPermitData}
                      setStatusMessage={setStatusMessage}
                      isSigningPermit={isSigningPermit}
                      setIsSigningPermit={setIsSigningPermit}
                      sbcBalance={sbcBalance}
                    />
                    {permitData && (
                      <div className="mt-2 break-all text-xs text-purple-700">Signature: {permitData.signature}</div>
                    )}
                    
                    <PermitAndTransferButton
                      permitData={permitData}
                      smartWalletClient={smartWalletClient}
                      setStatusMessage={setStatusMessage}
                    />
                  </div>
                  

                  <SendGaslessButton
                    smartWalletClient={smartWalletClient}
                    setStatusMessage={setStatusMessage}
                    onTxSent={addTxToHistory}
                  />

                </>
              ) : (
                <p>Connect a wallet to view your SBC balance.</p>
              )}
            </div>

            {/* Transaction History */}
            {txHistory.length > 0 && (
              <div className="w-full mt-8">
                <h3 className="text-lg font-semibold mb-2">Gasless Transaction History</h3>
                <ul className="space-y-1">
                  {txHistory.map((tx, i) => (
                    <li key={tx} className="font-mono text-xs">
                      <a
                        href={`https://sepolia.basescan.org/tx/${tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {tx}
                      </a>
                      {i === 0 && <span className="ml-2 text-green-600">(most recent)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {authenticated && (
              <button
                onClick={async () => {
                  try {
                    await logout();
                    setStatusMessage('Logged out successfully.');
                  } catch (e) {
                    console.error(e);
                    setStatusMessage('Failed to log out.');
                  }
                }}
                className="fixed left-0 bottom-0 w-full p-4 bg-white dark:bg-black border-t border-red-200 dark:border-red-700 text-red-600 font-medium text-base z-50 cursor-pointer"
                style={{
                  paddingLeft: '2rem',
                  paddingRight: '2rem',
                  maxWidth: '100vw',
                }}
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </main>
      
    </div>
  );
}
