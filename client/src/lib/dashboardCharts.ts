import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions,
    type ChartData
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const chartData = (stockIn: number[], stockOut: number[], labels: string[]): ChartData<'line'> => ({
    labels: labels,
    datasets: [
        {
            fill: true,
            label: 'Stock In',
            data: stockIn,
            borderColor: '#186049',
            backgroundColor: 'rgba(24, 96, 73, 0.08)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 2,
            pointHoverRadius: 6,
        },
        {
            fill: true,
            label: 'Stock Out',
            data: stockOut,
            borderColor: '#d98327',
            backgroundColor: 'rgba(217, 131, 39, 0.08)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 2,
            pointHoverRadius: 6,
        }
    ],
});

export const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#20392e',
            padding: 12,
            cornerRadius: 8,
            titleFont: { weight: 'bold' },
            bodyFont: { weight: 500 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { weight: 'bold', size: 10 } }
        },
        y: {
            grid: { color: '#f1f5f9' },
            ticks: { color: '#94a3b8', font: { size: 10 } },
            border: { display: false }
        }
    }
};
