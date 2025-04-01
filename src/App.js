import logo from './logo.svg';
import './styles/App.css';
import './styles/mobile.css';
import './styles/light.css'; // Import the theme CSS
import Weather from './Weather';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from "react-chartjs-2";

function App() {
  return (
    <div className="App">
      <Weather />
    </div>
  );
}

export default App;
