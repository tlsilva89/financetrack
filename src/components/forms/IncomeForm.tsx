// src/components/forms/IncomeForm.tsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";

interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface IncomeFormProps {
  onSuccess?: () => void;
  incomeToEdit?: Income | null;
}

const categories = ["Salário", "Freelance", "Investimentos", "Bônus", "Outros"];

const IncomeForm: React.FC<IncomeFormProps> = ({ onSuccess, incomeToEdit }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    category: "Salário",
    amount: "",
    date: new Date().toISOString().substring(0, 10), // Formato YYYY-MM-DD
  });

  useEffect(() => {
    if (incomeToEdit) {
      setFormData({
        description: incomeToEdit.description,
        category: incomeToEdit.category,
        amount: incomeToEdit.amount.toString(),
        date: incomeToEdit.date,
      });
    }
  }, [incomeToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setLoading(true);

      if (incomeToEdit) {
        // Atualizar entrada existente
        await updateDoc(
          doc(db, `users/${currentUser.uid}/incomes/${incomeToEdit.id}`),
          {
            description: formData.description,
            category: formData.category,
            amount: parseFloat(formData.amount),
            date: formData.date,
            updatedAt: new Date(),
          }
        );
      } else {
        // Adicionar nova entrada
        await addDoc(collection(db, `users/${currentUser.uid}/incomes`), {
          description: formData.description,
          category: formData.category,
          amount: parseFloat(formData.amount),
          date: formData.date,
          createdAt: new Date(),
        });
      }

      // Limpar formulário
      setFormData({
        description: "",
        category: "Salário",
        amount: "",
        date: new Date().toISOString().substring(0, 10),
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300"
        >
          Descrição
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="Ex: Salário mensal"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-300"
        >
          Categoria
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-300"
        >
          Valor (R$)
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
          htmlFor="date"
          className="block text-sm font-medium text-gray-300"
        >
          Data
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
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
            : incomeToEdit
            ? "Atualizar Entrada"
            : "Adicionar Entrada"}
        </button>
      </div>
    </form>
  );
};

export default IncomeForm;
