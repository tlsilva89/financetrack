import React, { useEffect, useState, useCallback, Suspense, lazy } from "react";
import Layout from "../components/layout/Layout";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/Modal";
import CreditCardForm from "../components/forms/CreditCardForm";
import PlannedExpenseForm from "../components/forms/PlannedExpenseForm";
import IncomeForm from "../components/forms/IncomeForm";
import FadeIn from "../components/common/FadeIn";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import CreditCardTable from "../components/dashboard/CreditCardTable";
import PlannedExpensesTable from "../components/dashboard/PlannedExpensesTable";
import IncomeTable from "../components/dashboard/IncomeTable";

// Importação de ícones
import {
  FiCreditCard,
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
  FiCalendar,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiActivity,
  FiRefreshCw,
  FiFilter,
} from "react-icons/fi";

// Carregamento lazy dos componentes pesados
const ExpensesChart = lazy(
  () => import("../components/dashboard/ExpensesChart")
);
const MonthlyComparison = lazy(
  () => import("../components/dashboard/MonthlyComparison")
);

// Definição das interfaces para tipagem
interface CreditCard {
  id: string;
  name: string;
  bank: string;
  amount: number;
  month: string;
  previousMonthAmount?: number;
}

interface PlannedExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
}

interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  formattedDate?: string;
  category: string;
}

