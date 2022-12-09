import { useMoralis } from 'react-moralis';
import { Route, Routes } from 'react-router-dom';
import { Header } from './components/header/Header';
import { Casino } from './pages/casino/Casino';
import { Dex } from './pages/Dex';

function App() {
  const { chainId: chainHex, account, network,  } = useMoralis();
  const chainId = Number(chainHex);
  return (
    <div className='app'>
      <Header />
      {/* {account && chainId !== 5 ? (
        <div className='h-full flex justify-center items-center'>Please change to Goerli network</div>
      ) : ( */}
        <main className='main'>
          <Routes>
            <Route path='/' element={<Dex />} />
            <Route path='/casino/*' element={<Casino />} />
          </Routes>
        </main>
      {/* )} */}
    </div>
  );
}

export default App;
