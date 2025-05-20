import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CreditCard {
  id: string;
  name: string;
  bank: string;
  amount: number;
  month: string;
}

interface PlannedExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
}

interface ExpensesChartProps {
  creditCards: CreditCard[];
  plannedExpenses: PlannedExpense[];
}

const ExpensesChart: React.FC<ExpensesChartProps> = ({
  creditCards,
  plannedExpenses,
}) => {
  // Agrupar despesas por categoria
  const expensesByCategory = plannedExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Agrupar cartões por banco
  const expensesByBank = creditCards.reduce((acc, card) => {
    if (!acc[card.bank]) {
      acc[card.bank] = 0;
    }
    acc[card.bank] += card.amount;
    return acc;
  }, {} as Record<string, number>);

  // Cores para o gráfico
  const generateColors = (count: number) => {
    const baseColors = [
      "rgba(176, 38, 255, 0.8)", // neon purple
      "rgba(45, 212, 191, 0.8)", // teal
      "rgba(251, 146, 60, 0.8)", // orange
      "rgba(139, 92, 246, 0.8)", // purple
      "rgba(14, 165, 233, 0.8)", // sky blue
      "rgba(236, 72, 153, 0.8)", // pink
      "rgba(34, 211, 238, 0.8)", // cyan
      "rgba(248, 113, 113, 0.8)", // red
      "rgba(16, 185, 129, 0.8)", // green
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(baseColors[i % baseColors.length]);
    }
    return result;
  };

  // Preparar dados para o gráfico
  const allCategories = Object.keys(expensesByCategory);
  const allBanks = Object.keys(expensesByBank);

  const combinedLabels = [...allCategories, ...allBanks];
  const combinedData = [
    ...allCategories.map((cat) => expensesByCategory[cat]),
    ...allBanks.map((bank) => expensesByBank[bank]),
  ];

  const colors = generateColors(combinedLabels.length);

  const data = {
    labels: combinedLabels,
    datasets: [
      {
        data: combinedData,
        backgroundColor: colors,
        borderColor: colors.map((color) => color.replace("0.8", "1")),
        borderWidth: 1,
      },
    ],
  };

  // Usando uma abordagem mais simples para as opções para evitar problemas de tipagem
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "white",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default ExpensesChart;