// Função para formatar data no padrão brasileiro
const formatDateToBrazilian = (dateStr: string): string => {
  try {
    // Verifica se a data está no formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const date = parse(dateStr, "yyyy-MM-dd", new Date());
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    }
    return dateStr; // Retorna a string original se não estiver no formato esperado
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateStr;
  }
};

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});

  // Estados para controlar a abertura/fechamento dos modais
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // Gerar array de meses para o filtro (6 meses anteriores até o atual)
  const generateMonthOptions = useCallback(() => {
    const options = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7);
      options.push({
        value: monthStr,
        label: format(date, "MMMM yyyy", { locale: ptBR }),
      });
    }

    return options;
  }, []);

  const monthOptions = generateMonthOptions();

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
      // Buscar dados do mês selecionado
      const cardsSnapshot = await getDocs(
        query(
          collection(db, `users/${currentUser.uid}/creditCards`),
          where("month", "==", selectedMonth)
        )
      );

      const expensesSnapshot = await getDocs(
        collection(db, `users/${currentUser.uid}/plannedExpenses`)
      );

      const incomesSnapshot = await getDocs(
        collection(db, `users/${currentUser.uid}/incomes`)
      );

      // Processar dados
      const cardsData = cardsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as CreditCard)
      );

      const expensesData = expensesSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as PlannedExpense)
      );

      // Processar dados de entradas e formatar as datas
      const incomesData = incomesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          formattedDate: formatDateToBrazilian(data.date),
        } as Income;
      });

      // Calcular total de entradas
      const totalIncomeAmount = incomesData.reduce(
        (sum, income) => sum + income.amount,
        0
      );

      // Buscar dados históricos para comparação mensal
      const historicalData: Record<string, number> = {};

      for (const month of monthOptions) {
        const historicalCardsSnapshot = await getDocs(
          query(
            collection(db, `users/${currentUser.uid}/creditCards`),
            where("month", "==", month.value)
          )
        );

        const monthlyTotal = historicalCardsSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );

        historicalData[month.value] = monthlyTotal;
      }

      // Limpar timer se os dados carregaram rapidamente
      if (loadingTimer) clearTimeout(loadingTimer);

      setCreditCards(cardsData);
      setPlannedExpenses(expensesData);
      setIncomes(incomesData);
      setTotalIncome(totalIncomeAmount);
      setMonthlyData(historicalData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      if (loadingTimer) clearTimeout(loadingTimer);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedMonth, monthOptions, isReady]);

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

  // Evitar flickering ao mudar o mês selecionado
  const handleMonthChange = (newMonth: string) => {
    // Não mostrar o estado de carregamento imediatamente
    setSelectedMonth(newMonth);
  };

  if (loading && !isReady) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-neon-purple flex flex-col items-center">
            <FiRefreshCw className="animate-spin h-10 w-10 mb-3" />
            <span>Carregando dados financeiros...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FadeIn duration={400}>
        <div className="space-y-6">
          {/* Cabeçalho com título e filtro de mês */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FiActivity className="mr-2 text-neon-purple" />
              Dashboard Financeiro
            </h1>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-gray-300" />
                <label htmlFor="month-select" className="mr-2 text-gray-300">
                  Mês:
                </label>
                <div className="relative">
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="bg-dark-bg border border-gray-600 text-white rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-neon-purple appearance-none"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsCardModalOpen(true)}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-md hover:bg-neon-purple/30 transition-colors flex items-center"
                >
                  <FiCreditCard className="h-4 w-4 mr-1" />
                  Cartão
                </button>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-md hover:bg-neon-purple/30 transition-colors flex items-center"
                >
                  <FiArrowDownCircle className="h-4 w-4 mr-1" />
                  Despesa
                </button>
                <button
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-md hover:bg-neon-purple/30 transition-colors flex items-center"
                >
                  <FiArrowUpCircle className="h-4 w-4 mr-1" />
                  Entrada
                </button>
              </div>
            </div>
          </div>

          {/* Resumo financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30 flex flex-col items-center justify-center">
              <div className="flex items-center mb-1">
                <FiArrowUpCircle className="text-green-400 mr-2" />
                <h3 className="text-gray-400">Entradas</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                R${" "}
                {totalIncome.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30 flex flex-col items-center justify-center">
              <div className="flex items-center mb-1">
                <FiArrowDownCircle className="text-red-400 mr-2" />
                <h3 className="text-gray-400">Despesas Totais</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                R${" "}
                {calculateTotalExpenses(
                  creditCards,
                  plannedExpenses
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30 flex flex-col items-center justify-center">
              <div className="flex items-center mb-1">
                <FiDollarSign
                  className={`${
                    totalIncome -
                      calculateTotalExpenses(creditCards, plannedExpenses) >=
                    0
                      ? "text-green-400"
                      : "text-red-400"
                  } mr-2`}
                />
                <h3 className="text-gray-400">Saldo</h3>
              </div>
              <p
                className={`text-3xl font-bold ${
                  totalIncome -
                    calculateTotalExpenses(creditCards, plannedExpenses) >=
                  0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                R${" "}
                {(
                  totalIncome -
                  calculateTotalExpenses(creditCards, plannedExpenses)
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FiPieChart className="mr-2 text-neon-purple" />
                  Distribuição de Despesas
                </h2>
                <div className="h-80">
                  <Suspense
                    fallback={
                      <div className="h-full flex items-center justify-center">
                        <div className="text-neon-purple/50">
                          Carregando gráfico...
                        </div>
                      </div>
                    }
                  >
                    <ExpensesChart
                      creditCards={creditCards}
                      plannedExpenses={plannedExpenses}
                    />
                  </Suspense>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-dark-surface p-6 rounded-xl shadow-lg border border-neon-purple/30">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FiBarChart2 className="mr-2 text-neon-purple" />
                  Comparativo Mensal
                </h2>
                <div className="h-64">
                  <Suspense
                    fallback={
                      <div className="h-full flex items-center justify-center">
                        <div className="text-neon-purple/50">
                          Carregando gráfico...
                        </div>
                      </div>
                    }
                  >
                    <MonthlyComparison data={monthlyData} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>

          {/* Tabelas de despesas lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditCardTable
              cards={creditCards}
              onRefresh={refreshData}
              currentUser={currentUser}
            />

            <PlannedExpensesTable
              expenses={plannedExpenses}
              onRefresh={refreshData}
              currentUser={currentUser}
            />
          </div>

          {/* Entradas de renda */}
          <div>
            <IncomeTable
              incomes={incomes}
              onRefresh={refreshData}
              currentUser={currentUser}
            />
          </div>
        </div>
      </FadeIn>

      {/* Modais para adicionar/editar itens */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title="Adicionar Cartão de Crédito"
      >
        <CreditCardForm
          onSuccess={() => {
            setIsCardModalOpen(false);
            refreshData();
          }}
        />
      </Modal>

      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Adicionar Despesa Programada"
      >
        <PlannedExpenseForm
          onSuccess={() => {
            setIsExpenseModalOpen(false);
            refreshData();
          }}
        />
      </Modal>

      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Adicionar Nova Entrada"
      >
        <IncomeForm
          onSuccess={() => {
            setIsIncomeModalOpen(false);
            refreshData();
          }}
        />
      </Modal>
    </Layout>
  );
};

// Função auxiliar para calcular o total de despesas com tipagem adequada
const calculateTotalExpenses = (
  cards: CreditCard[],
  expenses: PlannedExpense[]
): number => {
  const cardTotal = cards.reduce(
    (sum: number, card: CreditCard) => sum + card.amount,
    0
  );
  const expensesTotal = expenses.reduce(
    (sum: number, expense: PlannedExpense) => sum + expense.amount,
    0
  );
  return cardTotal + expensesTotal;
};

export default Dashboard;
