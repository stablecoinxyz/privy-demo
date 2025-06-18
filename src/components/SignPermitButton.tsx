import React from 'react';
import { signPermitForSmartWallet } from '../utils/permit';
import { ConnectedWallet } from '@privy-io/react-auth';

export function SignPermitButton({
  wallets,
  setActiveWallet,
  signTypedData,
  setPermitData,
  setStatusMessage,
  isSigningPermit,
  setIsSigningPermit,
  sbcBalance,
}: {
  wallets: ConnectedWallet[];
  setActiveWallet: (wallet: ConnectedWallet) => Promise<void>;
  signTypedData: any;
  setPermitData: (data: any) => void;
  setStatusMessage: (msg: string) => void;
  isSigningPermit: boolean;
  setIsSigningPermit: (b: boolean) => void;
  sbcBalance: string | null;
}) {
  const SBC_TOKEN_ADDRESS = '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16' as `0x${string}`;
  return (
    <button
      className="cursor-pointer mt-4 rounded-full border border-solid border-purple-400 text-purple-700 transition-colors flex items-center justify-center hover:bg-purple-50 hover:border-transparent font-medium text-sm px-6 py-2 w-full disabled:opacity-50"
      disabled={isSigningPermit || !sbcBalance || Number(sbcBalance) <= 0}
      onClick={async () => {
        setIsSigningPermit(true);
        setPermitData(null);
        try {
          // Find embedded and smart wallet addresses
          const embeddedWallet = wallets.find(w => w.connectorType === 'embedded');
          const smartWallet = wallets.find(w => w.connectorType === 'smart_wallet');
          if (!embeddedWallet || !smartWallet) {
            setStatusMessage('Embedded or smart wallet not found.');
            return;
          }
          await setActiveWallet(embeddedWallet);
          setStatusMessage('Embedded wallet set as active for signing.');
          const permit = await signPermitForSmartWallet({
            owner: embeddedWallet.address as `0x${string}`,
            spender: smartWallet.address as `0x${string}`,
            token: SBC_TOKEN_ADDRESS,
            signTypedData,
          });
          setPermitData(permit);
          setStatusMessage('Permit signed!');
          console.log('Permit signature:', permit.signature);
        } catch (e) {
          setStatusMessage('Failed to sign permit.');
          console.error(e);
        } finally {
          setIsSigningPermit(false);
        }
      }}
    >
      {isSigningPermit ? 'Signing Permit...' : 'Sign Permit for Smart Wallet to Transfer All SBC'}
    </button>
  );
} 