import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';

export const ConnectButton = () => {
  const { web3, isWeb3Enabled, enableWeb3, account, network, chainId, environment, provider } =
    useMoralis();

  const [showChainDropdown, setShowChainDropdown] = useState(false);
  // console.log('🚀  file: ConnectButton.tsx:6  provider', provider)
  // console.log('🚀  file: ConnectButton.tsx:6  environment', environment)
  // console.log('🚀  file: ConnectButton.tsx:6  chainId', chainId)
  // console.log('🚀  file: ConnectButton.tsx:6  network', network)

  // const { chainId } = web3;
  const name = web3?._network?.name;
  const networkString = name ? name.charAt(0).toUpperCase() + name.slice(1) : null;

  const getStuff = async () => {
    if (!account) return
    const avatar = await web3?.getAvatar(account)
    console.log('🚀  file: ConnectButton.tsx:21  avatar', avatar)
    const netw = await  web3?.getNetwork()
    console.log('🚀  file: ConnectButton.tsx:23  netw', netw)

  }

  getStuff()

  // console.log('web33333333333333333333333333333333', account && web3?.getAvatar(account), web3?.getNetwork(),  );

  useEffect(() => {}, [isWeb3Enabled]);

  const handleConnect = async () => {
    try {
      await enableWeb3();
      // window.localStorage.setItem('connection', web3?.connection.url)
    } catch (error) {
      console.log(error);
    }
  };

  const toggleChainDropdown = () => {
    setShowChainDropdown(prev => !prev);
  };

  const accountString = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect';
  return (
    <div className='flex gap-4'>
      <button onClick={toggleChainDropdown}>{networkString}</button>
      <button onClick={handleConnect}>{accountString}</button>
    </div>
  );
};
