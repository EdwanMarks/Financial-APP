
// Funções para exportação de relatórios financeiros
const exportPDF = function() {
  // Obter dados necessários
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const categories = JSON.parse(localStorage.getItem('categories')) || [];
  const userName = localStorage.getItem('usuarioNome') || 'Usuário';
  
  // Obter o período atual
  const currentPeriod = document.getElementById('currentPeriod').textContent;
  
  // Filtrar transações do período
  const filteredTransactions = filterTransactionsByPeriod(transactions, currentPeriod);
  
  // Calcular totais
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;
  
  // Agrupar transações por tipo e categoria
  const incomeByCategory = groupTransactionsByCategory(filteredTransactions.filter(t => t.type === 'income'), categories);
  const expensesByCategory = groupTransactionsByCategory(filteredTransactions.filter(t => t.type === 'expense'), categories);
  
  // Criar o conteúdo do documento PDF
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    info: {
      title: `Relatório Financeiro - ${currentPeriod}`,
      author: 'FinanceApp',
      subject: 'Relatório Financeiro',
      creator: 'FinanceApp'
    },
    header: function() {
      return {
        columns: [
          {
            text: 'Relatório Financeiro',
            alignment: 'right',
            margin: [0, 20, 40, 0],
            fontSize: 16,
            bold: true,
            color: '#4361ee'
          }
        ]
      };
    },
    footer: function(currentPage, pageCount) {
      return {
        columns: [
          {
            text: `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            alignment: 'left',
            margin: [40, 0, 0, 0],
            fontSize: 8,
            color: '#777'
          },
          {
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: 'right',
            margin: [0, 0, 40, 0],
            fontSize: 8,
            color: '#777'
          }
        ]
      };
    },
    content: [
      // Cabeçalho do relatório
      {
        stack: [
          {
            text: `Relatório Financeiro - ${currentPeriod}`,
            style: 'header',
            alignment: 'center',
            color: '#333'
          },
          {
            text: `Usuário: ${userName}`,
            style: 'subheader',
            alignment: 'center',
            color: '#666'
          }
        ],
        margin: [0, 0, 0, 20],
        className: 'pdf-header'
      },
      
      // Resumo Financeiro
      {
        stack: [
          { 
            text: 'Resumo Financeiro',
            style: 'sectionHeader'
          },
          {
            columns: [
              {
                stack: [
                  { text: 'Receitas', style: 'label', color: '#4CAF50' },
                  { text: formatCurrency(income), style: 'value', color: '#4CAF50' },
                ],
                width: '*'
              },
              {
                stack: [
                  { text: 'Despesas', style: 'label', color: '#F44336' },
                  { text: formatCurrency(expenses), style: 'value', color: '#F44336' },
                ],
                width: '*'
              },
              {
                stack: [
                  { text: 'Saldo', style: 'label', color: balance >= 0 ? '#2196F3' : '#F44336' },
                  { text: formatCurrency(balance), style: 'value', color: balance >= 0 ? '#2196F3' : '#F44336' },
                ],
                width: '*'
              }
            ]
          }
        ],
        margin: [0, 0, 0, 20],
        className: 'pdf-summary'
      },
      
      // Análise por Categoria
      {
        stack: [
          { 
            text: 'Análise por Categoria',
            style: 'sectionHeader'
          },
          {
            columns: [
              {
                // Receitas por Categoria
                stack: [
                  { text: 'Receitas', style: 'subsectionHeader', color: '#4CAF50' },
                  incomeByCategory.length > 0 
                    ? createCategoriesTable(incomeByCategory, true)
                    : { text: 'Nenhuma receita registrada', style: 'noData' }
                ],
                width: '*',
                margin: [0, 0, 10, 0]
              },
              {
                // Despesas por Categoria
                stack: [
                  { text: 'Despesas', style: 'subsectionHeader', color: '#F44336' },
                  expensesByCategory.length > 0 
                    ? createCategoriesTable(expensesByCategory, false)
                    : { text: 'Nenhuma despesa registrada', style: 'noData' }
                ],
                width: '*',
                margin: [10, 0, 0, 0]
              }
            ]
          }
        ],
        margin: [0, 0, 0, 20],
        className: 'pdf-categories'
      },
      
      // Lista de Transações
      {
        stack: [
          { 
            text: 'Lista de Transações',
            style: 'sectionHeader'
          },
          filteredTransactions.length > 0
            ? createTransactionsTable(filteredTransactions, categories)
            : { text: 'Nenhuma transação registrada no período', style: 'noData' }
        ],
        className: 'pdf-transactions'
      }
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 14,
        margin: [0, 0, 0, 20]
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 10],
        color: '#4361ee',
        decoration: 'underline',
        decorationStyle: 'solid',
        decorationColor: '#e0e0e0'
      },
      subsectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      label: {
        fontSize: 12,
        margin: [0, 0, 0, 5]
      },
      value: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      noData: {
        fontSize: 12,
        italic: true,
        color: '#888',
        alignment: 'center',
        margin: [0, 10, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: '#333'
      }
    }
  };
  
  // Notificar o usuário de que o relatório está sendo gerado
  showToast('info', 'Gerando relatório', 'Seu relatório PDF está sendo gerado...');
  
  // Gerar o PDF usando pdfmake (CDN)
  if (typeof pdfMake !== 'undefined') {
    // Abrir o PDF em uma nova aba
    pdfMake.createPdf(docDefinition).open();
  } else {
    // Carregar a biblioteca pdfmake se não estiver disponível
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js', function() {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js', function() {
        pdfMake.createPdf(docDefinition).open();
      });
    });
  }
};

// Exportar para CSV
const exportCSV = function() {
  // Obter dados necessários
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const categories = JSON.parse(localStorage.getItem('categories')) || [];
  
  // Obter o período atual
  const currentPeriod = document.getElementById('currentPeriod').textContent;
  
  // Filtrar transações do período
  const filteredTransactions = filterTransactionsByPeriod(transactions, currentPeriod);
  
  if (filteredTransactions.length === 0) {
    showToast('warning', 'Sem dados', 'Não há transações no período selecionado para exportar.');
    return;
  }
  
  // Cabeçalho do CSV
  let csvContent = 'Data,Descrição,Categoria,Tipo,Valor,Observações\n';
  
  // Adicionar cada transação
  filteredTransactions.forEach(transaction => {
    const category = categories.find(c => c.id === transaction.category) || { name: 'Outros' };
    const date = new Date(transaction.date).toLocaleDateString('pt-BR');
    const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
    const amount = transaction.amount.toString().replace('.', ',');
    
    // Escapar campos que possam conter vírgulas
    const description = `"${transaction.description}"`;
    const notes = `"${transaction.notes || ''}"`;
    
    // Adicionar linha ao CSV
    csvContent += `${date},${description},${category.name},${type},${amount},${notes}\n`;
  });
  
  // Converter para Blob e criar URL
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Criar link de download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `relatorio_financeiro_${currentPeriod.replace(' ', '_')}.csv`);
  document.body.appendChild(link);
  
  // Disparar o download
  link.click();
  
  // Limpar
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Notificar o usuário
  showToast('success', 'CSV exportado', 'Seu arquivo CSV foi baixado com sucesso!');
};

// Exportar para Excel
const exportExcel = function() {
  // Obter dados necessários
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const categories = JSON.parse(localStorage.getItem('categories')) || [];
  
  // Obter o período atual
  const currentPeriod = document.getElementById('currentPeriod').textContent;
  
  // Filtrar transações do período
  const filteredTransactions = filterTransactionsByPeriod(transactions, currentPeriod);
  
  if (filteredTransactions.length === 0) {
    showToast('warning', 'Sem dados', 'Não há transações no período selecionado para exportar.');
    return;
  }
  
  // Calcular totais
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;
  
  // Preparar dados para SheetJS
  const wsData = [
    ['Relatório Financeiro - ' + currentPeriod],
    ['Gerado em ' + new Date().toLocaleDateString('pt-BR')],
    [''],
    ['Resumo'],
    ['Receitas', formatCurrency(income)],
    ['Despesas', formatCurrency(expenses)],
    ['Saldo', formatCurrency(balance)],
    [''],
    ['Lista de Transações'],
    ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Observações']
  ];
  
  // Adicionar cada transação
  filteredTransactions.forEach(transaction => {
    const category = categories.find(c => c.id === transaction.category) || { name: 'Outros' };
    const date = new Date(transaction.date).toLocaleDateString('pt-BR');
    const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
    
    wsData.push([
      date,
      transaction.description,
      category.name,
      type,
      transaction.amount,
      transaction.notes || ''
    ]);
  });
  
  // Notificar o usuário
  showToast('info', 'Gerando Excel', 'Seu relatório Excel está sendo gerado...');
  
  // Usar SheetJS (xlsx) para gerar o arquivo Excel
  if (typeof XLSX === 'undefined') {
    loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', function() {
      generateExcelFile(wsData, currentPeriod);
    });
  } else {
    generateExcelFile(wsData, currentPeriod);
  }
};

// ===== Funções Auxiliares =====

// Filtrar transações por período
function filterTransactionsByPeriod(transactions, periodText) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthName = periodText.split(' ')[0];
  const year = parseInt(periodText.split(' ')[1]);
  const month = months.indexOf(monthName);
  
  return transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

// Agrupar transações por categoria
function groupTransactionsByCategory(transactions, categories) {
  const result = [];
  const grouped = {};
  
  transactions.forEach(transaction => {
    if (!grouped[transaction.category]) {
      grouped[transaction.category] = 0;
    }
    grouped[transaction.category] += transaction.amount;
  });
  
  for (const categoryId in grouped) {
    const category = categories.find(c => c.id === categoryId) || {
      name: 'Outros',
      color: '#607D8B'
    };
    
    result.push({
      category: category.name,
      amount: grouped[categoryId]
    });
  }
  
  // Ordenar por valor (maior para menor)
  return result.sort((a, b) => b.amount - a.amount);
}

// Criar tabela de categorias para o PDF
function createCategoriesTable(categoryData, isIncome) {
  const total = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  
  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto'],
      body: [
        [
          { text: 'Categoria', style: 'tableHeader' },
          { text: 'Valor', style: 'tableHeader', alignment: 'right' },
          { text: '%', style: 'tableHeader', alignment: 'right' }
        ],
        ...categoryData.map(cat => [
          cat.category,
          { text: formatCurrency(cat.amount), alignment: 'right' },
          { text: `${Math.round((cat.amount / total) * 100)}%`, alignment: 'right' }
        ]),
        [
          { text: 'Total', style: 'tableHeader' },
          { text: formatCurrency(total), style: 'tableHeader', alignment: 'right' },
          { text: '100%', style: 'tableHeader', alignment: 'right' }
        ]
      ]
    },
    layout: {
      fillColor: function(rowIndex) {
        return rowIndex === 0 || rowIndex === categoryData.length + 1 ? '#f5f5f5' : null;
      },
      hLineWidth: function(i, node) {
        return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
      },
      vLineWidth: function(i) {
        return 0;
      },
      hLineColor: function(i, node) {
        return i === 0 || i === 1 || i === node.table.body.length ? '#e0e0e0' : '#eeeeee';
      }
    }
  };
}

// Criar tabela de transações para o PDF
function createTransactionsTable(transactions, categories) {
  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return {
    table: {
      headerRows: 1,
      widths: ['auto', '*', 'auto', 'auto', 'auto'],
      body: [
        [
          { text: 'Data', style: 'tableHeader' },
          { text: 'Descrição', style: 'tableHeader' },
          { text: 'Categoria', style: 'tableHeader' },
          { text: 'Tipo', style: 'tableHeader' },
          { text: 'Valor', style: 'tableHeader', alignment: 'right' }
        ],
        ...sortedTransactions.map(transaction => {
          const category = categories.find(c => c.id === transaction.category) || { name: 'Outros' };
          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
          const color = transaction.type === 'income' ? '#4CAF50' : '#F44336';
          
          return [
            date,
            { text: transaction.description, margin: [0, 0, 0, transaction.notes ? 0 : 3] },
            category.name,
            { text: type, color: color },
            { 
              text: formatCurrency(transaction.amount), 
              color: color,
              alignment: 'right'
            }
          ];
        })
      ]
    },
    layout: {
      fillColor: function(rowIndex) {
        return rowIndex === 0 ? '#f5f5f5' : null;
      },
      hLineWidth: function(i) {
        return i === 0 || i === 1 ? 1 : 0.5;
      },
      vLineWidth: function() {
        return 0;
      },
      hLineColor: function(i) {
        return i === 0 || i === 1 ? '#e0e0e0' : '#eeeeee';
      }
    }
  };
}

// Gerar arquivo Excel com SheetJS
function generateExcelFile(wsData, periodText) {
  // Criar uma nova planilha
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Adicionar estilos (limitado no formato xlsx)
  const mergeConfig = { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } };
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push(mergeConfig);
  
  // Definir larguras de coluna
  ws['!cols'] = [
    { wch: 12 }, // Data
    { wch: 30 }, // Descrição
    { wch: 15 }, // Categoria
    { wch: 10 }, // Tipo
    { wch: 15 }, // Valor
    { wch: 30 }  // Observações
  ];
  
  // Adicionar a planilha ao livro
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');
  
  // Gerar o arquivo e iniciar o download
  XLSX.writeFile(wb, `relatorio_financeiro_${periodText.replace(' ', '_')}.xlsx`);
  
  // Notificar o usuário
  showToast('success', 'Excel exportado', 'Seu arquivo Excel foi baixado com sucesso!');
}

// Carregar script dinamicamente
function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
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
  if (type === 'danger' || type === 'error') iconClass = 'fas fa-exclamation-circle';
  if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
  
  // Atualizar conteúdo
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toastIcon.className = iconClass + ' me-2';
  
  // Mostrar toast
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}
