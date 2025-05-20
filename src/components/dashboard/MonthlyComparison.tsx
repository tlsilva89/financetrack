import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyComparisonProps {
  data: Record<string, number>;
}

const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({ data }) => {
  // Ordenar os meses cronologicamente
  const sortedMonths = Object.keys(data).sort();

  // Formatar os labels dos meses
  const labels = sortedMonths.map((month) => {
    const date = parse(month, "yyyy-MM", new Date());
    return format(date, "MMM yy", { locale: ptBR });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Gastos Mensais",
        data: sortedMonths.map((month) => data[month]),
        backgroundColor: "rgba(176, 38, 255, 0.6)",
        borderColor: "rgba(176, 38, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Simplificando as opções para evitar problemas de tipagem
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default MonthlyComparison;
