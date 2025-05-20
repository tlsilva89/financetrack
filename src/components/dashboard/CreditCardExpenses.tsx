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

interface CreditCardExpensesProps {
  cards: CreditCard[];
  onRefresh?: () => Promise<void>;
  currentUser?: User | null;
}

const CreditCardExpenses: React.FC<CreditCardExpensesProps> = ({
  cards,
  onRefresh,
  currentUser,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

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
      <h2 className="text-xl font-semibold text-white mb-4">
        Gastos com Cartões de Crédito
      </h2>

      {cards.length === 0 ? (
        <p className="text-gray-400">Nenhum cartão cadastrado.</p>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-dark-bg p-4 rounded-lg border border-gray-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white">{card.name}</h3>
                  <p className="text-sm text-gray-400">{card.bank}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      R${" "}
                      {card.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-gray-400">{card.month}</p>

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
                  </div>
                  <div className="flex space-x-2">
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
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">Total</span>
              <span className="text-lg font-bold text-neon-purple">
                R${" "}
                {cards
                  .reduce((sum, card) => sum + card.amount, 0)
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

export default CreditCardExpenses;
