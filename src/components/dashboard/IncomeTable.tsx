import React, { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import type { User } from "firebase/auth";
import Modal from "../Modal";
import IncomeForm from "../forms/IncomeForm";

interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  formattedDate?: string; // Adicionamos esta propriedade opcional
  category: string;
}

interface IncomeTableProps {
  incomes: Income[];
  onRefresh?: () => Promise<void>;
  currentUser?: User | null;
}

const IncomeTable: React.FC<IncomeTableProps> = ({
  incomes,
  onRefresh,
  currentUser,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  const totalAmount = incomes.reduce((sum, income) => sum + income.amount, 0);

  const handleDelete = async (incomeId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Tem certeza que deseja excluir esta entrada?")) return;

    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/incomes/${incomeId}`));
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Erro ao excluir entrada:", error);
    }
  };

  const handleEdit = (income: Income) => {
    setSelectedIncome(income);
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Entradas</h2>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-neon-purple">
            Total: R${" "}
            {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-md hover:bg-neon-purple/30 transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova Entrada
          </button>
        </div>
      </div>

      {incomes.length === 0 ? (
        <p className="text-gray-400 text-center py-6">
          Nenhuma entrada cadastrada.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Descrição
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">
                  Categoria
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium">Data</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-right">
                  Valor
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {incomes.map((income) => (
                <tr key={income.id} className="hover:bg-dark-bg/50">
                  <td className="py-3 px-4 text-white">{income.description}</td>
                  <td className="py-3 px-4 text-gray-300">{income.category}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {income.formattedDate || income.date}
                  </td>
                  <td className="py-3 px-4 text-white text-right">
                    R${" "}
                    {income.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(income)}
                        className="p-1 text-gray-400 hover:text-neon-purple"
                        title="Editar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Excluir"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Entrada"
      >
        {selectedIncome && (
          <IncomeForm
            incomeToEdit={selectedIncome}
            onSuccess={() => {
              setIsEditModalOpen(false);
              if (onRefresh) onRefresh();
            }}
          />
        )}
      </Modal>

      {/* Modal de adição */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Nova Entrada"
      >
        <IncomeForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            if (onRefresh) onRefresh();
          }}
        />
      </Modal>
    </div>
  );
};

export default IncomeTable;
