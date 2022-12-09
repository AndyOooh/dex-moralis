import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { MdOutlineInfo, MdOutlineSwapVert } from 'react-icons/md';

import { SwapModal } from '../components/dex/SwapModal';
import { Modal } from '../components/ui/modal/Modal';
import { TokenInputRow } from '../components/dex/TokenInputRow';
import { FaAngleDown } from 'react-icons/fa';

import erc20Abi from '../assets/erc20abi.json';
import { BigNumber, ethers } from 'ethers';
import axios from 'axios';
import { goerliTokenAddresses } from '../assets/goerliTokenAddresses';

import Web3 from 'web3';

export type Token = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
};

export type TokenPair = {
  sell: Token | null;
  buy: Token | null;
};

export type Side = 'sell' | 'buy';

export const Dex = () => {
  const web3 = new Web3(Web3.givenProvider);
  const { web3: web3Moralis, account, chainId, Moralis } = useMoralis();
  const initialPair = {
    sell: {
      address: '0x0000000000000000000000000000000000000000',
      // chainId: chainId === '5' ? 5 : 1,
      chainId: 1,
      // chainId: 5,
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
      name: 'Ethereum',
      symbol: 'ETH',
    },
    buy: null,
  };
  const [currentPair, setCurrentPair] = useState<TokenPair>(initialPair);
  console.log('🚀  file: Dex.tsx:38  currentPair', currentPair);
  const [side, setSide] = useState<Side>('sell');
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formValue, setFormValue] = useState(0);
  const [pairPrice, setPairPrice] = useState<any>(null);

  const baseUrl =
    Number(chainId) === 1
      ? 'https://api.0x.org'
      : Number(chainId) === 5
      ? 'https://goerli.api.0x.org'
      : null;

  // const baseUrl = 'https://api.0x.org';

  const fetchTokens = useCallback(async () => {
    console.log('fetching tokesn');
    let result: any;
    const fetchMainnetTokens = async () => {
      console.log('fetching mainnet tokesn');
      const response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
      result = await response.json();
    };
    const fetchGoerliTokens = async () => {
      result = await import('../assets/goerli-tokens.json');
    };
    Number(chainId) === 5 ? await fetchGoerliTokens() : await fetchMainnetTokens();
    setTokenList(result?.tokens);
  }, [chainId]);

  // useEffect(() => {
  //   fetchTokens();
  // }, [fetchTokens]);

  const getPrice = useCallback(
    async (value?: number) => {
      if (!currentPair.sell || !currentPair.buy) return;
      const valueToSend = value ? value : formValue;
      if (valueToSend === 0) return;

      const endpoint = '/swap/v1/price';
      const sellOrBuy: string = side === 'sell' ? 'sellAmount' : 'buyAmount';
      const { sell: sellToken, buy: buyToken } = currentPair;
      const params = {
        // sellToken: sellToken.address,
        sellToken: sellToken.symbol,

        buyToken: buyToken.address,

        [sellOrBuy]: (Number(valueToSend) * 10 ** sellToken.decimals).toString(),
      };

      try {
        const response = await fetch(`${baseUrl}${endpoint}?${new URLSearchParams(params)}`);
        const result = await response.json();
        setPairPrice(result);
      } catch (error) {
        console.log(error);
      }
    },
    [currentPair, formValue, side, baseUrl]
  );

  useEffect(() => {
    getPrice();
  }, [currentPair, formValue, getPrice]);

  const handleSwap = async () => {
    console.log('handleSwap: Getting Quote');
    if (!account) return;
    if (!currentPair.sell || !currentPair.buy) return;

    const getQuote = async () => {
      // if (!currentPair.sell || !currentPair.buy || !account) return;
      const endpoint = '/swap/v1/quote';
      const { sell: sellToken, buy: buyToken } = currentPair;
      if (!sellToken || !buyToken) return;
      const sellOrBuy: string = side === 'sell' ? 'sellAmount' : 'buyAmount';

      const amount = (Number(formValue) * 10 ** sellToken.decimals).toString();

      console.log('amount', amount, typeof amount);

      const params = {
        // sellToken: sellToken?.address,
        sellToken: sellToken?.symbol,
        buyToken: buyToken?.address,
        // buyToken: buyToken?.symbol,
        // sellAmount: (Number(formValue) * 10 ** sellToken.decimals).toString(),
        [sellOrBuy]: (Number(formValue) * 10 ** sellToken.decimals).toString(),
        takerAddress: account,
      };
      console.log('🚀  file: Dex.tsx:129  params', params);
      try {
        const response = await fetch(`${baseUrl}${endpoint}?${new URLSearchParams(params)}`);
        const result = await response.json();
        // setPairPrice(result);
        return result;
      } catch (error) {
        console.log(error);
      }
    };

    const fromTokenAddress = currentPair.sell.address;
    const approvalAmountBn = ethers.BigNumber.from('2').pow('256').sub('1');
    const signer = web3Moralis?.getSigner();
    const erc20TokenContract = new ethers.Contract(fromTokenAddress, erc20Abi, signer);
    console.log('🚀  file: Dex.tsx:134  erc20TokenContract', erc20TokenContract);

    const quote = await getQuote();
    console.log('🚀  file: Dex.tsx:132  swapQuoteJSON', quote);

    // Grant the allowance target an allowance to spend our tokens.
    const txApproval = await erc20TokenContract.approve(
      erc20TokenContract.address,
      approvalAmountBn
    );
    console.log('🚀  file: Dex.tsx:165  txApproval', txApproval);

    // Perform the swap
    try {
      const params = {
        from: quote.from,
        to: quote.to,
        data: quote.data,
        value: quote.value,
        gasPrice: quote.gasPrice,
      };
      // const receipt = await web3Moralis?.sendTransaction(JSON.stringify(params));
      // const receipt = await web3Moralis?.sendTransaction(params);

      const receipt = await web3.eth.sendTransaction(quote); // This works
      console.log('🚀  file: Dex.tsx:183  receipt', receipt);
    } catch (error) {
      console.log(error);
    }
    // My dex is up and running. I'm not in love with the implementation though. In the end I mixed in web3js with ethers and useMoralis.
  };

  const handleFlipBuySell = () => {
    setCurrentPair((prev: TokenPair) => ({
      sell: prev.buy,
      buy: prev.sell,
    }));
  };

  const handleToggleModal = async (side: Side) => {
    await fetchTokens();
    setSide(side);
    setModalVisible(prev => !prev);
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>, side: Side) => {
    const value = Number(e.target.value);
    // const value = ethers.utils.parseUnits(e.target.value, currentPair[side]?.decimals);
    setSide(side);
    setFormValue(value);
    if (value > 0) {
      getPrice(value);
    } else {
      setPairPrice(null);
    }
  };

  return (
    <>
      <Modal visible={modalVisible} setVisible={setModalVisible}>
        <SwapModal
          side={side}
          tokens={tokenList}
          setPair={setCurrentPair}
          setModalVisible={setModalVisible}
        />
      </Modal>
      <section className='rounded-3xl bg-slate-900 even-shadow p-4'>
        {/* {errorMessage && <p className='text-red-500'>{errorMessage}</p>} */}
        <h1 className='text-2xl text-gray-300 mb-4'>Swap tokens</h1>
        <form action='' className='flex flex-col justify-center items-center gap-4'>
          <div className='w-full relative'>
            <TokenInputRow
              side='sell'
              // value={formValue} // fix this
              toggleModal={handleToggleModal}
              pair={currentPair}
              valueChange={e => handleValueChange(e, 'sell')}
              // handleBlur={getPrice}
            />
            <div className='flip-button' onClick={handleFlipBuySell}>
              <MdOutlineSwapVert size='2rem' />
            </div>
            <TokenInputRow
              side='buy'
              // value={pairPrice.buyAmount ? pairPrice?.buyAmount / 10 ** currentPair?.buy?.decimals : 0}
              toggleModal={handleToggleModal}
              pair={currentPair}
              valueChange={e => handleValueChange(e, 'buy')}
              // handleBlur={getPrice}
            />
            {pairPrice && (
              <div className='w-full flex justify-between items-center rounded-lg bg-slate-500 mb-1 px-4 py-2'>
                <div className='flex gap-2 items-center'>
                  <MdOutlineInfo />
                  <p>
                    1 {currentPair.sell?.symbol} = {Number(pairPrice?.price).toPrecision(4)}{' '}
                    {currentPair.buy?.symbol}
                  </p>
                </div>
                <p>Estimated gas: {pairPrice.estimatedGas} </p>
                <FaAngleDown />
              </div>
            )}
          </div>
          <button
            type='button'
            onClick={handleSwap}
            className='w-full text-slate-900 text-2xl font-semibold rounded-lg bg-slate-400 p-4'>
            Swap
          </button>
          {currentPair.buy && (
            <>
              <p>decimals: {currentPair.buy?.decimals} </p>
              <p>
                amount bought:{' '}
                {(pairPrice?.buyAmount / 10 ** currentPair.buy?.decimals).toPrecision(4)}{' '}
              </p>
            </>
          )}
        </form>
      </section>
    </>
  );
};
