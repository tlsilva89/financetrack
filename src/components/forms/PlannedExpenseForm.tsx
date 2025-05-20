// src/components/forms/PlannedExpenseForm.tsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";

interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
}

interface PlannedExpenseFormProps {
  onSuccess?: () => void;
  expenseToEdit?: Expense | null;
}

const categories = [
  "Assinaturas",
  "Educação",
  "Saúde",
  "Transporte",
  "Moradia",
  "Outros",
];

const PlannedExpenseForm: React.FC<PlannedExpenseFormProps> = ({
  onSuccess,
  expenseToEdit,
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Assinaturas",
    amount: "",
    dueDate: "",
  });

  // Preencher o formulário se estiver editando
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        name: expenseToEdit.name,
        category: expenseToEdit.category,
        amount: expenseToEdit.amount.toString(),
        dueDate: expenseToEdit.dueDate,
      });
    }
  }, [expenseToEdit]);

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

      if (expenseToEdit) {
        // Atualizar despesa existente
        await updateDoc(
          doc(
            db,
            `users/${currentUser.uid}/plannedExpenses/${expenseToEdit.id}`
          ),
          {
            name: formData.name,
            category: formData.category,
            amount: parseFloat(formData.amount),
            dueDate: formData.dueDate,
            updatedAt: new Date(),
          }
        );
      } else {
        // Adicionar nova despesa
        await addDoc(
          collection(db, `users/${currentUser.uid}/plannedExpenses`),
          {
            name: formData.name,
            category: formData.category,
            amount: parseFloat(formData.amount),
            dueDate: formData.dueDate,
            createdAt: new Date(),
          }
        );
      }

      // Limpar formulário
      setFormData({
        name: "",
        category: "Assinaturas",
        amount: "",
        dueDate: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar despesa programada:", error);
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
          Nome do Serviço/Despesa
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="Ex: Netflix"
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
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-300"
        >
          Data de Vencimento
        </label>
        <input
          type="text"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="Ex: Todo dia 15"
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
            : expenseToEdit
            ? "Atualizar Despesa"
            : "Adicionar Despesa"}
        </button>
      </div>
    </form>
  );
};

export default PlannedExpenseForm;
