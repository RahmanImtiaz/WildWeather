import logo from './logo.svg';
import './App.css';
import './light.css'; // Import the theme CSS
import Weather from './Weather';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from "react-chartjs-2";

function App() {
  return (
    <div className="App">
      <h1>Wild Weather</h1>
      <Weather />
    </div>
  );
}

export default App;
