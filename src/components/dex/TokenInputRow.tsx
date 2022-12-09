import { FaAngleDown } from 'react-icons/fa';
import { Side, TokenPair } from '../../pages/Dex';

type Props = {
  side: Side;
  toggleModal: (side: Side) => void;
  pair: TokenPair;
  valueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // value: string | number;
};

export const TokenInputRow = ({
  side,
  // value,
  toggleModal,
  pair,
  valueChange,
}: Props) => {
  let content;
  if ((side === 'buy' && !pair.buy) || (side === 'sell' && !pair.sell)) {
    content = (
      <>
        <span>Select token</span>
        <FaAngleDown />
      </>
    );
  } else {
    content = (
      <>
        <img
          src={side === 'sell' ? pair.sell?.logoURI : pair.buy?.logoURI}
          alt=''
          className='h-6'
        />
        <span>{side === 'sell' ? pair.sell?.symbol : pair.buy?.symbol}</span>
        <div className='w-full'>
          <FaAngleDown />
        </div>
      </>
    );
  }

  return (
    <div className='w-full flex justify-between items-center rounded-lg bg-slate-500 mb-1 '>
      <label htmlFor={side} />
      <input
        name={side}
        type='number'
        onChange={valueChange}
        // {side === 'sell' ? value={value} : value={value}}
        // value={side === 'buy' ? value : 0}
        // value={value}
        min={0}
        step={0.1}
        placeholder='0'
        className='input-number w-full bg-transparent text-3xl p-4  rounded-md'
      />

      <button
        type='button' // important to prevent form submission and navigation
        onClick={() => toggleModal(side)}
        className='rounded-2xl font-medium bg-slate-400 p-2 mr-2 whitespace-nowrap px-4 hover:bg-slate-800'>
        <div className='w-full flex gap-2 items-center justify-center '>{content}</div>
      </button>
    </div>
  );
};
