import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Creditcoin Testnet
export const creditcoinTestnet = defineChain({
  id: 102031, // Creditcoin Testnet chain ID
  name: 'Creditcoin Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Creditcoin',
    symbol: 'CTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.cc3-testnet.creditcoin.network'],
      webSocket: ['wss://rpc.cc3-testnet.creditcoin.network'],
    },
    public: {
      http: ['https://rpc.cc3-testnet.creditcoin.network'],
      webSocket: ['wss://rpc.cc3-testnet.creditcoin.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Creditcoin Explorer',
      url: 'https://creditcoin-testnet.blockscout.com',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'MoonCreditFi',
  projectId: 'd48baa2d98ba9f2173325f9152b48925',
  chains: [creditcoinTestnet, mainnet, sepolia, polygon, optimism, arbitrum, base],
  ssr: false,
});
