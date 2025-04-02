document.addEventListener('DOMContentLoaded', function() {
  // Initialize the app
  initApp();
  
  // Form submission
  const transactionForm = document.getElementById('transaction-form');
  transactionForm.addEventListener('submit', addTransaction);
  
  // Filter controls
  const filterType = document.getElementById('filter-type');
  const filterMonth = document.getElementById('filter-month');
  
  filterType.addEventListener('change', filterTransactions);
  filterMonth.addEventListener('change', filterTransactions);
  
  // Set default date to today
  document.getElementById('date').valueAsDate = new Date();
});

// Initialize the app
function initApp() {
  // Load transactions from localStorage
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  
  // Update UI
  updateBalance(transactions);
  renderTransactions(transactions);
}

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();
  
  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const date = document.getElementById('date').value;
  
  if (!description || isNaN(amount)) {
      alert('Please fill in all fields correctly');
      return;
  }
  
  const transaction = {
      id: generateId(),
      description,
      amount,
      type,
      date
  };
  
  // Get current transactions
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  
  // Add new transaction
  transactions.push(transaction);
  
  // Save to localStorage
  localStorage.setItem('transactions', JSON.stringify(transactions));
  
  // Update UI
  updateBalance(transactions);
  renderTransactions(transactions);
  
  // Reset form
  document.getElementById('transaction-form').reset();
  document.getElementById('date').valueAsDate = new Date();
}

// Generate unique ID for transactions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Update balance, income, and expense totals
function updateBalance(transactions) {
  const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = totalIncome - totalExpense;
  
  document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
  document.getElementById('total-income').textContent = formatCurrency(totalIncome);
  document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
}

// Format currency
function formatCurrency(amount) {
  return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Render transactions list
function renderTransactions(transactions) {
  const transactionsList = document.getElementById('transactions-list');
  
  if (transactions.length === 0) {
      transactionsList.innerHTML = '<p class="empty-message">No transactions yet. Add one to get started!</p>';
      return;
  }
  
  // Sort by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let html = '';
  
  transactions.forEach(transaction => {
      html += `
          <div class="transaction-item">
              <div class="transaction-info">
                  <div class="transaction-description">${transaction.description}</div>
                  <div class="transaction-date">${formatDate(transaction.date)}</div>
              </div>
              <div class="transaction-amount ${transaction.type}">
                  ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
              </div>
              <div class="transaction-actions">
                  <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </div>
      `;
  });
  
  transactionsList.innerHTML = html;
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Delete a transaction
function deleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;
  
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions = transactions.filter(t => t.id !== id);
  
  localStorage.setItem('transactions', JSON.stringify(transactions));
  
  updateBalance(transactions);
  renderTransactions(transactions);
}

// Filter transactions by type and month
function filterTransactions() {
  const type = document.getElementById('filter-type').value;
  const month = document.getElementById('filter-month').value;
  
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  
  if (type !== 'all') {
      transactions = transactions.filter(t => t.type === type);
  }
  
  if (month) {
      transactions = transactions.filter(t => t.date.startsWith(month));
  }
  
  renderTransactions(transactions);
}