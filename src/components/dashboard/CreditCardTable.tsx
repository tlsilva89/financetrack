import React, { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import type { User } from "firebase/auth";
import Modal from "../Modal";
import CreditCardForm from "../forms/CreditCardForm";

interface CreditCard {
  id: string;
  name: string;
  bank: string;
  amount: number;
  month: string;
  previousMonthAmount?: number;
}

interface CreditCardTableProps {
  cards: CreditCard[];
  onRefresh?: () => Promise<void>;
  currentUser?: User | null;
}

const CreditCardTable: React.FC<CreditCardTableProps> = ({
  cards,
  onRefresh,
  currentUser,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  const totalAmount = cards.reduce((sum, card) => sum + card.amount, 0);

  const handleDelete = async (cardId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;

    try {
      await deleteDoc(
        doc(db, `users/${currentUser.uid}/creditCards/${cardId}`)
      );
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Erro ao excluir cartão:", error);
    }
  };

  const handleEdit = (card: CreditCard) => {
    setSelectedCard(card);
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Cartões de Crédito</h2>
        <span className="text-lg font-bold text-neon-purple">
          Total: R${" "}
          {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {cards.length === 0 ? (
        <p className="text-gray-400 text-center py-6">
          Nenhum cartão cadastrado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-gray-400 font-medium">Cartão</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Banco</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-right">
                  Valor
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-dark-bg/50">
                  <td className="py-3 px-4 text-white">{card.name}</td>
                  <td className="py-3 px-4 text-gray-300">{card.bank}</td>
                  <td className="py-3 px-4 text-white text-right">
                    R${" "}
                    {card.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                    {card.previousMonthAmount && (
                      <div
                        className={`text-xs mt-1 ${
                          card.amount > card.previousMonthAmount
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {card.amount > card.previousMonthAmount
                          ? `↑ ${(
                              (card.amount / card.previousMonthAmount - 1) *
                              100
                            ).toFixed(1)}%`
                          : `↓ ${(
                              (1 - card.amount / card.previousMonthAmount) *
                              100
                            ).toFixed(1)}%`}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(card)}
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
                        onClick={() => handleDelete(card.id)}
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
        title="Editar Cartão de Crédito"
      >
        {selectedCard && (
          <CreditCardForm
            cardToEdit={selectedCard}
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

export default CreditCardTable;
