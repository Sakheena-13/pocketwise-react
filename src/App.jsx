import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialTransactions = [
  { id: 1, title: "Monthly Salary", category: "Income", amount: 18000, type: "income", date: "2026-10-01" },
  { id: 2, title: "Room Rent", category: "Housing", amount: 5000, type: "expense", date: "2026-10-02" },
  { id: 3, title: "Groceries", category: "Food", amount: 1800, type: "expense", date: "2026-10-04" },
  { id: 4, title: "Transport", category: "Travel", amount: 700, type: "expense", date: "2026-10-06" },
];

const initialGoals = [
  { id: 1, name: "Emergency Fund", target: 10000, saved: 2500 },
  { id: 2, name: "New Laptop", target: 40000, saved: 8000 },
];

const initialCommitments = [
  { id: 1, name: "Room Rent", amount: 5000, dueDate: "2026-10-15", paid: false },
  { id: 2, name: "Phone Recharge", amount: 299, dueDate: "2026-10-18", paid: false },
];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function loadData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [page, setPage] = useState("Dashboard");

  const [transactions, setTransactions] = useState(() =>
    loadData("pw-transactions", initialTransactions)
  );

  const [goals, setGoals] = useState(() =>
    loadData("pw-goals", initialGoals)
  );

  const [commitments, setCommitments] = useState(() =>
    loadData("pw-commitments", initialCommitments)
  );

  const [toast, setToast] = useState("");

  const [transactionForm, setTransactionForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
  });

  const [goalForm, setGoalForm] = useState({
    name: "",
    target: "",
    saved: "0",
  });

  const [commitmentForm, setCommitmentForm] = useState({
    name: "",
    amount: "",
    dueDate: "",
  });

  const [contributions, setContributions] = useState({});
  const [simulationAmount, setSimulationAmount] = useState("1000");

  useEffect(() => {
    localStorage.setItem("pw-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("pw-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("pw-commitments", JSON.stringify(commitments));
  }, [commitments]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const commitmentsDue = commitments
      .filter((c) => !c.paid)
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const totalSaved = goals.reduce((sum, g) => sum + Number(g.saved), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      commitmentsDue,
      totalSaved,
      safeBalance: income - expenses - commitmentsDue,
    };
  }, [transactions, commitments, goals]);

  function addTransaction(event) {
    event.preventDefault();

    const amount = Number(transactionForm.amount);

    if (!transactionForm.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      setToast("Enter a description and a valid positive amount.");
      return;
    }

    setTransactions((current) => [
      {
        ...transactionForm,
        id: Date.now(),
        title: transactionForm.title.trim(),
        amount,
      },
      ...current,
    ]);

    setTransactionForm({
      title: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: new Date().toISOString().slice(0, 10),
    });

    setToast("Transaction added successfully!");
  }

  function deleteTransaction(id) {
    setTransactions((current) => current.filter((t) => t.id !== id));
    setToast("Transaction deleted.");
  }

  function addGoal(event) {
    event.preventDefault();

    const target = Number(goalForm.target);
    const saved = Number(goalForm.saved);

    if (
      !goalForm.name.trim() ||
      !Number.isFinite(target) ||
      target <= 0 ||
      !Number.isFinite(saved) ||
      saved < 0
    ) {
      setToast("Enter a valid goal name, target and savings amount.");
      return;
    }

    setGoals((current) => [
      ...current,
      {
        id: Date.now(),
        name: goalForm.name.trim(),
        target,
        saved,
      },
    ]);

    setGoalForm({ name: "", target: "", saved: "0" });
    setToast("Savings goal created!");
  }

  function contributeToGoal(id) {
    const amount = Number(contributions[id]);

    if (!Number.isFinite(amount) || amount <= 0) {
      setToast("Enter a valid contribution amount.");
      return;
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? { ...goal, saved: Number(goal.saved) + amount }
          : goal
      )
    );

    setContributions((current) => ({ ...current, [id]: "" }));
    setToast("Savings contribution added!");
  }

  function addCommitment(event) {
    event.preventDefault();

    const amount = Number(commitmentForm.amount);

    if (
      !commitmentForm.name.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !commitmentForm.dueDate
    ) {
      setToast("Complete all commitment fields with valid values.");
      return;
    }

    setCommitments((current) => [
      ...current,
      {
        id: Date.now(),
        name: commitmentForm.name.trim(),
        amount,
        dueDate: commitmentForm.dueDate,
        paid: false,
      },
    ]);

    setCommitmentForm({ name: "", amount: "", dueDate: "" });
    setToast("Commitment added!");
  }

  function togglePaid(id) {
    setCommitments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, paid: !item.paid } : item
      )
    );

    setToast("Commitment status updated.");
  }

  function deleteCommitment(id) {
    setCommitments((current) => current.filter((c) => c.id !== id));
    setToast("Commitment deleted.");
  }

  const categories = [
    "Food",
    "Housing",
    "Travel",
    "Education",
    "Shopping",
    "Health",
    "Entertainment",
    "Utilities",
    "Other",
  ];

  const expenseBreakdown = useMemo(() => {
    const groups = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        groups[t.category] = (groups[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(groups).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const healthScore = useMemo(() => {
    if (totals.income <= 0) return 0;

    const expenseRatio = totals.expenses / totals.income;
    const score = Math.round(
      Math.max(0, Math.min(100, 100 - expenseRatio * 70))
    );

    return score;
  }, [totals]);

  const navItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Transactions", icon: "↔" },
    { name: "Commitments", icon: "▤" },
    { name: "Savings Goals", icon: "◎" },
    { name: "Money Lab", icon: "◈" },
    { name: "Financial Health", icon: "♡" },
  ];

  function renderDashboard() {
    return (
      <>
        <div className="welcome">
          <div>
            <p className="eyebrow">YOUR MONEY, YOUR CONTROL</p>
            <h2>Make every rupee count.</h2>
            <p className="muted">
              Your financial snapshot, all in one place.
            </p>
          </div>
          <button className="primary-btn" onClick={() => setPage("Transactions")}>
            + Add transaction
          </button>
        </div>

        <div className="stat-grid">
          <StatCard title="Available Balance" value={money(totals.balance)} icon="₹" />
          <StatCard title="Total Income" value={money(totals.income)} icon="↗" />
          <StatCard title="Total Expenses" value={money(totals.expenses)} icon="↘" />
          <StatCard title="Savings Progress" value={money(totals.totalSaved)} icon="◎" />
        </div>

        <div className="content-grid">
          <section className="panel">
            <PanelTitle title="Spending breakdown" subtitle="Where your money goes" />
            {expenseBreakdown.length === 0 ? (
              <EmptyState text="Add an expense to see your spending breakdown." />
            ) : (
              expenseBreakdown.map(([category, amount]) => {
                const percentage = totals.expenses
                  ? (amount / totals.expenses) * 100
                  : 0;

                return (
                  <div className="breakdown-item" key={category}>
                    <div className="breakdown-heading">
                      <span>{category}</span>
                      <strong>{money(amount)}</strong>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={`${category} spending`}
                      aria-valuenow={Math.round(percentage)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <section className="panel">
            <PanelTitle title="Financial health" subtitle="A simple spending indicator" />
            <div className="health-score">{healthScore}<span>/100</span></div>
            <div className="progress-track health-track">
              <div
                className="progress-fill"
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <p className="muted">
              {totals.income === 0
                ? "Add income to calculate your spending indicator."
                : healthScore >= 70
                  ? "Your spending is within a reasonable range. Keep planning ahead."
                  : "Your expenses are high compared with income. Review your spending."}
            </p>
            <button className="secondary-btn" onClick={() => setPage("Financial Health")}>
              View financial health →
            </button>
          </section>
        </div>

        <section className="panel">
          <PanelTitle
            title="Recent transactions"
            subtitle="Your latest money movements"
            action={
              <button className="text-btn" onClick={() => setPage("Transactions")}>
                View all →
              </button>
            }
          />
          <TransactionTable
            transactions={transactions.slice(0, 5)}
            onDelete={deleteTransaction}
          />
        </section>

        <section className="panel">
          <PanelTitle
            title="Upcoming commitments"
            subtitle="Bills you still need to pay"
            action={
              <button className="text-btn" onClick={() => setPage("Commitments")}>
                Manage →
              </button>
            }
          />
          <CommitmentList
            commitments={commitments.filter((c) => !c.paid).slice(0, 4)}
            onToggle={togglePaid}
            onDelete={deleteCommitment}
          />
        </section>
      </>
    );
  }

  function renderTransactions() {
    return (
      <>
        <PageIntro
          title="Transactions"
          subtitle="Track every rupee coming in and going out."
        />

        <section className="panel">
          <PanelTitle title="Add transaction" subtitle="Record income or an expense" />

          <form className="form-grid" onSubmit={addTransaction}>
            <label>
              Description
              <input
                value={transactionForm.title}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, title: e.target.value })
                }
                placeholder="e.g. Grocery shopping"
                maxLength={80}
                required
              />
            </label>

            <label>
              Amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, amount: e.target.value })
                }
                placeholder="0"
                required
              />
            </label>

            <label>
              Type
              <select
                value={transactionForm.type}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, type: e.target.value })
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label>
              Category
              <select
                value={transactionForm.category}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, category: e.target.value })
                }
              >
                <option value="Income">Income</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                value={transactionForm.date}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, date: e.target.value })
                }
                required
              />
            </label>

            <button className="primary-btn form-button" type="submit">
              Save transaction
            </button>
          </form>
        </section>

        <section className="panel">
          <PanelTitle title="All transactions" subtitle={`${transactions.length} recorded entries`} />
          <TransactionTable
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </section>
      </>
    );
  }

  function renderGoals() {
    return (
      <>
        <PageIntro
          title="Savings Goals"
          subtitle="Small contributions can take you closer to big goals."
        />

        <section className="panel">
          <PanelTitle title="Create a savings goal" subtitle="Give your next milestone a target" />

          <form className="form-grid" onSubmit={addGoal}>
            <label>
              Goal name
              <input
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                placeholder="e.g. Emergency fund"
                maxLength={80}
                required
              />
            </label>

            <label>
              Target amount (₹)
              <input
                type="number"
                min="1"
                step="0.01"
                value={goalForm.target}
                onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                required
              />
            </label>

            <label>
              Already saved (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={goalForm.saved}
                onChange={(e) => setGoalForm({ ...goalForm, saved: e.target.value })}
                required
              />
            </label>

            <button className="primary-btn form-button" type="submit">
              + Create goal
            </button>
          </form>
        </section>

        <div className="goal-grid">
          {goals.map((goal) => {
            const percentage = Math.min(100, (goal.saved / goal.target) * 100);

            return (
              <section className="panel goal-card" key={goal.id}>
                <div className="goal-icon">◎</div>
                <h3>{goal.name}</h3>
                <p className="muted">Target: {money(goal.target)}</p>
                <div className="breakdown-heading">
                  <strong>{money(goal.saved)}</strong>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percentage}%` }} />
                </div>
                <p className="muted">
                  {money(Math.max(0, goal.target - goal.saved))} remaining
                </p>
                {percentage >= 100 && <p className="success-text">Goal achieved!</p>}

                <div className="contribution-row">
                  <input
                    aria-label={`Contribution for ${goal.name}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Amount ₹"
                    value={contributions[goal.id] || ""}
                    onChange={(e) =>
                      setContributions({ ...contributions, [goal.id]: e.target.value })
                    }
                  />
                  <button className="primary-btn" onClick={() => contributeToGoal(goal.id)}>
                    Add
                  </button>
                </div>

                <button
                  className="text-btn danger-text"
                  onClick={() => {
                    setGoals((current) => current.filter((g) => g.id !== goal.id));
                    setToast("Goal deleted.");
                  }}
                >
                  Delete goal
                </button>
              </section>
            );
          })}
        </div>

        {goals.length === 0 && <EmptyState text="No savings goals yet. Create your first goal above." />}
      </>
    );
  }

  function renderCommitments() {
    return (
      <>
        <PageIntro
          title="Financial Commitments"
          subtitle="Plan for upcoming bills before they surprise you."
        />

        <section className="panel">
          <PanelTitle title="Add a commitment" subtitle="Rent, bills, subscriptions and more" />

          <form className="form-grid" onSubmit={addCommitment}>
            <label>
              Commitment name
              <input
                value={commitmentForm.name}
                onChange={(e) => setCommitmentForm({ ...commitmentForm, name: e.target.value })}
                placeholder="e.g. Electricity bill"
                maxLength={80}
                required
              />
            </label>

            <label>
              Amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={commitmentForm.amount}
                onChange={(e) => setCommitmentForm({ ...commitmentForm, amount: e.target.value })}
                required
              />
            </label>

            <label>
              Due date
              <input
                type="date"
                value={commitmentForm.dueDate}
                onChange={(e) => setCommitmentForm({ ...commitmentForm, dueDate: e.target.value })}
                required
              />
            </label>

            <button className="primary-btn form-button" type="submit">
              + Add commitment
            </button>
          </form>
        </section>

        <section className="panel">
          <PanelTitle title="Your commitments" subtitle="Mark bills as paid when completed" />
          <CommitmentList
            commitments={[...commitments].sort((a, b) => a.dueDate.localeCompare(b.dueDate))}
            onToggle={togglePaid}
            onDelete={deleteCommitment}
          />
        </section>

        <section className="panel">
          <PanelTitle title="Upcoming payment total" subtitle="Unpaid commitments" />
          <h2>{money(totals.commitmentsDue)}</h2>
          <p className="muted">
            This amount is subtracted from your available balance in the safe-balance estimate.
          </p>
        </section>
      </>
    );
  }

  function renderSimulator() {
    const amount = Number(simulationAmount);
    const validAmount = Number.isFinite(amount) && amount >= 0;
    const projected = totals.safeBalance - (validAmount ? amount : 0);

    return (
      <>
        <PageIntro
          title="Money Lab"
          subtitle="Explore a spending decision before it affects your budget."
        />

        <section className="panel simulator-panel">
          <div className="simulator-icon">◈</div>
          <h2>Can you afford this purchase?</h2>
          <p className="muted">
            Enter a planned expense to estimate how much money would remain after unpaid commitments.
          </p>

          <label className="simulator-input">
            Planned purchase (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={simulationAmount}
              onChange={(e) => setSimulationAmount(e.target.value)}
            />
          </label>

          <div className="simulation-results">
            <div>
              <span className="muted">Current safe balance</span>
              <strong>{money(totals.safeBalance)}</strong>
            </div>
            <div>
              <span className="muted">After purchase</span>
              <strong className={projected < 0 ? "danger-text" : "success-text"}>
                {money(projected)}
              </strong>
            </div>
          </div>

          <div className={`advice-box ${projected < 0 ? "advice-danger" : "advice-good"}`}>
            {projected < 0
              ? "This purchase exceeds your estimated available funds. Consider a cheaper option or postpone it."
              : projected === 0
                ? "This purchase would use all your estimated available funds. Keep an emergency buffer if possible."
                : "This purchase fits within your current estimate. Make sure essential needs and emergency savings are covered."}
          </div>

          <p className="muted small-text">
            This is a planning estimate, not financial advice. It assumes recorded income, expenses and commitments are accurate.
          </p>
        </section>
      </>
    );
  }

  function renderHealth() {
    const expenseRatio = totals.income > 0
      ? Math.round((totals.expenses / totals.income) * 100)
      : null;

    const savingsRatio = totals.income > 0
      ? Math.round((Math.max(0, totals.balance) / totals.income) * 100)
      : null;

    return (
      <>
        <PageIntro
          title="Financial Health"
          subtitle="Understand your current money habits and identify what to improve."
        />

        <div className="stat-grid">
          <StatCard title="Health Indicator" value={`${healthScore}/100`} icon="♡" />
          <StatCard title="Expense-to-Income" value={expenseRatio === null ? "—" : `${expenseRatio}%`} icon="↘" />
          <StatCard title="Remaining Income" value={savingsRatio === null ? "—" : `${savingsRatio}%`} icon="◎" />
          <StatCard title="Unpaid Bills" value={money(totals.commitmentsDue)} icon="▤" />
        </div>

        <section className="panel">
          <PanelTitle title="Your money check-up" subtitle="Recommendations based on the information you've entered" />

          <div className="recommendation-list">
            <Recommendation
              title="Protect essential expenses"
              text="Prioritize housing, food, transport, education and essential bills before discretionary spending."
            />

            <Recommendation
              title="Track every transaction"
              text="Record cash purchases and digital payments so your balance reflects your actual spending."
            />

            <Recommendation
              title="Build an emergency fund"
              text="Set a realistic savings target and contribute small amounts consistently when your budget allows."
            />

            <Recommendation
              title="Review spending"
              text={
                expenseRatio === null
                  ? "Record your income and expenses to get a more useful spending analysis."
                  : expenseRatio > 80
                    ? "Your recorded expenses exceed 80% of income. Review flexible expenses and upcoming bills."
                    : "Compare your expenses against your income regularly and keep money available for essentials."
              }
            />
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <h1>PocketWise</h1>
            <span>Money made mindful</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => setPage(item.name)}
              aria-current={page === item.name ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="budget-tip">
            <span>✦</span>
            <strong>Small steps matter.</strong>
            <p>Every mindful money decision builds a stronger future.</p>
          </div>
          <p className="sidebar-footer">PocketWise · 2026</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="muted">Personal finance workspace</span>
            <h2>{page}</h2>
          </div>
          <div className="topbar-badge">
            <span className="status-dot" />
            Your budget, your rules
          </div>
        </header>

        <div className="page-content" key={page}>
          {page === "Dashboard" && renderDashboard()}
          {page === "Transactions" && renderTransactions()}
          {page === "Commitments" && renderCommitments()}
          {page === "Savings Goals" && renderGoals()}
          {page === "Money Lab" && renderSimulator()}
          {page === "Financial Health" && renderHealth()}
        </div>

        <footer className="main-footer">
          PocketWise · Spend thoughtfully. Save intentionally.
        </footer>
      </main>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <section className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className="stat-icon" aria-hidden="true">{icon}</span>
      </div>
      <strong>{value}</strong>
    </section>
  );
}

function PanelTitle({ title, subtitle, action }) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function PageIntro({ title, subtitle }) {
  return (
    <div className="page-intro">
      <p className="eyebrow">POCKETWISE WORKSPACE</p>
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}

function TransactionTable({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return <EmptyState text="No transactions yet. Add your first transaction to get started." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col">Category</th>
            <th scope="col">Date</th>
            <th scope="col">Amount</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <strong>{transaction.title}</strong>
                <span className="table-subtitle">{transaction.type}</span>
              </td>
              <td>{transaction.category}</td>
              <td>{transaction.date}</td>
              <td className={transaction.type === "income" ? "success-text" : "expense-text"}>
                {transaction.type === "income" ? "+" : "−"}{money(transaction.amount)}
              </td>
              <td>
                <button
                  className="text-btn danger-text"
                  onClick={() => onDelete(transaction.id)}
                  aria-label={`Delete ${transaction.title}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommitmentList({ commitments, onToggle, onDelete }) {
  if (commitments.length === 0) {
    return <EmptyState text="No commitments to display. Add a bill to plan ahead." />;
  }

  return (
    <div className="commitment-list">
      {commitments.map((item) => (
        <div className={`commitment-item ${item.paid ? "paid" : ""}`} key={item.id}>
          <button
            className={`check-button ${item.paid ? "checked" : ""}`}
            onClick={() => onToggle(item.id)}
            aria-label={item.paid ? `Mark ${item.name} unpaid` : `Mark ${item.name} paid`}
            aria-pressed={item.paid}
          >
            {item.paid ? "✓" : ""}
          </button>
          <div className="commitment-info">
            <strong>{item.name}</strong>
            <span className="muted">Due {item.dueDate}</span>
          </div>
          <strong>{money(item.amount)}</strong>
          <button
            className="text-btn danger-text"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.name}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

function Recommendation({ title, text }) {
  return (
    <div className="recommendation">
      <span className="recommendation-check" aria-hidden="true">✓</span>
      <div>
        <strong>{title}</strong>
        <p className="muted">{text}</p>
      </div>
    </div>
  );
}