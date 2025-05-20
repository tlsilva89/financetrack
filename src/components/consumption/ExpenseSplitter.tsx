import React from "react";
import { FiUsers, FiDivide } from "react-icons/fi";

interface Utility {
  id: string;
  name: string;
  amount: number;
  excludeFromSplit?: boolean;
}

interface ExpenseSplitterProps {
  utilities: Utility[];
  peopleCount: number;
  setPeopleCount: (count: number) => void;
}

const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({
  utilities,
  peopleCount,
  setPeopleCount,
}) => {
  // Filtrar apenas os gastos que devem ser divididos
  const splitUtilities = utilities.filter(
    (utility) => !utility.excludeFromSplit
  );

  // Calcular o total a ser dividido
  const totalToSplit = splitUtilities.reduce(
    (sum, utility) => sum + utility.amount,
    0
  );

  // Calcular o valor por pessoa
  const amountPerPerson = peopleCount > 0 ? totalToSplit / peopleCount : 0;

  return (
    <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30 h-full">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <FiDivide className="mr-2 text-neon-purple" />
        Divisão de Despesas
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="peopleCount"
            className="text-sm font-medium text-gray-300 mb-2 flex items-center"
          >
            <FiUsers className="mr-2 text-neon-purple" />
            Número de Pessoas
          </label>
          <input
            type="number"
            id="peopleCount"
            min="1"
            value={peopleCount}
            onChange={(e) =>
              setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          />
        </div>

        <div className="bg-dark-bg p-4 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Total a dividir</span>
            <span className="text-white font-medium">
              R${" "}
              {totalToSplit.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Por pessoa</span>
            <span className="text-neon-purple font-bold text-lg">
              R${" "}
              {amountPerPerson.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <FiDivide className="mr-2 text-neon-purple" />
            Serviços Incluídos
          </h3>
          <div className="bg-dark-bg rounded-lg border border-gray-700 divide-y divide-gray-700">
            {splitUtilities.length === 0 ? (
              <p className="p-3 text-gray-400 text-center">
                Nenhum serviço para dividir
              </p>
            ) : (
              splitUtilities.map((utility) => (
                <div
                  key={utility.id}
                  className="p-3 flex justify-between items-center"
                >
                  <span className="text-gray-300">{utility.name}</span>
                  <span className="text-white">
                    R${" "}
                    {utility.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {utilities.some((u) => u.excludeFromSplit) && (
          <div className="mt-4">
            <h3 className="text-white font-medium mb-2">Serviços Excluídos</h3>
            <div className="bg-dark-bg rounded-lg border border-gray-700 divide-y divide-gray-700">
              {utilities
                .filter((u) => u.excludeFromSplit)
                .map((utility) => (
                  <div
                    key={utility.id}
                    className="p-3 flex justify-between items-center"
                  >
                    <span className="text-gray-300">{utility.name}</span>
                    <span className="text-white">
                      R${" "}
                      {utility.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseSplitter;
