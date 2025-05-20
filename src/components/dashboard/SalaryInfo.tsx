import React from "react";

interface SalaryInfoProps {
  salary: number;
  totalExpenses: number;
}

const SalaryInfo: React.FC<SalaryInfoProps> = ({ salary, totalExpenses }) => {
  const remaining = salary - totalExpenses;
  const percentageSpent = salary > 0 ? (totalExpenses / salary) * 100 : 0;

  // Determinar a cor do gráfico com base no percentual gasto
  const getProgressColor = () => {
    if (percentageSpent <= 60) return "bg-green-500";
    if (percentageSpent <= 80) return "bg-yellow-500";
    if (percentageSpent <= 100) return "bg-orange-500";
    return "bg-red-500";
  };

  // Determinar a mensagem de status
  const getStatusMessage = () => {
    if (percentageSpent <= 60) return "Finanças saudáveis";
    if (percentageSpent <= 80) return "Gastos moderados";
    if (percentageSpent <= 100) return "Atenção aos gastos";
    return "Gastos acima do orçamento";
  };

  return (
    <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
      <h2 className="text-xl font-semibold text-white mb-4">
        Informações Salariais
      </h2>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Salário</p>
            <p className="text-xl font-bold text-white">
              R$ {salary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="h-16 w-16 rounded-full border-4 border-gray-700 flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {percentageSpent.toFixed(0)}%
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Total Gasto</span>
            <span className="text-white">
              R${" "}
              {totalExpenses.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="w-full bg-dark-bg rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${getProgressColor()}`}
              style={{ width: `${Math.min(percentageSpent, 100)}%` }}
            ></div>
          </div>

          <p className="text-right mt-1 text-sm text-gray-400">
            {getStatusMessage()}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Saldo Restante</span>
            <span
              className={`text-xl font-bold ${
                remaining >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              R${" "}
              {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryInfo;
