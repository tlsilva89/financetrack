import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import Layout from "../components/layout/Layout";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/Modal";
import UtilityForm from "../components/forms/UtilityForm";
import FadeIn from "../components/common/FadeIn";

// Importação de ícones
import {
  FiDroplet,
  FiZap,
  FiWifi,
  FiHome,
  FiActivity,
  FiRefreshCw,
  FiPlus,
  FiFlag,
} from "react-icons/fi";

// Carregamento lazy dos componentes
const UtilityExpenses = lazy(
  () => import("../components/consumption/UtilityExpenses")
);
const ExpenseSplitter = lazy(
  () => import("../components/consumption/ExpenseSplitter")
);

// Definição da interface para tipagem
interface Utility {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  previousAmount?: number;
  excludeFromSplit?: boolean;
}

// Categorias de utilidades
const UTILITY_CATEGORIES = {
  WATER: "Água",
  ENERGY: "Energia",
  INTERNET: "Internet",
  GAS: "Gás",
  IPTU: "IPTU",
  OTHER: "Outros",
};

const MonthlyConsumption: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    // Usar um timer para evitar indicadores de carregamento em operações rápidas
    let loadingTimer: NodeJS.Timeout | null = null;

    if (!isReady) {
      // Não mostrar loading na primeira carga
      loadingTimer = setTimeout(() => {
        setLoading(true);
      }, 200);
    } else {
      setLoading(true);
    }

    try {
      const utilitiesSnapshot = await getDocs(
        collection(db, `users/${currentUser.uid}/utilities`)
      );

      const utilitiesData = utilitiesSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            // Garantir que todas as utilidades tenham uma categoria
            category: doc.data().category || UTILITY_CATEGORIES.OTHER,
          } as Utility)
      );

      // Limpar timer se os dados carregaram rapidamente
      if (loadingTimer) clearTimeout(loadingTimer);

      setUtilities(utilitiesData);
    } catch (error) {
      console.error("Erro ao buscar dados de consumo:", error);
      if (loadingTimer) clearTimeout(loadingTimer);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isReady]);

  // Função para atualizar os dados após adicionar/editar/excluir
  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchData();
      if (isMounted) {
        // Pequeno atraso para garantir transição suave
        setTimeout(() => {
          setIsReady(true);
        }, 300);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Calcular totais por categoria
  const calculateCategoryTotal = (category: string): number => {
    return utilities
      .filter((utility) => utility.category === category)
      .reduce((sum, utility) => sum + utility.amount, 0);
  };

  const handleAddUtility = (category: string) => {
    setSelectedCategory(category);
    setIsUtilityModalOpen(true);
  };

  if (loading && !isReady) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-neon-purple flex flex-col items-center">
            <FiRefreshCw className="animate-spin h-10 w-10 mb-3" />
            <span>Carregando dados de consumo...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FadeIn duration={400}>
        <div className="space-y-6">
          {/* Cabeçalho com título e botão de adicionar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FiHome className="mr-2 text-neon-purple" />
              Consumo Mensal
            </h1>

            <button
              onClick={() => setIsUtilityModalOpen(true)}
              className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-md hover:bg-neon-purple/30 transition-colors flex items-center"
            >
              <FiPlus className="h-4 w-4 mr-1" />
              Adicionar Serviço
            </button>
          </div>

          {/* Resumo de gastos */}
          <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiActivity className="mr-2 text-neon-purple" />
                Resumo de Consumo
              </h2>
              <span className="text-lg font-bold text-neon-purple">
                Total: R${" "}
                {utilities
                  .reduce((sum, utility) => sum + utility.amount, 0)
                  .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-bg p-4 rounded-lg border border-gray-700 flex items-center">
                <div className="p-3 rounded-full bg-blue-500/20 mr-3">
                  <FiDroplet className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Água</p>
                  <p className="text-lg font-bold text-white">
                    R${" "}
                    {calculateCategoryTotal(
                      UTILITY_CATEGORIES.WATER
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => handleAddUtility(UTILITY_CATEGORIES.WATER)}
                  className="ml-auto p-1 text-gray-400 hover:text-neon-purple"
                  title="Adicionar"
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-dark-bg p-4 rounded-lg border border-gray-700 flex items-center">
                <div className="p-3 rounded-full bg-yellow-500/20 mr-3">
                  <FiZap className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Energia</p>
                  <p className="text-lg font-bold text-white">
                    R${" "}
                    {calculateCategoryTotal(
                      UTILITY_CATEGORIES.ENERGY
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => handleAddUtility(UTILITY_CATEGORIES.ENERGY)}
                  className="ml-auto p-1 text-gray-400 hover:text-neon-purple"
                  title="Adicionar"
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-dark-bg p-4 rounded-lg border border-gray-700 flex items-center">
                <div className="p-3 rounded-full bg-purple-500/20 mr-3">
                  <FiWifi className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Internet</p>
                  <p className="text-lg font-bold text-white">
                    R${" "}
                    {calculateCategoryTotal(
                      UTILITY_CATEGORIES.INTERNET
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => handleAddUtility(UTILITY_CATEGORIES.INTERNET)}
                  className="ml-auto p-1 text-gray-400 hover:text-neon-purple"
                  title="Adicionar"
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>

              {/* Novo card para Gás */}
              <div className="bg-dark-bg p-4 rounded-lg border border-gray-700 flex items-center">
                <div className="p-3 rounded-full bg-orange-500/20 mr-3">
                  <FiActivity className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Gás</p>
                  <p className="text-lg font-bold text-white">
                    R${" "}
                    {calculateCategoryTotal(
                      UTILITY_CATEGORIES.GAS
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => handleAddUtility(UTILITY_CATEGORIES.GAS)}
                  className="ml-auto p-1 text-gray-400 hover:text-neon-purple"
                  title="Adicionar"
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>

              {/* Novo card para IPTU */}
              <div className="bg-dark-bg p-4 rounded-lg border border-gray-700 flex items-center">
                <div className="p-3 rounded-full bg-green-500/20 mr-3">
                  <FiFlag className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">IPTU</p>
                  <p className="text-lg font-bold text-white">
                    R${" "}
                    {calculateCategoryTotal(
                      UTILITY_CATEGORIES.IPTU
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => handleAddUtility(UTILITY_CATEGORIES.IPTU)}
                  className="ml-auto p-1 text-gray-400 hover:text-neon-purple"
                  title="Adicionar"
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-dark-bg p-4 rounded-lg border border-gray-700 flex items-center">
                <div className="p-3 rounded-full bg-gray-500/20 mr-3">
                  <FiActivity className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Outros</p>
                  <p className="text-lg font-bold text-white">
                    R${" "}
                    {calculateCategoryTotal(
                      UTILITY_CATEGORIES.OTHER
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => handleAddUtility(UTILITY_CATEGORIES.OTHER)}
                  className="ml-auto p-1 text-gray-400 hover:text-neon-purple"
                  title="Adicionar"
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Gráficos e informações detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-neon-purple/50">
                      Carregando dados...
                    </div>
                  </div>
                }
              >
                <UtilityExpenses
                  utilities={utilities}
                  onRefresh={refreshData}
                  currentUser={currentUser}
                />
              </Suspense>
            </div>

            <div>
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-neon-purple/50">
                      Carregando calculadora...
                    </div>
                  </div>
                }
              >
                <ExpenseSplitter
                  utilities={utilities}
                  peopleCount={peopleCount}
                  setPeopleCount={setPeopleCount}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Modal para adicionar serviço */}
      <Modal
        isOpen={isUtilityModalOpen}
        onClose={() => {
          setIsUtilityModalOpen(false);
          setSelectedCategory(null);
        }}
        title={`Adicionar Serviço de ${selectedCategory || "Consumo"}`}
      >
        <UtilityForm
          preselectedCategory={selectedCategory}
          onSuccess={() => {
            setIsUtilityModalOpen(false);
            setSelectedCategory(null);
            refreshData();
          }}
        />
      </Modal>
    </Layout>
  );
};

export default MonthlyConsumption;
