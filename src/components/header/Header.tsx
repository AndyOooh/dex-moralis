import './Header.scss';
import { Navbar } from './Navbar';
import { ConnectButton } from './ConnectButton';
import { Logo } from '../Logo';


export const Header = () => {
  return (
    <header className='header'>
      <Logo />
      <Navbar />
      <ConnectButton />
    </header>
  );
};
