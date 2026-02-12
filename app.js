const expenses = [
  { merchant: "Metro Grocery", amount: 48.2, category: "Food & Drinks", date: "Yesterday" },
  { merchant: "Morning Brew", amount: 6.4, category: "Coffee", date: "Today" },
  { merchant: "Studio Membership", amount: 42.0, category: "Subscription", date: "Tuesday" },
];

const weekly = [30, 55, 40, 70, 65, 45, 35];

const expenseList = document.getElementById("expenseList");
const weeklyChart = document.getElementById("weeklyChart");
const expenseForm = document.getElementById("expenseForm");
const balanceAmount = document.getElementById("balanceAmount");
const spentAmount = document.getElementById("spentAmount");
const helper = document.getElementById("formHelper");

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function renderExpenses() {
  expenseList.innerHTML = "";
  expenses.slice(0, 6).forEach((item) => {
    const row = document.createElement("div");
    row.className = "item";

    const left = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.merchant;
    const meta = document.createElement("span");
    meta.textContent = `${item.date} · ${item.category}`;
    left.appendChild(title);
    left.appendChild(meta);

    const amount = document.createElement("div");
    amount.className = "tag";
    amount.textContent = `-${formatMoney(item.amount)}`;

    row.appendChild(left);
    row.appendChild(amount);
    expenseList.appendChild(row);
  });
}

function renderWeekly() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  weeklyChart.innerHTML = "";
  weekly.forEach((height, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${height}%`;
    bar.setAttribute("data-day", days[index]);
    weeklyChart.appendChild(bar);
  });
}

function updateTotals() {
  const spent = expenses.reduce((sum, item) => sum + item.amount, 0);
  spentAmount.textContent = formatMoney(spent);

  const income = 3200;
  const balance = income - spent;
  balanceAmount.textContent = formatMoney(balance);
}

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(expenseForm);
  const merchant = formData.get("merchant").toString().trim();
  const amount = Number(formData.get("amount"));
  const category = formData.get("category");

  if (!merchant || Number.isNaN(amount) || amount <= 0) {
    helper.textContent = "Add a valid merchant and amount.";
    return;
  }

  expenses.unshift({
    merchant,
    amount,
    category,
    date: "Today",
  });

  helper.textContent = "Expense added. Keep the streak!";
  expenseForm.reset();
  renderExpenses();
  updateTotals();
});

renderExpenses();
renderWeekly();
updateTotals();
