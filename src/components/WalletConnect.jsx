import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';

const WalletConnect = ({ onConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const userAddress = accounts[0];
      
      setAddress(userAddress);
      setIsConnected(true);
      
      if (onConnect) {
        onConnect(userAddress);
      }
      
      // Optional: Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length > 0) {
          setAddress(newAccounts[0]);
        } else {
          handleDisconnect();
        }
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Connection failed: ' + error.message);
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    setIsConnected(false);
    // Optional: Remove listeners if needed
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} className="btn-mooncreditfi">
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
};

export default WalletConnect;