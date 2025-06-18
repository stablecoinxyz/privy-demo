'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { baseSepolia } from 'viem/chains';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient once outside the component
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
      }}
    >
      <SmartWalletsProvider
        config={{
            paymasterContext: {
                mode: 'SPONSORED',
                calculateGasLimits: true,
                expiryDuration: 3600,
                sponsorshipInfo: {
                    webhookData: {},
                    smartAccountInfo: {
                        name: 'SBC Gasless',
                        version: '1.0.0',
                        description: 'SBC',
                        icon: 'https://swap.stablecoin.xyz/nav-sbc-logo.svg',
                        website: 'https://stablecoin.xyz',
                        email: 'support@stablecoin.xyz',
                        twitter: 'https://twitter.com/stablecoin_xyz',
                    }
                }
            }
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider
            config={createConfig({
              chains: [baseSepolia],
              transports: { [baseSepolia.id]: http() },
            })}
          >
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
} 