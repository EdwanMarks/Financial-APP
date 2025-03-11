// Inicialização do dashboard financeiro com animações e interações
document.addEventListener('DOMContentLoaded', function() {
  // ===== Inicialização de Variáveis Globais =====
  let transactions = [];
  let categories = [];
  let currentPeriod = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    showAllMonths: false
  };

  // Elementos da interface
  const totalIncomeElement = document.getElementById('totalIncome');
  const totalExpensesElement = document.getElementById('totalExpenses');
  const totalBalanceElement = document.getElementById('totalBalance');
  const balanceTitleElement = document.getElementById('balanceTitle');
  const balanceIconElement = document.getElementById('balanceIcon');
  const currentPeriodElement = document.getElementById('currentPeriod');
  const transactionsTableBody = document.getElementById('transactionsBody');
  const categoriesTableBody = document.getElementById('categoriesTableBody');
  const yearSelectorElement = document.getElementById('yearSelector');
  const noTransactionsElement = document.getElementById('noTransactions');
  const noCategoriesMessage = document.getElementById('noCategoriesMessage');
  const noDataChartElement = document.getElementById('noDataChart');

  // Modals e Forms
  const incomeForm = document.getElementById('incomeForm');
  const expenseForm = document.getElementById('expenseForm');
  const categoryForm = document.getElementById('categoryForm');
  const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
  const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));

  // Toast para notificações
  const toast = new bootstrap.Toast(document.getElementById('toast'), {
    delay: 3000
  });

  // Inicializar chart.js
  let categoryChart;
  const ctx = document.getElementById('categoryChart').getContext('2d');

  // Carregar preferências do usuário
  loadUserPreferences();

  // Carregar dados
  initializeData();

  // Inicializar seletores e filtros
  initializeSelectors();

  // Inicializar eventos
  initializeEventListeners();

  // ===== Funções de Inicialização =====

  // Carregar preferências do usuário (nome, etc)
  function loadUserPreferences() {
    const userName = localStorage.getItem('usuarioNome');
    if (userName) {
      document.getElementById('userNameSpan').textContent = userName;
    }

    // Definir data atual para campos de data
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;

    // Definir ano atual para o seletor de ano
    yearSelectorElement.value = new Date().getFullYear();
  }

  // Inicializar dados do localStorage ou usar dados de exemplo
  function initializeData() {
    // Carregar transações do localStorage ou criar dados de exemplo
    const savedTransactions = localStorage.getItem('transactions');
    transactions = savedTransactions ? JSON.parse(savedTransactions) : createSampleTransactions();

    // Carregar categorias do localStorage ou criar categorias padrão
    const savedCategories = localStorage.getItem('categories');
    categories = savedCategories ? JSON.parse(savedCategories) : createDefaultCategories();

    // Preencher listas de categorias nos formulários
    updateCategorySelects();

    // Atualizar tabela e gráficos
    updateDashboard();
  }

  // Inicializar seletores e filtros
  function initializeSelectors() {
    // Exibir período atual
    updatePeriodDisplay();

    // Preencher seletor de anos
    yearSelectorElement.innerHTML = '';
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 3; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      option.selected = year === currentPeriod.year;
      yearSelectorElement.appendChild(option);
    }
  }

  // Inicializar event listeners
  function initializeEventListeners() {
    // Navegação de períodos
    document.getElementById('prevMonth').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => navigateMonth(1));
    yearSelectorElement.addEventListener('change', function() {
      currentPeriod.year = parseInt(this.value);
      updatePeriodDisplay();
      updateDashboard();
    });

    // Formulários
    incomeForm.addEventListener('submit', handleIncomeSubmit);
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    categoryForm.addEventListener('submit', handleCategorySubmit);

    // Filtros da tabela
    document.querySelectorAll('.dropdown-item[data-filter]').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.dropdown-item[data-filter]').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        filterTransactionsTable(this.dataset.filter);
      });
    });

    // Alternância do gráfico
    document.getElementById('showExpensesChart').addEventListener('click', function() {
      this.classList.add('active');
      document.getElementById('showIncomeChart').classList.remove('active');
      updateChart('expense');
    });

    document.getElementById('showIncomeChart').addEventListener('click', function() {
      this.classList.add('active');
      document.getElementById('showExpensesChart').classList.remove('active');
      updateChart('income');
    });

    // Seleção de ícones na tela de categorias
    document.querySelectorAll('.icon-option').forEach(icon => {
      icon.addEventListener('click', function() {
        document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('categoryIcon').value = this.dataset.icon;
      });
    });

    // Exportação
    document.getElementById('exportPDF').addEventListener('click', exportPDF);
    document.getElementById('exportCSV').addEventListener('click', exportCSV);
    document.getElementById('exportExcel').addEventListener('click', exportExcel);
  }

  // ===== Funções de Gerenciamento de Dados =====

  // Criar transações de exemplo para os últimos 6 meses
  function createSampleTransactions() {
    const currentYear = currentPeriod.year;
    const currentMonth = currentPeriod.month;

    let sampleTransactions = [];

    // Gerar transações para os últimos 6 meses
    for (let m = 0; m < 6; m++) {
      // Calcular o mês para gerar dados
      let targetMonth = currentMonth - m;
      let targetYear = currentYear;

      if (targetMonth < 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      // Transação de salário (todo mês)
      sampleTransactions.push({
        id: generateID(),
        description: 'Salário',
        amount: 3000 + Math.floor(Math.random() * 500), // Variação no salário
        type: 'income',
        category: 'salario',
        date: new Date(targetYear, targetMonth, 5).toISOString().split('T')[0],
        notes: 'Salário mensal'
      });

      // Transação de aluguel (todo mês)
      sampleTransactions.push({
        id: generateID(),
        description: 'Aluguel',
        amount: 1200,
        type: 'expense',
        category: 'moradia',
        date: new Date(targetYear, targetMonth, 10).toISOString().split('T')[0],
        notes: 'Aluguel do apartamento'
      });

      // Transação de supermercado (todo mês, valor variável)
      sampleTransactions.push({
        id: generateID(),
        description: 'Supermercado',
        amount: 300 + Math.floor(Math.random() * 200),
        type: 'expense',
        category: 'alimentacao',
        date: new Date(targetYear, targetMonth, 15).toISOString().split('T')[0],
        notes: 'Compras do mês'
      });

      // Transação de combustível (todo mês)
      sampleTransactions.push({
        id: generateID(),
        description: 'Combustível',
        amount: 180 + Math.floor(Math.random() * 60),
        type: 'expense',
        category: 'transporte',
        date: new Date(targetYear, targetMonth, 25).toISOString().split('T')[0],
        notes: 'Gasolina para o mês'
      });

      // Adicionar transações aleatórias
      // Lazer (50% de chance por mês)
      if (Math.random() > 0.5) {
        sampleTransactions.push({
          id: generateID(),
          description: 'Cinema',
          amount: 40 + Math.floor(Math.random() * 40),
          type: 'expense',
          category: 'lazer',
          date: new Date(targetYear, targetMonth, 20 + Math.floor(Math.random() * 8)).toISOString().split('T')[0],
          notes: 'Entretenimento'
        });
      }

      // Saúde (30% de chance por mês)
      if (Math.random() > 0.7) {
        sampleTransactions.push({
          id: generateID(),
          description: 'Farmácia',
          amount: 50 + Math.floor(Math.random() * 150),
          type: 'expense',
          category: 'saude',
          date: new Date(targetYear, targetMonth, Math.floor(Math.random() * 28)).toISOString().split('T')[0],
          notes: 'Medicamentos'
        });
      }

      // Educação (uma vez a cada 3 meses)
      if (m % 3 === 0) {
        sampleTransactions.push({
          id: generateID(),
          description: 'Curso Online',
          amount: 100 + Math.floor(Math.random() * 200),
          type: 'expense',
          category: 'educacao',
          date: new Date(targetYear, targetMonth, 15).toISOString().split('T')[0],
          notes: 'Investimento em educação'
        });
      }

      // Renda extra (40% de chance por mês)
      if (Math.random() > 0.6) {
        sampleTransactions.push({
          id: generateID(),
          description: 'Freelance',
          amount: 200 + Math.floor(Math.random() * 800),
          type: 'income',
          category: 'outros',
          date: new Date(targetYear, targetMonth, Math.floor(Math.random() * 28)).toISOString().split('T')[0],
          notes: 'Trabalho extra'
        });
      }
    }

    return sampleTransactions;
  }

  // Criar categorias padrão
  function createDefaultCategories() {
    return [
      // Categorias de receita
      { id: 'salario', name: 'Salário', type: 'receita', color: '#4CAF50', icon: 'fas fa-money-bill-wave', isDefault: true },
      { id: 'investimentos', name: 'Investimentos', type: 'receita', color: '#2196F3', icon: 'fas fa-chart-line', isDefault: true },
      { id: 'vendas', name: 'Vendas', type: 'receita', color: '#9C27B0', icon: 'fas fa-store', isDefault: true },
      { id: 'outros', name: 'Outros', type: 'receita', color: '#607D8B', icon: 'fas fa-ellipsis-h', isDefault: true },

      // Categorias de despesa
      { id: 'alimentacao', name: 'Alimentação', type: 'despesa', color: '#FF5722', icon: 'fas fa-utensils', isDefault: true },
      { id: 'transporte', name: 'Transporte', type: 'despesa', color: '#FF9800', icon: 'fas fa-car', isDefault: true },
      { id: 'moradia', name: 'Moradia', type: 'despesa', color: '#795548', icon: 'fas fa-home', isDefault: true },
      { id: 'saude', name: 'Saúde', type: 'despesa', color: '#F44336', icon: 'fas fa-medkit', isDefault: true },
      { id: 'lazer', name: 'Lazer', type: 'despesa', color: '#9C27B0', icon: 'fas fa-gamepad', isDefault: true },
      { id: 'educacao', name: 'Educação', type: 'despesa', color: '#3F51B5', icon: 'fas fa-graduation-cap', isDefault: true },
      { id: 'outros', name: 'Outros', type: 'despesa', color: '#607D8B', icon: 'fas fa-ellipsis-h', isDefault: true }
    ];
  }

  // Salvar dados no localStorage
  function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  // Atualizar listas de categorias nos formulários
  function updateCategorySelects() {
    const incomeCategory = document.getElementById('incomeCategory');
    const expenseCategory = document.getElementById('expenseCategory');

    // Limpar opções anteriores
    incomeCategory.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
    expenseCategory.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';

    // Adicionar categorias aos selects
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;

      if (category.type === 'receita') {
        incomeCategory.appendChild(option);
      } else if (category.type === 'despesa') {
        expenseCategory.appendChild(option);
      }
    });

    // Atualizar tabela de categorias
    updateCategoriesTable();
  }

  // Atualizar tabela de categorias
  function updateCategoriesTable() {
    if (categoriesTableBody) {
      categoriesTableBody.innerHTML = '';

      // Filtrar apenas categorias personalizadas
      const customCategories = categories.filter(category => !category.isDefault);

      if (customCategories.length === 0) {
        if (noCategoriesMessage) {
          noCategoriesMessage.classList.remove('d-none');
        }
      } else {
        if (noCategoriesMessage) {
          noCategoriesMessage.classList.add('d-none');
        }

        customCategories.forEach(category => {
          const row = document.createElement('tr');

          const nameCell = document.createElement('td');
          nameCell.innerHTML = `<i class="${category.icon}" style="color: ${category.color}"></i> ${category.name}`;

          const typeCell = document.createElement('td');
          typeCell.innerHTML = category.type === 'receita'
            ? '<span class="badge bg-success">Receita</span>'
            : '<span class="badge bg-danger">Despesa</span>';

          const actionCell = document.createElement('td');
          actionCell.className = 'text-end';
          actionCell.innerHTML = `
            <button class="btn btn-sm btn-outline-danger" onclick="removeCategory('${category.id}')">
              <i class="fas fa-trash"></i>
            </button>
          `;

          row.appendChild(nameCell);
          row.appendChild(typeCell);
          row.appendChild(actionCell);

          categoriesTableBody.appendChild(row);
        });
      }
    }
  }

  // ===== Funções de Atualização da Interface =====

  // Atualizar todo o dashboard
  function updateDashboard() {
    updateTransactionsTable();
    updateSummary();
    updateChart('expense'); // Iniciar com gráfico de despesas

    // Atualizar visibilidade do botão de exportação
    const hasData = getFilteredTransactions().length > 0;
    document.getElementById('exportDropdown').disabled = !hasData;

    // Permitir troca entre meses com animação suave
    animatePeriodChange();
  }

  // Adicionar animação na mudança de período
  function animatePeriodChange() {
    const periodElement = document.getElementById('currentPeriod');
    periodElement.classList.add('period-change-animation');
    setTimeout(() => {
      periodElement.classList.remove('period-change-animation');
    }, 500);
  }

  // Recarregar dados do gráfico com animação
  function reloadChartData() {
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.classList.add('chart-reload-animation');
      setTimeout(() => {
        chartContainer.classList.remove('chart-reload-animation');
      }, 800);
    }
  }


  // Atualizar exibição do período atual
  function updatePeriodDisplay() {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    if (currentPeriodElement) {
      currentPeriodElement.textContent = `${months[currentPeriod.month]} ${currentPeriod.year}`;
      console.log(`Período selecionado: ${currentPeriodElement.textContent}`);
    }
  }

  // Navegar entre meses
  function navigateMonth(direction) {
    let newMonth = currentPeriod.month + direction;
    let newYear = currentPeriod.year;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    currentPeriod.month = newMonth;
    currentPeriod.year = newYear;

    yearSelectorElement.value = newYear;

    updatePeriodDisplay();
    updateDashboard();
    reloadChartData();

    // Adicionar efeito de transição
    currentPeriodElement.classList.add('highlight-text');
    setTimeout(() => {
      currentPeriodElement.classList.remove('highlight-text');
    }, 1000);
  }

  // Atualizar resumo financeiro
  function updateSummary() {
    const filteredTransactions = getFilteredTransactions();

    // Calcular totais
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // Atualizar elementos da interface
    totalIncomeElement.textContent = formatCurrency(income);
    totalExpensesElement.textContent = formatCurrency(expenses);
    totalBalanceElement.textContent = formatCurrency(balance);

    // Atualizar cor do saldo baseado no valor
    if (balance < 0) {
      balanceTitleElement.className = 'card-title text-danger';
      totalBalanceElement.className = 'mb-0 text-danger';
      balanceIconElement.className = 'text-danger';
      balanceIconElement.innerHTML = '<i class="fas fa-exclamation-triangle fa-2x"></i>';
    } else {
      balanceTitleElement.className = 'card-title text-primary';
      totalBalanceElement.className = 'mb-0';
      balanceIconElement.className = '';
      balanceIconElement.innerHTML = '<i class="fas fa-wallet fa-2x"></i>';
    }

    // Animação de atualização
    [totalIncomeElement, totalExpensesElement, totalBalanceElement].forEach(el => {
      el.classList.add('highlight-text');
      setTimeout(() => {
        el.classList.remove('highlight-text');
      }, 1000);
    });
  }

  // Atualizar tabela de transações
  function updateTransactionsTable() {
    if (transactionsTableBody) {
      transactionsTableBody.innerHTML = '';

      const filteredTransactions = getFilteredTransactions();

      if (filteredTransactions.length === 0) {
        if (noTransactionsElement) {
          noTransactionsElement.classList.remove('d-none');
        }
        document.getElementById('transactionsTable').classList.add('d-none');
      } else {
        if (noTransactionsElement) {
          noTransactionsElement.classList.add('d-none');
        }
        document.getElementById('transactionsTable').classList.remove('d-none');

        // Ordenar transações por data (mais recentes primeiro)
        filteredTransactions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .forEach(transaction => {
            addTransactionToTable(transaction);
          });
      }
    }
  }

  // Adicionar uma transação à tabela
  function addTransactionToTable(transaction) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', transaction.id);
    row.setAttribute('data-type', transaction.type);

    // Encontrar categoria
    const category = categories.find(c => c.id === transaction.category) || {
      name: 'Outros',
      color: '#607D8B',
      icon: 'fas fa-ellipsis-h'
    };

    // Formatar data
    const date = new Date(transaction.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

    // Criar células
    const descriptionCell = document.createElement('td');
    descriptionCell.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="me-2" data-bs-toggle="tooltip" title="${transaction.notes || 'Sem observações'}">
          <i class="${category.icon}" style="color: ${category.color}"></i>
        </div>
        <span>${transaction.description}</span>
      </div>
    `;

    const categoryCell = document.createElement('td');
    categoryCell.innerHTML = `<span class="badge" style="background-color: ${category.color}">${category.name}</span>`;

    const dateCell = document.createElement('td');
    dateCell.textContent = formattedDate;

    const amountCell = document.createElement('td');
    amountCell.className = 'text-end';
    amountCell.innerHTML = `
      <span class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
        ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
      </span>
    `;

    const actionCell = document.createElement('td');
    actionCell.className = 'text-center';
    actionCell.innerHTML = `
      <button class="btn btn-sm btn-outline-danger" onclick="removeTransaction('${transaction.id}')">
        <i class="fas fa-trash"></i>
      </button>
    `;

    // Adicionar células à linha
    row.appendChild(descriptionCell);
    row.appendChild(categoryCell);
    row.appendChild(dateCell);
    row.appendChild(amountCell);
    row.appendChild(actionCell);

    // Adicionar linha à tabela
    transactionsTableBody.appendChild(row);

    // Inicializar tooltips
    const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Filtrar transações por período
  function getFilteredTransactions() {
    // Se temos um filtro de todos os meses, retornar todas as transações
    if (currentPeriod.showAllMonths) {
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === currentPeriod.year;
      });
    }

    // Caso contrário, filtrar por mês e ano
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentPeriod.month &&
        transactionDate.getFullYear() === currentPeriod.year
      );
    });
  }

  // Filtrar tabela de transações (todas, receitas ou despesas)
  function filterTransactionsTable(filter) {
    const rows = transactionsTableBody.querySelectorAll('tr');

    rows.forEach(row => {
      const type = row.getAttribute('data-type');

      if (filter === 'all' || filter === type) {
        row.classList.remove('d-none');
      } else {
        row.classList.add('d-none');
      }
    });
  }

  // Atualizar gráfico de categorias
  function updateChart(type) {
    const filteredTransactions = getFilteredTransactions().filter(t =>
      (type === 'income' && t.type === 'income') ||
      (type === 'expense' && t.type === 'expense')
    );

    // Dados agrupados por categoria
    const categoryData = {};

    // Se não houver transações, mostrar mensagem
    if (filteredTransactions.length === 0) {
      noDataChartElement.classList.remove('d-none');
      return;
    }

    noDataChartElement.classList.add('d-none');

    // Agrupar valores por categoria
    filteredTransactions.forEach(transaction => {
      if (!categoryData[transaction.category]) {
        categoryData[transaction.category] = 0;
      }
      categoryData[transaction.category] += transaction.amount;
    });

    // Preparar dados para o gráfico
    const labels = [];
    const data = [];
    const backgroundColor = [];

    for (const categoryId in categoryData) {
      const category = categories.find(c => c.id === categoryId) || {
        name: 'Outros',
        color: '#607D8B'
      };

      labels.push(category.name);
      data.push(categoryData[categoryId]);
      backgroundColor.push(category.color);
    }

    // Destruir gráfico anterior se existir
    if (categoryChart) {
      categoryChart.destroy();
    }

    // Criar novo gráfico
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return ` ${formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true
        }
      }
    });
  }

  // ===== Manipuladores de Eventos =====

  // Adicionar nova receita
  function handleIncomeSubmit(e) {
    e.preventDefault();

    const description = document.getElementById('incomeDescription').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const category = document.getElementById('incomeCategory').value;
    const date = document.getElementById('incomeDate').value;
    const notes = document.getElementById('incomeNotes').value;

    const newTransaction = {
      id: generateID(),
      description,
      amount,
      type: 'income',
      category,
      date,
      notes
    };

    transactions.push(newTransaction);
    saveData();

    // Resetar formulário
    incomeForm.reset();

    // Definir data para o dia atual
    document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];

    // Fechar modal
    transactionModal.hide();

    // Atualizar dashboard
    updateDashboard();
    reloadChartData();

    // Mostrar notificação
    showToast('success', 'Receita adicionada', 'Receita adicionada com sucesso!');

    console.log('Nova receita:', newTransaction);
  }

  // Adicionar nova despesa
  function handleExpenseSubmit(e) {
    e.preventDefault();

    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;
    const notes = document.getElementById('expenseNotes').value;

    const newTransaction = {
      id: generateID(),
      description,
      amount,
      type: 'expense',
      category,
      date,
      notes
    };

    transactions.push(newTransaction);
    saveData();

    // Resetar formulário
    expenseForm.reset();

    // Definir data para o dia atual
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];

    // Fechar modal
    transactionModal.hide();

    // Atualizar dashboard
    updateDashboard();
    reloadChartData();

    // Mostrar notificação
    showToast('danger', 'Despesa adicionada', 'Despesa adicionada com sucesso!');

    console.log('Nova despesa:', newTransaction);
  }

  // Adicionar nova categoria
  function handleCategorySubmit(e) {
    e.preventDefault();

    const name = document.getElementById('categoryName').value;
    const type = document.querySelector('input[name="categoryType"]:checked').value;
    const color = document.getElementById('categoryColor').value;
    const icon = document.getElementById('categoryIcon').value;

    // Criar ID baseado no nome
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const newCategory = {
      id,
      name,
      type,
      color,
      icon,
      isDefault: false
    };

    categories.push(newCategory);
    saveData();

    // Resetar formulário
    categoryForm.reset();
    document.getElementById('categoryColor').value = '#4361ee';
    document.getElementById('categoryTypeIncome').checked = true;

    // Atualizar selects de categorias
    updateCategorySelects();

    // Fechar modal e voltar para a aba de lista
    document.getElementById('category-list-tab').click();

    // Mostrar notificação
    showToast('primary', 'Categoria adicionada', 'Categoria adicionada com sucesso!');

    console.log('Nova categoria:', newCategory);
  }

  // ===== Funções Utilitárias =====

  // Gerar ID único
  function generateID() {
    return 'id' + Math.random().toString(36).substring(2, 9);
  }

  // Formatar valor como moeda
  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Mostrar notificação toast
  function showToast(type, title, message) {
    const toastElement = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    // Definir ícone baseado no tipo
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    if (type === 'danger') iconClass = 'fas fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
    if (type === 'primary') iconClass = 'fas fa-star';

    // Atualizar conteúdo
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toastIcon.className = iconClass + ' me-2';

    // Remover classes de cor anteriores
    toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-primary');

    // Mostrar toast
    const toast = bootstrap.Toast.getInstance(toastElement);
    toast.show();
  }
});

