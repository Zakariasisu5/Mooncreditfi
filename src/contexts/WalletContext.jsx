import { createContext, useContext, useEffect, useRef } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';
import { useNotifications } from './NotificationContext';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
  });
  const { disconnect } = useDisconnect();
  const { addNotification } = useNotifications();
  
  const prevConnected = useRef(isConnected);

  useEffect(() => {
    // Only trigger notification on actual connection change
    if (prevConnected.current !== isConnected) {
      if (isConnected && address) {
        addNotification(
          `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
          'success'
        );
      } else if (prevConnected.current && !isConnected) {
        addNotification('Wallet disconnected', 'info');
      }
      prevConnected.current = isConnected;
    }
  }, [isConnected, address, addNotification]);

  const balance = balanceData 
    ? parseFloat(formatEther(balanceData.value)).toFixed(4)
    : '0';

  const wallet = {
    account: address,
    balance,
    isConnected,
    isConnecting,
    disconnectWallet: disconnect,
  };
  
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
};
