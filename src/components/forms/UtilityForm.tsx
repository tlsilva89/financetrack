// src/components/forms/UtilityForm.tsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";
import {
  FiDollarSign,
  FiCalendar,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

interface Utility {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  previousAmount?: number;
  excludeFromSplit?: boolean;
}

interface UtilityFormProps {
  onSuccess?: () => void;
  utilityToEdit?: Utility | null;
  preselectedCategory?: string | null;
}

const categories = ["Água", "Energia", "Internet", "Gás", "IPTU", "Outros"];

const UtilityForm: React.FC<UtilityFormProps> = ({
  onSuccess,
  utilityToEdit,
  preselectedCategory,
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: preselectedCategory || "Outros",
    amount: "",
    dueDate: "",
    previousAmount: "",
    excludeFromSplit: false,
  });

  useEffect(() => {
    if (utilityToEdit) {
      setFormData({
        name: utilityToEdit.name,
        category: utilityToEdit.category || "Outros",
        amount: utilityToEdit.amount.toString(),
        dueDate: utilityToEdit.dueDate,
        previousAmount: utilityToEdit.previousAmount?.toString() || "",
        excludeFromSplit: utilityToEdit.excludeFromSplit || false,
      });
    } else if (preselectedCategory) {
      // Pré-preencher o nome com base na categoria selecionada
      let suggestedName = "";
      switch (preselectedCategory) {
        case "Água":
          suggestedName = "Conta de Água";
          break;
        case "Energia":
          suggestedName = "Conta de Energia";
          break;
        case "Internet":
          suggestedName = "Internet";
          break;
        case "Gás":
          suggestedName = "Conta de Gás";
          break;
        case "IPTU":
          suggestedName = "IPTU";
          break;
        default:
          suggestedName = "";
      }

      setFormData((prev) => ({
        ...prev,
        name: suggestedName,
        category: preselectedCategory,
      }));
    }
  }, [utilityToEdit, preselectedCategory]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Corrigido: Verificação específica para checkbox
    if (type === "checkbox") {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkboxInput.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setLoading(true);

      const utilityData = {
        name: formData.name,
        category: formData.category,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        excludeFromSplit: formData.excludeFromSplit,
        ...(formData.previousAmount
          ? { previousAmount: parseFloat(formData.previousAmount) }
          : {}),
      };

      if (utilityToEdit) {
        await updateDoc(
          doc(db, `users/${currentUser.uid}/utilities/${utilityToEdit.id}`),
          {
            ...utilityData,
            updatedAt: new Date(),
          }
        );
      } else {
        await addDoc(collection(db, `users/${currentUser.uid}/utilities`), {
          ...utilityData,
          createdAt: new Date(),
        });
      }

      setFormData({
        name: "",
        category: preselectedCategory || "Outros",
        amount: "",
        dueDate: "",
        previousAmount: "",
        excludeFromSplit: false,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
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
          Nome do Serviço
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="Ex: Água, Energia, Internet"
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
          className="text-sm font-medium text-gray-300 flex items-center"
        >
          <FiDollarSign className="mr-1 text-neon-purple" />
          Valor Atual (R$)
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
          htmlFor="previousAmount"
          className="block text-sm font-medium text-gray-300"
        >
          Valor Anterior (R$) - Opcional
        </label>
        <input
          type="number"
          id="previousAmount"
          name="previousAmount"
          value={formData.previousAmount}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
          placeholder="0.00"
        />
      </div>

      <div>
        <label
          htmlFor="dueDate"
          className="text-sm font-medium text-gray-300 flex items-center"
        >
          <FiCalendar className="mr-1 text-neon-purple" />
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

      <div className="flex items-center">
        <input
          type="checkbox"
          id="excludeFromSplit"
          name="excludeFromSplit"
          checked={formData.excludeFromSplit}
          onChange={handleChange}
          className="h-4 w-4 text-neon-purple focus:ring-neon-purple border-gray-600 rounded bg-dark-bg"
        />
        <label
          htmlFor="excludeFromSplit"
          className="ml-2 text-sm text-gray-300 flex items-center"
        >
          {formData.excludeFromSplit ? (
            <FiToggleRight className="mr-1 text-neon-purple" />
          ) : (
            <FiToggleLeft className="mr-1 text-gray-400" />
          )}
          Excluir da divisão de despesas
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-neon-purple hover:bg-neon-purple/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-purple disabled:opacity-50"
        >
          {loading
            ? "Salvando..."
            : utilityToEdit
            ? "Atualizar Serviço"
            : "Adicionar Serviço"}
        </button>
      </div>
    </form>
  );
};

export default UtilityForm;
