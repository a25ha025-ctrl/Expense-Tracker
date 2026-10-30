
const STORAGE_KEY = "personal_expense_tracker";

const form = document.getElementById("expenseForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const filterCategory = document.getElementById("filterCategory");
const expenseList = document.getElementById("expenseList");

// Load saved expenses from the browser.
let expenses = [];

try {
  const savedData = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  if (Array.isArray(savedData)) {
    expenses = savedData.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.description === "string" &&
      Number.isSafeInteger(item.amount) &&
      item.amount > 0 &&
      typeof item.category === "string" &&
      typeof item.date === "string"
    );
  }
} catch (error) {
  expenses = [];
}

const chartCanvas = document.getElementById("expenseChart");

const expenseChart = new Chart(chartCanvas, {
  type: "bar",
  data: {
    labels: [
      "Food",
      "Transport",
      "Shopping",
      "Bills",
      "Education",
      "Other"
    ],
    datasets: [{
      label: "Expenses (¥)",
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        "#4a3380",
        "#0c3361",
        "#580530",
        "#7d5c09",
        "#13543c",
        "#5b4c88"
      ],
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (¥)"
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Education",
    "Other"
  ];

  const categoryTotals = categories.map(category =>
    expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
  );

  expenseChart.data.datasets[0].data = categoryTotals;
  expenseChart.update();

// Use today's date as the default.
dateInput.value = [
  new Date().getFullYear(),
  String(new Date().getMonth() + 1).padStart(2, "0"),
  String(new Date().getDate()).padStart(2, "0")
].join("-");

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function yen(amount) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(amount);
}

function renderExpenses() {
  const selectedCategory = filterCategory.value;
  const visibleExpenses = expenses
    .filter(expense =>
      selectedCategory === "All" ||
      expense.category === selectedCategory
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  expenseList.replaceChildren();

  document.getElementById("emptyMessage").hidden =
    visibleExpenses.length !== 0;

  visibleExpenses.forEach(expense => {
    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.textContent = expense.date;

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = expense.description;

    const categoryCell = document.createElement("td");
    categoryCell.textContent = expense.category;

    const amountCell = document.createElement("td");
    amountCell.textContent = yen(expense.amount);

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", () => {
      expenses = expenses.filter(item => item.id !== expense.id);
      saveExpenses();
      renderExpenses();
    });

    actionCell.appendChild(deleteButton);
    row.append(
      dateCell,
      descriptionCell,
      categoryCell,
      amountCell,
      actionCell
    );

    expenseList.appendChild(row);
  });

  const total = expenses.reduce(
    (sum, expense) => sum + expense.amount, 0
  );

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const currentMonth = `${now.getFullYear()}-${month}`;

  const monthlyTotal = expenses
    .filter(expense => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);

  document.getElementById("totalExpenses").textContent = yen(total);
  document.getElementById("monthlyExpenses").textContent =
    yen(monthlyTotal);
  document.getElementById("transactionCount").textContent =
    expenses.length;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (
    !description ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    !date ||
    !["Food", "Transport", "Shopping", "Bills", "Education", "Other"]
      .includes(category)
  ) {
    alert("Please enter valid expense details.");
    return;
  }

  expenses.push({
    id: crypto.randomUUID(),
    description,
    amount,
    category,
    date
  });

  saveExpenses();
  form.reset();
  dateInput.value = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0")
  ].join("-");

  renderExpenses();
});

filterCategory.addEventListener("change", renderExpenses);

renderExpenses();
