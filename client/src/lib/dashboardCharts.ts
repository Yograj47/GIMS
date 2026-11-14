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

const themeColor = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const chartData = (stockIn: number[], stockOut: number[], labels: string[]): ChartData<'line'> => ({
    labels: labels,
    datasets: [
        {
            fill: true,
            label: 'Stock In',
            data: stockIn,
            borderColor: themeColor("--chart-1"),
            backgroundColor: themeColor("--chart-1") + "1f",
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 2,
            pointHoverRadius: 6,
        },
        {
            fill: true,
            label: 'Stock Out',
            data: stockOut,
            borderColor: themeColor("--chart-2"),
            backgroundColor: themeColor("--chart-2") + "1f",
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 2,
            pointHoverRadius: 6,
        }
    ],
});

export const chartOptions = (): ChartOptions<'line'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: themeColor("--palette-navy"),
            padding: 12,
            cornerRadius: 8,
            titleFont: { weight: 'bold' },
            bodyFont: { weight: 500 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: themeColor("--muted-foreground"), font: { weight: 'bold', size: 10 } }
        },
        y: {
            grid: { color: themeColor("--border") },
            ticks: { color: themeColor("--muted-foreground"), font: { size: 10 } },
            border: { display: false }
        }
    }
});
