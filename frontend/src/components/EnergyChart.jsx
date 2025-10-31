import React, { useMemo, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title)

export default function EnergyChart({ seriesData }) {
    const chartRef = useRef(null)

    const datasets = useMemo(() => {
        const colors = [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
            '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'
        ]
        return Object.keys(seriesData).map((deviceId, i) => {
            const points = seriesData[deviceId] || []
            return {
                label: deviceId,
                data: points.map(p => ({ x: p.ts, y: p.power_w })),
                tension: 0.2,
                borderColor: colors[i % colors.length],
                backgroundColor: 'rgba(0,0,0,0)',
                borderWidth: 2,
                pointRadius: 0
            }
        })
    }, [seriesData])

    const data = { datasets }

    const options = {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Power (W) over time' }
        },
        scales: {
            x: {
                type: 'time',
                time: { unit: 'minute', tooltipFormat: 'PPpp' },
                ticks: { maxRotation: 0 }
            },
            y: {
                title: { display: true, text: 'Power (W)' },
                beginAtZero: true
            }
        }
    }

    return (
        <div style={{ height: 360 }}>
            <Line ref={chartRef} data={data} options={options} />
        </div>
    )
}