// Funções globais para acesso a partir dos botões da tabela
function removeTransaction(id) {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const transaction = transactions.find(t => t.id === id);

  if (transaction) {
    console.log('Excluindo transação: ' + transaction.description);

    // Encontrar o índice da transação e removê-la
    const index = transactions.findIndex(t => t.id === id);
    transactions.splice(index, 1);

    // Salvar no localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Remover a linha da tabela com animação
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.style.transition = 'opacity 0.3s, transform 0.3s';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';

      setTimeout(() => {
        row.remove();

        // Verificar se a tabela está vazia
        const rows = document.getElementById('transactionsBody').querySelectorAll('tr:not(.d-none)');
        if (rows.length === 0) {
          document.getElementById('noTransactions').classList.remove('d-none');
          document.getElementById('transactionsTable').classList.add('d-none');
        }

        // Atualizar resumo e gráfico
        updateDashboardAfterChange();

        // Mostrar notificação
        showToastNotification('warning', 'Transação removida', 'Transação removida com sucesso!');
      }, 300);
    }
  }
}

function removeCategory(id) {
  const categories = JSON.parse(localStorage.getItem('categories')) || [];
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  // Verificar se a categoria é usada em alguma transação
  const isInUse = transactions.some(t => t.category === id);

  if (isInUse) {
    showToastNotification('warning', 'Ação não permitida', 'Esta categoria está sendo usada em transações e não pode ser removida.');
    return;
  }

  // Encontrar o índice da categoria e removê-la
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories.splice(index, 1);

    // Salvar no localStorage
    localStorage.setItem('categories', JSON.stringify(categories));

    // Atualizar interface
    const row = document.querySelector(`#categoriesTableBody tr:nth-child(${index + 1})`);
    if (row) {
      row.style.transition = 'opacity 0.3s, transform 0.3s';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';

      setTimeout(() => {
        // Recarregar a página para atualizar as listas
        location.reload();
      }, 300);
    }
  }
}

