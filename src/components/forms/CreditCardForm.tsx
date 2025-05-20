// src/components/forms/CreditCardForm.tsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";

interface CreditCard {
  id: string;
  name: string;
  bank: string;
  amount: number;
  month: string;
  previousMonthAmount?: number;
}

interface CreditCardFormProps {
  onSuccess?: () => void;
  cardToEdit?: CreditCard | null;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onSuccess,
  cardToEdit,
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    amount: "",
    month: new Date().toISOString().substring(0, 7), // Formato YYYY-MM
  });

  useEffect(() => {
    if (cardToEdit) {
      setFormData({
        name: cardToEdit.name,
        bank: cardToEdit.bank,
        amount: cardToEdit.amount.toString(),
        month: cardToEdit.month,
      });
    }
  }, [cardToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setLoading(true);

      if (cardToEdit) {
        await updateDoc(
          doc(db, `users/${currentUser.uid}/creditCards/${cardToEdit.id}`),
          {
            name: formData.name,
            bank: formData.bank,
            amount: parseFloat(formData.amount),
            month: formData.month,
            updatedAt: new Date(),
          }
        );
      } else {
        await addDoc(collection(db, `users/${currentUser.uid}/creditCards`), {
          name: formData.name,
          bank: formData.bank,
          amount: parseFloat(formData.amount),
          month: formData.month,
          createdAt: new Date(),
        });
      }

      setFormData({
        name: "",
        bank: "",
        amount: "",
        month: new Date().toISOString().substring(0, 7),
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Nome do Cartão
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="Ex: Nubank"
        />
      </div>

      <div>
        <label
          htmlFor="bank"
          className="block text-sm font-medium text-gray-300"
        >
          Banco
        </label>
        <input
          type="text"
          id="bank"
          name="bank"
          value={formData.bank}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="Ex: Nubank"
        />
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-300"
        >
          Valor Gasto (R$)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="0.00"
        />
      </div>

      <div>
        <label
          htmlFor="month"
          className="block text-sm font-medium text-gray-300"
        >
          Mês de Referência
        </label>
        <input
          type="month"
          id="month"
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-neon-purple hover:bg-neon-purple/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-purple disabled:opacity-50"
        >
          {loading
            ? "Salvando..."
            : cardToEdit
            ? "Atualizar Cartão"
            : "Adicionar Cartão"}
        </button>
      </div>
    </form>
  );
};

export default CreditCardForm;
