// pages/_app.jsx
import React, { useEffect, useState } from 'react'
import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import '@rainbow-me/rainbowkit/styles.css'
import 'react-datepicker/dist/react-datepicker.css'

import { ToastContainer } from 'react-toastify'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/store'

import Providers from '@/services/provider'
import { Header, Footer } from '@/components'

import {
  WagmiConfig,
  configureChains,
  createConfig,
} from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  trustWallet,
  coinbaseWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'

// Hardcoded keys (do not change)
const projectId = 'd2ffa01c008500d6afe678d98855acf5'
const alchemyApiKey = 'BV7PBXkB8tCfouhGLJkVGfzfolzH30zm'

// Define Ganache local chain
const ganache = {
  id: 1337,
  name: 'Ganache',
  network: 'ganache',
  nativeCurrency: { decimals: 18, name: 'Ethereum', symbol: 'ETH' },
  rpcUrls: {
    public: { http: ['http://localhost:8545'] },
    default: { http: ['http://localhost:8545'] },
  },
}

// (Optional) your custom chain
const bitfinity = {
  id: 355113,
  name: 'Bitfinity',
  network: 'bitfinity',
  nativeCurrency: { decimals: 18, name: 'Bitfinity', symbol: 'BFT' },
  rpcUrls: {
    public: { http: ['https://rpc.bitfinity.network'] },
    default: { http: ['https://rpc.bitfinity.network'] },
  },
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, ganache, bitfinity],
  [
    alchemyProvider({ apiKey: alchemyApiKey }),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === ganache.id) {
          return { http: 'http://localhost:8545' }
        }
        return null
      },
    }),
    publicProvider(),
  ]
)

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains, projectId }),
      trustWallet({ chains, projectId }),
      coinbaseWallet({ chains, appName: 'YourAppName' }),
      rainbowWallet({ chains, projectId }),
      walletConnectWallet({ chains, projectId }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export default function App({ Component, pageProps }) {
  const [showChild, setShowChild] = useState(false)

  useEffect(() => {
    setShowChild(true)
  }, [])

  if (!showChild || typeof window === 'undefined') {
    return null
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Providers pageProps={pageProps}>
          <ReduxProvider store={store}>
            <div className="relative h-screen min-w-screen">
              <Header />
              <Component {...pageProps} />
              <div className="h-20" />
              {/* <Footer /> */}
            </div>
            <ToastContainer
              position="bottom-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </ReduxProvider>
        </Providers>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}