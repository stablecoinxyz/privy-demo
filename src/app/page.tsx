'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from "next/image";

export default function Home() {
  const { ready, login, authenticated, user, linkWallet, unlinkWallet } = usePrivy();

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
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {!authenticated ? (
          <div className="w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Privy Demo</h1>
            <button
              onClick={login}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto mx-auto"
            >
              Connect with Privy
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">User Profile</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email?.address || 'Not set'}</p>
                <p><strong>Telegram:</strong> {user?.telegram?.username || 'Not set'}</p>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Connected Wallets</h2>
              {user?.wallet?.address === null ? (
                <p>No wallets connected</p>
              ) : (
                <div className="space-y-2">
                  <div key={user?.wallet?.address} className="flex items-center justify-between">
                    <p className="font-mono text-sm">{user?.wallet?.address}</p>
                      <button
                        onClick={() => unlinkWallet(user?.wallet?.address || '')}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Disconnect
                      </button>
                    </div>
                </div>
              )}
              <button
                onClick={linkWallet}
                className="mt-4 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm px-4 py-2"
              >
                Link New Wallet
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
