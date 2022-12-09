import React from 'react';

import chipPng from '../assets/chip.png';

export const Logo = () => {
  return (
    <div className='h-full'>
      <img src={chipPng} alt='logo' className='h-full' />
    </div>
  );
};
