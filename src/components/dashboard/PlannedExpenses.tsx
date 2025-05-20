import React, { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import type { User } from "firebase/auth";
import Modal from "../Modal";
import PlannedExpenseForm from "../forms/PlannedExpenseForm";

interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
}

interface PlannedExpensesProps {
  expenses: Expense[];
  onRefresh?: () => Promise<void>;
  currentUser?: User | null;
}

const PlannedExpenses: React.FC<PlannedExpensesProps> = ({
  expenses,
  onRefresh,
  currentUser,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Agrupar despesas por categoria
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const handleDelete = async (expenseId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Tem certeza que deseja excluir esta despesa?")) return;

    try {
      await deleteDoc(
        doc(db, `users/${currentUser.uid}/plannedExpenses/${expenseId}`)
      );
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
      <h2 className="text-xl font-semibold text-white mb-4">
        Gastos Programados
      </h2>

      {Object.keys(expensesByCategory).length === 0 ? (
        <p className="text-gray-400">Nenhum gasto programado cadastrado.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(expensesByCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-neon-purple mb-3">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-dark-bg p-4 rounded-lg border border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-white">
                          {expense.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Vencimento: {expense.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            R${" "}
                            {expense.amount.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
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
                            onClick={() => handleDelete(expense.id)}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-right text-sm text-gray-300">
                Total {category}: R${" "}
                {items
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">Total Geral</span>
              <span className="text-lg font-bold text-neon-purple">
                R${" "}
                {expenses
                  .reduce((sum, expense) => sum + expense.amount, 0)
                  .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Despesa Programada"
      >
        {selectedExpense && (
          <PlannedExpenseForm
            expenseToEdit={selectedExpense}
            onSuccess={() => {
              setIsEditModalOpen(false);
              if (onRefresh) onRefresh();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default PlannedExpenses;
