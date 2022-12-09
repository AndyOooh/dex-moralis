import React from 'react';
import { NavLink } from 'react-router-dom';

import './Navbar.scss';

export const Navbar = () => {
  return (
    <nav className='nav'>
      <ul className='nav-list'>
        <li>
          <NavLink to={'/'}>Dex</NavLink>
        </li>
        <li>
          <NavLink to='/casino'>Casino</NavLink>
        </li>
      </ul>
    </nav>
  );
};
