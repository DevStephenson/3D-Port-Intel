import logo from './logo.svg';
import './App.css';
import { Typography } from '@material-ui/core';
import Globe from './Globe';
import { FiMenu } from 'react-icons/fi';

function App() {



  return (
    <div className="App">
      <header className="App-header">
        <Typography variant="h4">Port Intel </Typography>
        <FiMenu/>
      </header>
      <Globe/>
    </div>
  );
}

export default App;