// Função de atualização do dashboard após alterações
function updateDashboardAfterChange() {
  // Recalcular totais
  updateSummary();

  // Atualizar gráfico
  const showingExpenses = document.getElementById('showExpensesChart').classList.contains('active');
  updateChart(showingExpenses ? 'expense' : 'income');
}

// Função para atualizar o resumo após alterações
function updateSummary() {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  // Obter o período atual
  const currentPeriodElement = document.getElementById('currentPeriod');
  const currentPeriodText = currentPeriodElement.textContent;
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthName = currentPeriodText.split(' ')[0];
  const year = parseInt(currentPeriodText.split(' ')[1]);
  const month = months.indexOf(monthName);

  // Filtrar transações do período
  const filteredTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  // Calcular totais
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  // Atualizar elementos da interface
  document.getElementById('totalIncome').textContent = formatCurrency(income);
  document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
  document.getElementById('totalBalance').textContent = formatCurrency(balance);

  // Atualizar cor do saldo baseado no valor
  const balanceTitleElement = document.getElementById('balanceTitle');
  const totalBalanceElement = document.getElementById('totalBalance');
  const balanceIconElement = document.getElementById('balanceIcon');

  if (balance < 0) {
    balanceTitleElement.className = 'card-title text-danger';
    totalBalanceElement.className = 'mb-0 text-danger';
    balanceIconElement.className = 'text-danger';
    balanceIconElement.innerHTML = '<i class="fas fa-exclamation-triangle fa-2x"></i>';
  } else {
    balanceTitleElement.className = 'card-title text-primary';
    totalBalanceElement.className = 'mb-0';
    balanceIconElement.className = '';
    balanceIconElement.innerHTML = '<i class="fas fa-wallet fa-2x"></i>';
  }

  // Animação de atualização
  [document.getElementById('totalIncome'), document.getElementById('totalExpenses'), document.getElementById('totalBalance')].forEach(el => {
    el.classList.add('highlight-text');
    setTimeout(() => {
      el.classList.remove('highlight-text');
    }, 1000);
  });
}

