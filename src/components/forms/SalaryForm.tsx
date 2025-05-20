// src/components/forms/SalaryForm.tsx
import React, { useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";

interface SalaryFormProps {
  onSuccess?: () => void;
}

const SalaryForm: React.FC<SalaryFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    month: new Date().toISOString().substring(0, 7), // Formato YYYY-MM
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setLoading(true);

      // Verificar se já existe um registro de salário
      const salaryRef = collection(db, `users/${currentUser.uid}/salary`);
      const salarySnapshot = await getDocs(query(salaryRef, limit(1)));

      if (!salarySnapshot.empty) {
        // Se já existe, atualizar em vez de adicionar
        const salaryDoc = salarySnapshot.docs[0];
        await updateDoc(
          doc(db, `users/${currentUser.uid}/salary/${salaryDoc.id}`),
          {
            amount: parseFloat(formData.amount),
            month: formData.month,
            updatedAt: new Date(),
          }
        );
      } else {
        // Se não existe, adicionar novo
        await addDoc(salaryRef, {
          amount: parseFloat(formData.amount),
          month: formData.month,
          createdAt: new Date(),
        });
      }

      // Limpar formulário
      setFormData({
        amount: "",
        month: new Date().toISOString().substring(0, 7),
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar salário:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-300"
        >
          Salário (R$)
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
          {loading ? "Salvando..." : "Atualizar Salário"}
        </button>
      </div>
    </form>
  );
};

export default SalaryForm;
