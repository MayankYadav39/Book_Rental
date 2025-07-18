import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import React from 'react'

const ConnectBtn = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {!connected ? (
              <button
                className="bg-transparent border border-gray-300 hover:bg-blue-600
                           py-2 px-6 text-black hover:text-white rounded-full
                           transition duration-300 ease-in-out"
                onClick={openConnectModal}
                type="button"
              >
                Connect to BookRental
              </button>
            ) : chain.unsupported ? (
              <button
                className="bg-transparent border border-gray-300 hover:bg-yellow-600
                           py-2 px-6 text-black hover:text-white rounded-full
                           transition duration-300 ease-in-out"
                onClick={openChainModal}
                type="button"
              >
                Wrong network
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={openChainModal}
                  className="flex items-center bg-transparent border border-gray-300
                             py-2 px-6 rounded-full hover:bg-blue-600 hover:text-white
                             transition duration-300 ease-in-out"
                  type="button"
                >
                  {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        overflow: 'hidden',
                        marginRight: 4,
                      }}
                    >
                      {chain.iconUrl && (
                        <Image
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          width={12}
                          height={12}
                        />
                      )}
                    </div>
                  )}
                  <span>{chain.name}</span>
                </button>

                <button
                  className="bg-transparent border border-gray-300 hover:bg-blue-600
                             py-2 px-6 text-black hover:text-white rounded-full
                             transition duration-300 ease-in-out"
                  onClick={openAccountModal}
                  type="button"
                >
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default ConnectBtn
