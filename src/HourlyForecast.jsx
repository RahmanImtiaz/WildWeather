/**
 * HourlyForecast.jsx
 * This is the main component that handles the hourly data fetching and rendering all subcomponents such as the hourly
 * chart.
 *
 * This is responsible for:
 * - Formatting hourly data into a JSON array,
 * - Matching the units with the users preferred unit of choice.
 * - Displaying a line chart which shows the data of choice by time.
 */

import {useEffect, useState, useMemo} from 'react';
import {Line} from "react-chartjs-2";

const HourlyForecast = ({hourlyData, units}) => {
    // Format hourly data for display
    const next24Hours = useMemo(() => hourlyData.slice(0, 24), [hourlyData]);

    // Get the appropriate temperature unit symbol
    const tempUnit = useMemo(() => (units === 'metric' ? '°C' : '°F'), [units]);

    // Get the appropriate wind speed unit
    const windSpeedUnit = useMemo(() => (units === 'metric' ? 'm/s' : 'mph'), [units]);

    // Get the appropriate visibility unit
    const visibilityUnit = useMemo(() => (units === 'metric' ? 'm' : 'ft'), [units]);

    // Array for time values
    const timeArray = useMemo(() => next24Hours.map((hour) =>
        new Date(hour.dt * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    ), [next24Hours]);

    // Dataset JSON for each data to be parsed into chart, useMemo used to only recalculate JSON when necessary
    const chartDatasets = useMemo(() => ({
        temperature: {
            labels: timeArray,
            datasets: [
                {
                    label: `Temperature (${tempUnit})`,
                    data: next24Hours.map((data) => data.temp),
                }]
        },
        humidity: {
            labels: timeArray,
            datasets: [{
                label: "Humidity (%)",
                data: next24Hours.map((data) => data.humidity),
            }]
        },
        wind_speed: {
            labels: timeArray,
            datasets: [{
                label: `Wind Speed (${windSpeedUnit})`,
                data: next24Hours.map((data) => data.wind_speed),
            }]
        },
        visibility: {
            labels: timeArray,
            datasets: [{
                label: `Visibility (${visibilityUnit})`,
                data: next24Hours.map((data) => data.visibility),
            }]
        },
        pressure: {
            labels: timeArray,
            datasets: [{
                label: "Air Pressure (hPa)",
                data: next24Hours.map((data) => data.pressure),
            }]
        },
        clouds: {
            labels: timeArray,
            datasets: [{
                label: "Cloudiness (%)",
                data: next24Hours.map((data) => data.clouds),
            }]
        }
    }), [next24Hours, tempUnit, windSpeedUnit, visibilityUnit, timeArray]);


    // State variable to update chartData by using the JSON for the required data. Data type to be shown first is
    // temperature as it is usually high priority.
    const [chartData, setChartData] = useState(chartDatasets.temperature);

    // State variable to store the last clicked data button to display on the chart. Used for when the user changes
    // location, the chart will still show the data type they clicked previously (but updated to the new location).
    const [selectedType, setSelectedType] = useState("temperature");

    /**
     * useEffect Hook
     * This hook updates the chart when the component mounts and when the chartDatasets or selectedType changes.
     */
    useEffect(() => {
        setChartData(chartDatasets[selectedType]);
    }, [chartDatasets, selectedType]);

    // .
    /**
     * Handles button clicks to change chart data types. Setting the selected datatype which will update the chart.
     *
     * @param {string} type - The name of the data type to change to.
     */
    const handleChangeDataset = (type) => {
        setSelectedType(type);
    };

    return (
        <div className="hourly-forecast">
            <h3>Hourly Forecast</h3>

            {/*Displays a scrollable hourly forecast displaying the temperature, icon and time of day.*/}
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
                        <span>{Math.round(hour.temp)}{tempUnit}</span>
                    </div>
                ))}
            </div>

            {/*Displays the line chart with buttons underneath to select different data types.*/}
            <div className="hourly-chart">
                <Line data={chartData} options={{ maintainAspectRatio: false }}/>
            </div>
            <button onClick={() => handleChangeDataset("temperature")} className={"save-button"}>Temperature</button>
            <button onClick={() => handleChangeDataset("wind_speed")} className={"save-button"}>Wind Speed</button>
            <button onClick={() => handleChangeDataset("visibility")} className={"save-button"}>Visibility</button>
            <button onClick={() => handleChangeDataset("humidity")} className={"save-button"}>Humidity</button>
            <button onClick={() => handleChangeDataset("pressure")} className={"save-button"}>Air Pressure</button>
            <button onClick={() => handleChangeDataset("clouds")} className={"save-button"}>Cloudiness</button>
        </div>
    );
};

export default HourlyForecast;