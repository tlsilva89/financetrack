import React, { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import type { User } from "firebase/auth";
import Modal from "../Modal";
import UtilityForm from "../forms/UtilityForm";
import { FiEdit2, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";

interface Utility {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  previousAmount?: number;
  excludeFromSplit?: boolean;
}

interface UtilityExpensesProps {
  utilities: Utility[];
  onRefresh?: () => Promise<void>;
  currentUser?: User | null;
}

const UtilityExpenses: React.FC<UtilityExpensesProps> = ({
  utilities,
  onRefresh,
  currentUser,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);

  // Agrupar utilidades por categoria
  const utilitiesByCategory = utilities.reduce((acc, utility) => {
    const category = utility.category || "Outros";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(utility);
    return acc;
  }, {} as Record<string, Utility[]>);

  const handleDelete = async (utilityId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      await deleteDoc(
        doc(db, `users/${currentUser.uid}/utilities/${utilityId}`)
      );
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
    }
  };

  const handleEdit = (utility: Utility) => {
    setSelectedUtility(utility);
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
      <h2 className="text-xl font-semibold text-white mb-4">
        Serviços de Consumo
      </h2>

      {utilities.length === 0 ? (
        <p className="text-gray-400 text-center py-6">
          Nenhum serviço de consumo cadastrado.
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(utilitiesByCategory).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-medium text-neon-purple">
                {category}
              </h3>
              {items.map((utility) => (
                <div
                  key={utility.id}
                  className="bg-dark-bg p-4 rounded-lg border border-gray-700"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white">{utility.name}</h4>
                      <p className="text-sm text-gray-400">
                        Vencimento: {utility.dueDate}
                      </p>
                      {utility.excludeFromSplit && (
                        <span className="inline-block mt-1 px-2 py-1 bg-neon-purple/20 text-neon-purple text-xs rounded-full">
                          Não dividido
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          R${" "}
                          {utility.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>

                        {utility.previousAmount && (
                          <div
                            className={`text-xs mt-1 flex items-center ${
                              utility.amount > utility.previousAmount
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {utility.amount > utility.previousAmount ? (
                              <>
                                <FiArrowUp className="mr-1" />
                                {(
                                  (utility.amount / utility.previousAmount -
                                    1) *
                                  100
                                ).toFixed(1)}
                                %
                              </>
                            ) : (
                              <>
                                <FiArrowDown className="mr-1" />
                                {(
                                  (1 -
                                    utility.amount / utility.previousAmount) *
                                  100
                                ).toFixed(1)}
                                %
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(utility)}
                          className="p-1 text-gray-400 hover:text-neon-purple"
                          title="Editar"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(utility.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Excluir"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-right text-sm text-gray-300">
                Total {category}: R${" "}
                {items
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">Total</span>
              <span className="text-lg font-bold text-neon-purple">
                R${" "}
                {utilities
                  .reduce((sum, utility) => sum + utility.amount, 0)
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
        title="Editar Serviço de Consumo"
      >
        {selectedUtility && (
          <UtilityForm
            utilityToEdit={selectedUtility}
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

export default UtilityExpenses;