// Função para atualizar o gráfico após alterações
function updateChart(type) {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const categories = JSON.parse(localStorage.getItem('categories')) || [];

  // Obter o período atual
  const currentPeriodElement = document.getElementById('currentPeriod');
  const currentPeriodText = currentPeriodElement.textContent;
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthName = currentPeriodText.split(' ')[0];
  const year = parseInt(currentPeriodText.split(' ')[1]);
  const month = months.indexOf(monthName);

  // Filtrar transações do período e tipo
  const filteredTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.getMonth() === month &&
           date.getFullYear() === year &&
           ((type === 'income' && transaction.type === 'income') ||
            (type === 'expense' && transaction.type === 'expense'));
  });

  // Obter canvas e contexto
  const ctx = document.getElementById('categoryChart').getContext('2d');

  // Se não houver transações, mostrar mensagem
  if (filteredTransactions.length === 0) {
    document.getElementById('noDataChart').classList.remove('d-none');
    return;
  }

  document.getElementById('noDataChart').classList.add('d-none');

  // Dados agrupados por categoria
  const categoryData = {};

  // Agrupar valores por categoria
  filteredTransactions.forEach(transaction => {
    if (!categoryData[transaction.category]) {
      categoryData[transaction.category] = 0;
    }
    categoryData[transaction.category] += transaction.amount;
  });

  // Preparar dados para o gráfico
  const labels = [];
  const data = [];
  const backgroundColor = [];

  for (const categoryId in categoryData) {
    const category = categories.find(c => c.id === categoryId) || {
      name: 'Outros',
      color: '#607D8B'
    };

    labels.push(category.name);
    data.push(categoryData[categoryId]);
    backgroundColor.push(category.color);
  }

  // Verificar se já existe uma instância do gráfico
  if (window.categoryChartInstance) {
    window.categoryChartInstance.destroy();
  }

  // Criar novo gráfico
  window.categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColor,
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 15,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return ` ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
}

// Função para formatar valor como moeda
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para mostrar notificações toast
function showToastNotification(type, title, message) {
  const toastElement = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  // Definir ícone baseado no tipo
  let iconClass = 'fas fa-info-circle';
  if (type === 'success') iconClass = 'fas fa-check-circle';
  if (type === 'danger') iconClass = 'fas fa-exclamation-circle';
  if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
  if (type === 'primary') iconClass = 'fas fa-star';

  // Atualizar conteúdo
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toastIcon.className = iconClass + ' me-2';

  // Mostrar toast
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}