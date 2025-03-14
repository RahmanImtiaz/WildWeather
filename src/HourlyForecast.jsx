import {useState} from 'react';
import {Line} from "react-chartjs-2";


const HourlyForecast = ({hourlyData}) => {
    // Format hourly data for display
    const next24Hours = hourlyData.slice(0, 24);

    // Array for time values
    const timeArray = next24Hours.map((hour) => (new Date(hour.dt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })))

    // Dataset JSON for each data to be parsed into graph
    const chartDatasets = {
        temperature: {
            labels: timeArray,
            datasets: [
                {
                    label: "Temperature",
                    data: next24Hours.map((data) => data.temp),
                }]
        },
        humidity: {
            labels: timeArray,
            datasets: [{
                label: "Humidity",
                data: next24Hours.map((data) => data.humidity)
            }]
        },
        wind_speed: {
            labels: timeArray,
            datasets: [{
                label: "Wind Speed",
                data: next24Hours.map((data) => data.wind_speed)
            }]
        },
        visibility: {
            labels: timeArray,
            datasets: [{
                label: "Visibility",
                data: next24Hours.map((data) => data.visibility)
            }]
        },
        pressure: {
            labels: timeArray,
            datasets: [{
                label: "Air Pressure",
                data: next24Hours.map((data) => data.pressure)
            }]
        },
        clouds: {
            labels: timeArray,
            datasets: [{
                label: "Cloudiness",
                data: next24Hours.map((data) => data.clouds)
            }]
        }
    }

    const [chartData, setChartData] = useState(chartDatasets.temperature);

    const handleChangeDataset = (key) => {
        setChartData(chartDatasets[key]);
    }

    return (
        <div className="hourly-forecast">
            <h3>Hourly Forecast</h3>
            <div className="hourly-scrollable">
                {next24Hours.map((hour, index) => (
                    <div key={index} className="hourly-item">
                        <span>{new Date(hour.dt * 1000).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                        <img
                            src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                            alt={hour.weather[0].description}
                        />
                        <span>{Math.round(hour.temp)}°C</span>
                    </div>
                ))}
            </div>
            <div className="hourly-graph">
                <Line data={chartData}/>
            </div>
            < button onClick={() => handleChangeDataset("temperature")} className={"save-button"}>Temperature</button>
            < button onClick={() => handleChangeDataset("wind_speed")} className={"save-button"}>Wind Speed</button>
            < button onClick={() => handleChangeDataset("visibility")} className={"save-button"}>Visibility</button>
            < button onClick={() => handleChangeDataset("humidity")} className={"save-button"}>Humidity</button>
            < button onClick={() => handleChangeDataset("pressure")} className={"save-button"}>Air Pressure</button>
            < button onClick={() => handleChangeDataset("clouds")} className={"save-button"}>Cloudiness</button>
        </div>
    );
};

export default HourlyForecast;