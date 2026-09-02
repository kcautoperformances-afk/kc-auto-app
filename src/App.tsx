import React, { useState, useEffect, useCallback } from "react";

/* ============================================================
   KC AUTO PERFORMANCE — 员工晋升规划系统
   Career Path & Promotion Gate System
   ============================================================ */

/* ---------------- status meta ---------------- */

const STATUS_META = {
  LOCKED: { label: "未开放", color: "var(--muted)", bg: "rgba(154,147,136,0.12)" },
  NOT_STARTED: { label: "未开始", color: "var(--muted)", bg: "rgba(154,147,136,0.12)" },
  IN_PROGRESS: { label: "进行中", color: "var(--amber)", bg: "rgba(232,163,61,0.14)" },
  PENDING_CERT: { label: "待认证", color: "var(--amber)", bg: "rgba(232,163,61,0.22)" },
  PASS: { label: "PASS", color: "var(--green)", bg: "rgba(107,155,94,0.16)" },
  FAIL: { label: "FAIL", color: "var(--red)", bg: "rgba(193,68,60,0.16)" },
  RETRY: { label: "需重做", color: "var(--red)", bg: "rgba(193,68,60,0.16)" },
};

/* ---------------- default (editable) task config ---------------- */

const DEFAULT_CROSS_LINE_CONFIG = [
  { key: "technical", label: "技术 · Technical", certifier: "Kim", tasks: [
    "基础维修流程", "正确使用工具", "理解 Job Card", "车辆基础检查", "Road Test",
    "发现异常并正确汇报", "配合 QC", "知道何时不能自行判断", "配合 Head Technician 完成指定任务",
  ]},
  { key: "store", label: "零件仓储 · Store", certifier: "Store 负责人 / Manager", tasks: [
    "Parts 查找", "Parts 编号", "采购流程", "入货流程", "出货流程",
    "Stock 记录", "Inventory", "Supplier follow-up", "缺货处理", "Parts 与 Job Card 对应",
  ]},
  { key: "tuning", label: "改装 · Tuning", certifier: "Tuning 负责人 + Kim", tasks: [
    "理解客户改装需求", "Parts matching", "改装项目流程", "Tuning 基本流程",
    "Testing", "改装后验收", "知道哪些问题须交给 Tuner / HT",
  ]},
  { key: "sales", label: "销售 · Sales", certifier: "Manager / Sales 负责人", hasTarget: true, target: 40000, tasks: [
    "Lead 接触", "Customer 需求分析", "Quotation", "Product knowledge", "Follow-up",
    "Objection handling", "Closing", "Deposit", "Job handover", "After-sales",
  ]},
  { key: "operations", label: "运营 · Operations", certifier: "WY / Manager", tasks: [
    "查看每日 Workshop Schedule", "查看车辆状态", "找出延期车辆", "检查 Parts 是否到位",
    "检查 Technician 工作进度", "检查 Customer 是否需要更新", "找出运营瓶颈",
    "跨部门协调", "Escalate 问题", "Daily Operation Report",
  ]},
  { key: "marketing", label: "市场 · Marketing", certifier: "Yoyo", tasks: [
    "协助 Marketing 规划", "理解 Campaign", "提供车辆改装资料", "协助内容策划",
    "配合拍摄", "协助素材准备", "完成至少一个 Marketing 项目",
  ]},
  { key: "media", label: "拍摄 · Media", certifier: "Yoyo", tasks: [
    "配合拍摄", "知道车辆什么内容值得拍", "准备车辆资料", "配合拍摄流程", "协助整理素材",
  ]},
  { key: "customer", label: "客户处理 · Customer Handling", certifier: "Qing", tasks: [
    "正确了解客户需求", "基础沟通", "进度说明", "Follow-up",
    "Customer issue 记录", "知道何时需要升级给 SC", "不对客户作出未经授权的承诺",
  ]},
];

const DEFAULT_MISSIONS_CONFIG = [
  { key: "leadership", label: "团队领导 · Team Leadership", certifier: "WY / 对应部门负责人",
    desc: "带 1–2 名员工，分配任务、跟进、检查、反馈、纠正问题、确保工作完成。PASS 标准：不是自己做得好，而是能让别人完成工作。" },
  { key: "crossDeptProject", label: "跨部门项目 · Cross-Dept Project", certifier: "Qing + Kim + WY",
    desc: "独立协调至少 1 个完整项目：Customer → Sales → Parts → Technical → Tuning → QC → Delivery。" },
  { key: "sop", label: "SOP 制定", certifier: "WY", targetCount: 2,
    desc: "至少完成 2 份正式 SOP，须由员工自己发现问题、设计流程、执行、验证。" },
  { key: "problemSolving", label: "问题解决 · Problem Solving", certifier: "WY", targetCount: 3,
    desc: "至少解决 3 个跨部门问题：发现 → 分析原因 → 提出方案 → 执行 → 验证 → 防止重复。" },
  { key: "salesPerformance", label: "销售业绩 · RM80K", certifier: "Manager / Sales 负责人", target: 80000,
    desc: "建议连续 2–3 个月达到 RM80,000/月，而非单月达标。" },
];

const CERTIFIER_NAMES = ["Kim", "WY", "Qing", "Yoyo", "Store 负责人", "Manager"];

const RED_FLAG_TYPES = [
  "隐瞒错误", "推卸责任", "数据造假", "KPI 作弊", "越级乱指挥", "未授权对客户承诺",
  "技术问题自行乱判断", "故意破坏团队关系", "重复违反 SOP", "不尊重部门负责人",
  "严重纪律问题", "因个人利益损害公司",
];

const ROLE_LABELS = { FOUNDER: "Founder", MANAGER: "Manager", CERTIFIER: "部门认证人", EMPLOYEE: "员工" };

function seedAccounts() {
  return [
    { id: "acc-boss", username: "boss", password: "boss2026", displayName: "Boss", role: "FOUNDER", certifierScope: null, employeeId: null },
    { id: "acc-wy", username: "wy", password: "wy2026", displayName: "WY", role: "MANAGER", certifierScope: "WY, Manager", employeeId: null },
    { id: "acc-kim", username: "kim", password: "kim2026", displayName: "Kim", role: "CERTIFIER", certifierScope: "Kim", employeeId: null },
    { id: "acc-qing", username: "qing", password: "qing2026", displayName: "Qing", role: "CERTIFIER", certifierScope: "Qing", employeeId: null },
    { id: "acc-yoyo", username: "yoyo", password: "yoyo2026", displayName: "Yoyo", role: "CERTIFIER", certifierScope: "Yoyo", employeeId: null },
    { id: "acc-store", username: "store", password: "store2026", displayName: "Store 负责人", role: "CERTIFIER", certifierScope: "Store 负责人", employeeId: null },
    { id: "acc-aisyah", username: "aisyah", password: "aisyah2026", displayName: "Aisyah", role: "EMPLOYEE", certifierScope: null, employeeId: "emp-001" },
  ];
}

const PATH_TEMPLATES = [
  { key: "OPERATIONS", label: "Operations Track（Cross-Line → Assistant Operations Manager）", active: true },
  { key: "TECHNICIAN", label: "Technician → Senior Technician → Team Leader → HT Assistant → Head Technician", active: false },
  { key: "SERVICE", label: "Service Executive → Senior Service → SC Assistant → Service Controller", active: false },
  { key: "STORE", label: "Store Executive → Senior Store → Store Leader → Store Assistant Manager", active: false },
  { key: "SALES", label: "Sales Executive → Senior Sales → Sales Leader → Sales Manager", active: false },
];

/* ---------------- seed data ---------------- */

function seedEmployees() {
  const crossLine = {};
  DEFAULT_CROSS_LINE_CONFIG.forEach((c) => {
    crossLine[c.key] = { status: "NOT_STARTED", certifiedAt: null, score: null, evidence: "", comment: "" };
  });
  crossLine.technical = { status: "PASS", certifiedAt: "2026-05-14", score: 88, evidence: "现场操作观察 + Job Card 记录", comment: "基础扎实，安全意识良好。" };
  crossLine.store = { status: "PASS", certifiedAt: "2026-05-22", score: 82, evidence: "库存盘点记录 + 采购流程演练", comment: "" };
  crossLine.customer = { status: "PASS", certifiedAt: "2026-06-02", score: 90, evidence: "客户跟进记录 3 份", comment: "沟通清楚，懂得何时升级给 SC。" };
  crossLine.tuning = { status: "IN_PROGRESS", certifiedAt: null, score: null, evidence: "", comment: "" };
  crossLine.operations = { status: "PENDING_CERT", certifiedAt: null, score: null, evidence: "已提交 7 天 Daily Operation Report", comment: "" };
  crossLine.sales = { status: "IN_PROGRESS", certifiedAt: null, score: null, evidence: "", comment: "" };

  const missions = {};
  DEFAULT_MISSIONS_CONFIG.forEach((m) => {
    missions[m.key] = { status: "LOCKED", certifiedAt: null, score: null, evidence: "", comment: "", count: 0 };
  });

  return [
    {
      id: "emp-001",
      name: "Aisyah",
      initial: "A",
      position: "Cross-Line Operator",
      department: "Operations Track",
      pathTemplate: "OPERATIONS",
      level: 1,
      targetLevel: 2,
      rejoinDate: "2026-03-01",
      note: "曾任 Admin，离职后于其他 Workshop 担任 Technician，现重新加入并希望发展 Operations Management。",
      crossLine,
      salesRecords: [
        { month: "2026-06", target: 40000, actual: 28000 },
        { month: "2026-07", target: 40000, actual: 31500 },
        { month: "2026-08", target: 40000, actual: 35800 },
      ],
      problemSolvingCount: 1,
      discipline: "OK",
      gate1: { managerPass: false, founderReview: false },
      level2Path: null,
      missions,
      gate2: { managerPass: false, founderReview: false },
      redFlags: [],
      promotionReviews: [],
      finalStatus: null,
    },
  ];
}

/* ---------------- helpers (take config as argument, config is editable) ---------------- */

function gate1Requirements(emp, crossLineConfig) {
  const catsPass = crossLineConfig.every((c) => (emp.crossLine[c.key] || {}).status === "PASS");
  const latestSales = emp.salesRecords[emp.salesRecords.length - 1];
  const salesOk = latestSales && latestSales.actual >= latestSales.target;
  const problemOk = emp.problemSolvingCount >= 3;
  const disciplineOk = emp.discipline === "OK";
  const noActiveFlag = !emp.redFlags.some((f) => f.status === "ON_HOLD");
  return [
    { label: "全部 Cross-Line 项目 PASS", done: catsPass },
    { label: "Sales 达到目标（最近一月）", done: !!salesOk },
    { label: "完成至少 3 个 Problem Solving 项目", done: problemOk },
    { label: "Discipline / Attendance 符合标准", done: disciplineOk },
    { label: "无 On-Hold 中的 Red Flag", done: noActiveFlag },
    { label: "WY / Manager PASS", done: emp.gate1.managerPass },
    { label: "Founder Review 完成", done: emp.gate1.founderReview },
  ];
}

function gate2Requirements(emp, missionsConfig) {
  const missionsPass = missionsConfig.every((m) => (emp.missions[m.key] || {}).status === "PASS");
  const noActiveFlag = !emp.redFlags.some((f) => f.status === "ON_HOLD");
  return [
    { label: "全部 Management Mission PASS", done: missionsPass },
    { label: "无 On-Hold 中的 Red Flag", done: noActiveFlag },
    { label: "Manager PASS", done: emp.gate2.managerPass },
    { label: "Founder Review 完成", done: emp.gate2.founderReview },
  ];
}

function progressPercent(emp, crossLineConfig, missionsConfig) {
  const l1 = crossLineConfig.filter((c) => (emp.crossLine[c.key] || {}).status === "PASS").length / crossLineConfig.length;
  const l2 = missionsConfig.filter((m) => (emp.missions[m.key] || {}).status === "PASS").length / missionsConfig.length;
  if (emp.level === 1) return Math.round(l1 * 50);
  return Math.round(50 + l2 * 50);
}

function fmtRM(n) {
  return "RM " + Number(n).toLocaleString("en-MY");
}

/* ---------------- small UI atoms ---------------- */

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META.NOT_STARTED;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px", borderRadius: 3, fontSize: 12, fontWeight: 600,
      color: m.color, background: m.bg, border: `1px solid ${m.color}33`,
      whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.3,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, display: "inline-block" }} />
      {m.label}
    </span>
  );
}

function Panel({ title, sub, children, accent, right }) {
  return (
    <div className="kc-panel" style={{
      border: "1px solid var(--line)", background: "var(--panel)",
      position: "relative", marginBottom: 16, maxWidth: "100%",
    }}>
      <CornerMarks />
      {title && (
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, letterSpacing: 0.5, color: accent || "var(--text)" }}>{title}</div>
            {sub && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function CornerMarks() {
  const s = { position: "absolute", width: 7, height: 7, borderColor: "var(--amber)", opacity: 0.55 };
  return (
    <>
      <span style={{ ...s, top: -1, left: -1, borderTop: "2px solid", borderLeft: "2px solid" }} />
      <span style={{ ...s, top: -1, right: -1, borderTop: "2px solid", borderRight: "2px solid" }} />
      <span style={{ ...s, bottom: -1, left: -1, borderBottom: "2px solid", borderLeft: "2px solid" }} />
      <span style={{ ...s, bottom: -1, right: -1, borderBottom: "2px solid", borderRight: "2px solid" }} />
    </>
  );
}

function Bar({ pct, color }) {
  return (
    <div style={{ height: 6, background: "var(--track)", position: "relative", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", background: color || "var(--amber)", transition: "width .4s" }} />
    </div>
  );
}

function Btn({ children, onClick, tone = "default", disabled, small }) {
  const tones = {
    default: { bg: "transparent", border: "var(--line)", color: "var(--text)" },
    amber: { bg: "var(--amber)", border: "var(--amber)", color: "#1C1B1A" },
    green: { bg: "transparent", border: "var(--green)", color: "var(--green)" },
    red: { bg: "transparent", border: "var(--red)", color: "var(--red)" },
  };
  const t = tones[tone];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: t.bg, border: `1px solid ${t.border}`, color: t.color,
        padding: small ? "5px 10px" : "8px 16px", fontSize: small ? 12 : 13,
        fontFamily: "'Inter', sans-serif", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1, letterSpacing: 0.2, transition: "all .15s", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: "100%", background: "var(--track)", border: "1px solid var(--line)", color: "var(--text)",
  padding: "8px 10px", fontSize: 13, fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

/* ============================================================
   MAIN APP
   ============================================================ */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [crossLineConfig, setCrossLineConfig] = useState(DEFAULT_CROSS_LINE_CONFIG);
  const [missionsConfig, setMissionsConfig] = useState(DEFAULT_MISSIONS_CONFIG);
  const [log, setLog] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [selectedId, setSelectedId] = useState("emp-001");
  const [saveErr, setSaveErr] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = currentUser ? currentUser.role : null;
  const certifierName = currentUser ? currentUser.certifierScope : null;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state");
        const data = await res.json();
        setEmployees(data.employees || []);
        if (data.taskConfig) {
          if (data.taskConfig.crossLine) setCrossLineConfig(data.taskConfig.crossLine);
          if (data.taskConfig.missions) setMissionsConfig(data.taskConfig.missions);
        }
        setLog(data.log || []);
        const loadedAccounts = data.accounts || [];
        setAccounts(loadedAccounts);

        const sid = localStorage.getItem("kc_session");
        if (sid) {
          const acc = loadedAccounts.find((a) => a.id === sid);
          if (acc) {
            setCurrentUser(acc);
            setTab(acc.role === "EMPLOYEE" ? "profile" : "dashboard");
            if (acc.role === "EMPLOYEE" && acc.employeeId) setSelectedId(acc.employeeId);
          } else {
            localStorage.removeItem("kc_session");
          }
        }
      } catch {
        setEmployees(seedEmployees());
        setAccounts(seedAccounts());
      }
      setLoading(false);
    })();
  }, []);

  const postJSON = async (url, body) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error("save failed");
  };

  const persistAccounts = useCallback(async (next, actionLabel) => {
    setAccounts(next);
    let nextLog = log;
    if (actionLabel) {
      nextLog = [{ t: new Date().toISOString(), who: currentUser ? currentUser.displayName : "Boss", action: actionLabel }, ...log].slice(0, 60);
      setLog(nextLog);
    }
    try {
      await postJSON("/api/accounts", { accounts: next });
      if (actionLabel) await postJSON("/api/log", { log: nextLog });
      setSaveErr(false);
    } catch {
      setSaveErr(true);
    }
  }, [accounts, log, currentUser]);

  const handleLogin = (acc) => {
    setCurrentUser(acc);
    setTab(acc.role === "EMPLOYEE" ? "profile" : "dashboard");
    if (acc.role === "EMPLOYEE" && acc.employeeId) setSelectedId(acc.employeeId);
    localStorage.setItem("kc_session", acc.id);
  };
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kc_session");
  };

  const addAccount = (acc) => {
    const withId = { ...acc, id: "acc-" + Date.now() };
    persistAccounts([...accounts, withId], `新增账号：${acc.displayName} (${acc.username})`);
  };
  const updateAccount = (id, patch) => {
    const next = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a));
    persistAccounts(next, `编辑账号：${patch.displayName || id}`);
    if (currentUser && currentUser.id === id) setCurrentUser({ ...currentUser, ...patch });
  };
  const deleteAccount = (id) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    if (currentUser && currentUser.id === id) { alert("不能删除当前登录中的账号"); return; }
    if (acc.role === "FOUNDER" && accounts.filter((a) => a.role === "FOUNDER").length <= 1) { alert("至少需保留一个 Founder 账号"); return; }
    persistAccounts(accounts.filter((a) => a.id !== id), `删除账号：${acc.displayName}`);
  };

  const persist = useCallback(async (nextEmployees, actionLabel) => {
    setEmployees(nextEmployees);
    let nextLog = log;
    if (actionLabel) {
      nextLog = [{ t: new Date().toISOString(), who: role === "CERTIFIER" ? certifierName : role, action: actionLabel }, ...log].slice(0, 60);
      setLog(nextLog);
    }
    try {
      await postJSON("/api/employees", { employees: nextEmployees });
      if (actionLabel) await postJSON("/api/log", { log: nextLog });
      setSaveErr(false);
    } catch {
      setSaveErr(true);
    }
  }, [log, role, certifierName]);

  const persistConfig = useCallback(async (nextCross, nextMissions, actionLabel) => {
    setCrossLineConfig(nextCross);
    setMissionsConfig(nextMissions);
    const nextLog = actionLabel ? [{ t: new Date().toISOString(), who: role, action: actionLabel }, ...log].slice(0, 60) : log;
    if (actionLabel) setLog(nextLog);
    try {
      await postJSON("/api/taskConfig", { taskConfig: { crossLine: nextCross, missions: nextMissions } });
      if (actionLabel) await postJSON("/api/log", { log: nextLog });
      setSaveErr(false);
    } catch {
      setSaveErr(true);
    }
  }, [log, role]);

  const updateCrossLineConfigItem = (key, patch) => {
    const next = crossLineConfig.map((c) => (c.key === key ? { ...c, ...patch } : c));
    persistConfig(next, missionsConfig, `编辑任务内容：${patch.label || key}`);
  };
  const updateMissionsConfigItem = (key, patch) => {
    const next = missionsConfig.map((m) => (m.key === key ? { ...m, ...patch } : m));
    persistConfig(crossLineConfig, next, `编辑 Mission 内容：${patch.label || key}`);
  };

  const updateEmployee = (id, updater, actionLabel) => {
    const next = employees.map((e) => (e.id === id ? updater(structuredClone(e)) : e));
    persist(next, actionLabel);
  };

  const addEmployee = () => {
    const name = prompt("新员工姓名：");
    if (!name) return;
    const seed = seedEmployees()[0];
    const crossLine = {};
    crossLineConfig.forEach((c) => { crossLine[c.key] = { status: "NOT_STARTED", certifiedAt: null, score: null, evidence: "", comment: "" }; });
    const missions = {};
    missionsConfig.forEach((m) => { missions[m.key] = { status: "LOCKED", certifiedAt: null, score: null, evidence: "", comment: "", count: 0 }; });
    const emp = {
      ...seed, id: "emp-" + Date.now(), name, initial: name[0].toUpperCase(),
      position: "Cross-Line Operator", department: "Operations Track", level: 1, targetLevel: 2,
      rejoinDate: new Date().toISOString().slice(0, 10), note: "", crossLine, salesRecords: [],
      problemSolvingCount: 0, discipline: "OK", gate1: { managerPass: false, founderReview: false },
      level2Path: null, missions, gate2: { managerPass: false, founderReview: false },
      redFlags: [], promotionReviews: [], finalStatus: null,
    };
    persist([...employees, emp], `新增员工：${name}`);
    setSelectedId(emp.id);
    setTab("profile");
    setDrawerOpen(false);
  };

  const selected = employees.find((e) => e.id === selectedId) || employees[0];

  if (loading) {
    return (
      <div className="kc-shell" style={shellVars}>
        <GlobalStyle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <div style={{ color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>加载晋升数据中…</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="kc-shell" style={shellVars}>
        <GlobalStyle />
        <LoginScreen accounts={accounts} onLogin={handleLogin} />
      </div>
    );
  }

  const go = (t) => { setTab(t); setDrawerOpen(false); };

  return (
    <div className="kc-shell" style={shellVars}>
      <GlobalStyle />
      <div className="kc-layout">
        <Sidebar
          currentUser={currentUser} onLogout={handleLogout}
          tab={tab} setTab={go}
          saveErr={saveErr}
          drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}
        />
        <div className="kc-main">
          <TopBar tab={tab} />
          {tab === "dashboard" && (
            <Dashboard
              employees={role === "EMPLOYEE" ? employees.filter((e) => e.id === currentUser.employeeId) : employees}
              onOpen={(id) => { setSelectedId(id); go("profile"); }} onAdd={addEmployee} role={role} log={log}
              crossLineConfig={crossLineConfig} missionsConfig={missionsConfig}
            />
          )}
          {tab === "profile" && selected && (
            <EmployeeProfile
              emp={selected}
              employees={role === "EMPLOYEE" ? employees.filter((e) => e.id === currentUser.employeeId) : employees}
              setSelectedId={setSelectedId}
              role={role} certifierName={certifierName}
              updateEmployee={updateEmployee}
              crossLineConfig={crossLineConfig} missionsConfig={missionsConfig}
              updateCrossLineConfigItem={updateCrossLineConfigItem}
              updateMissionsConfigItem={updateMissionsConfigItem}
              accounts={accounts}
            />
          )}
          {tab === "certify" && (
            <CertifyQueue employees={employees} role={role} certifierName={certifierName} updateEmployee={updateEmployee} crossLineConfig={crossLineConfig} missionsConfig={missionsConfig} />
          )}
          {tab === "approval" && (
            <ApprovalCenter employees={employees} role={role} updateEmployee={updateEmployee} onOpen={(id) => { setSelectedId(id); go("profile"); }} crossLineConfig={crossLineConfig} missionsConfig={missionsConfig} />
          )}
          {tab === "accounts" && role === "FOUNDER" && (
            <AccountsAdmin accounts={accounts} employees={employees} currentUser={currentUser} onAdd={addAccount} onUpdate={updateAccount} onDelete={deleteAccount} />
          )}
        </div>
      </div>
    </div>
  );
}

const shellVars = {
  "--bg": "#1C1B1A", "--panel": "#221F1D", "--track": "#2A2724", "--line": "#3A3733",
  "--text": "#F2EDE4", "--muted": "#9A9388", "--amber": "#E8A33D", "--green": "#6B9B5E", "--red": "#C1443C",
  background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', sans-serif",
  width: "100%", maxWidth: "100%", overflowX: "hidden", border: "1px solid #000", boxSizing: "border-box",
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
      * { box-sizing: border-box; }
      .kc-shell, .kc-shell * { max-width: 100%; }
      ::selection { background: rgba(232,163,61,0.35); }
      select, input, textarea { outline: none; }
      select:focus, input:focus, textarea:focus, button:focus-visible { box-shadow: 0 0 0 2px var(--amber); }
      button { font-family: inherit; }
      .kc-layout { display: flex; min-height: 500px; }
      .kc-sidebar { width: 240px; flex-shrink: 0; border-right: 1px solid var(--line); padding: 20px 16px; }
      .kc-main { flex: 1; min-width: 0; padding: 22px 26px; }
      .kc-drawer-toggle { display: none; }
      .kc-nav-item { padding: 9px 10px; margin-bottom: 3px; font-size: 13px; cursor: pointer; transition: all .12s; }
      @media (max-width: 760px) {
        .kc-layout { flex-direction: column; }
        .kc-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--line); padding: 12px 14px; }
        .kc-main { padding: 16px 14px; }
        .kc-drawer-toggle { display: flex; }
        .kc-sidebar-body { display: none; }
        .kc-sidebar-body.open { display: block; margin-top: 12px; }
        .kc-quote { display: none; }
        .kc-panel { font-size: 13px; }
      }
    `}</style>
  );
}

/* ---------------- sidebar / topbar ---------------- */

function Sidebar({ currentUser, onLogout, tab, setTab, saveErr, drawerOpen, setDrawerOpen }) {
  const allNav = [
    { key: "dashboard", label: "总览 · Pipeline", roles: ["FOUNDER", "MANAGER", "CERTIFIER"] },
    { key: "profile", label: "员工晋升路径", roles: ["FOUNDER", "MANAGER", "CERTIFIER", "EMPLOYEE"] },
    { key: "certify", label: "认证中心", roles: ["FOUNDER", "MANAGER", "CERTIFIER"] },
    { key: "approval", label: "审批中心", roles: ["FOUNDER", "MANAGER"] },
    { key: "accounts", label: "账号管理", roles: ["FOUNDER"] },
  ];
  const nav = allNav.filter((n) => n.roles.includes(currentUser.role));
  return (
    <div className="kc-sidebar">
      <div className="kc-drawer-toggle" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17 }}>KC AUTO</span>
          <span style={{ fontSize: 10, color: "var(--amber)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>晋升系统</span>
        </div>
        <button onClick={() => setDrawerOpen(!drawerOpen)} style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--text)", padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
          {drawerOpen ? "收起 ✕" : "菜单 ☰"}
        </button>
      </div>

      <div className="kc-sidebar-body-wrap" style={{ display: "block" }}>
        <div style={{ marginBottom: 22 }} className="kc-desktop-title">
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, letterSpacing: 0.5, lineHeight: 1.1 }}>KC AUTO</div>
          <div style={{ fontSize: 11, color: "var(--amber)", letterSpacing: 1.5, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>PERFORMANCE · 晋升系统</div>
        </div>

        <div className={`kc-sidebar-body ${drawerOpen ? "open" : ""}`}>
          <div style={{ marginBottom: 20, border: "1px solid var(--line)", padding: "10px 12px", background: "var(--track)" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>已登录 / SIGNED IN AS</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{currentUser.displayName}</div>
            <div style={{ fontSize: 11.5, color: "var(--amber)", marginTop: 2 }}>{ROLE_LABELS[currentUser.role]}{currentUser.certifierScope ? ` · ${currentUser.certifierScope}` : ""}</div>
            <button onClick={onLogout} style={{ marginTop: 8, background: "transparent", border: "1px solid var(--line)", color: "var(--muted)", padding: "5px 10px", fontSize: 11.5, cursor: "pointer" }}>退出登录</button>
          </div>

          <div>
            {nav.map((n) => (
              <div
                key={n.key}
                className="kc-nav-item"
                onClick={() => setTab(n.key)}
                style={{
                  color: tab === n.key ? "var(--bg)" : "var(--text)",
                  background: tab === n.key ? "var(--amber)" : "transparent",
                  fontWeight: tab === n.key ? 700 : 500,
                }}
              >
                {n.label}
              </div>
            ))}
          </div>

          <div className="kc-quote" style={{ marginTop: 30, paddingTop: 16, borderTop: "1px solid var(--line)", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.7 }}>
            “机会可以给，职位不能送。”<br />
            “达到条件，是获得晋升评估资格，不是自动晋升。”
          </div>

          {saveErr && (
            <div style={{ marginTop: 14, fontSize: 11, color: "var(--red)" }}>⚠ 保存失败，数据可能未同步</div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 761px) { .kc-drawer-toggle { display: none !important; } .kc-sidebar-body { display: block !important; } }
        @media (max-width: 760px) { .kc-desktop-title { display: none; } }
      `}</style>
    </div>
  );
}

function TopBar({ tab }) {
  const titles = {
    dashboard: ["总览 Pipeline", "谁正在升级 · 谁卡住 · 谁等待认证 · 谁等待 Founder 审批"],
    profile: ["员工晋升路径", "Cross-Line → Gate 1 → Management Mission → Gate 2 → Assistant Operations Manager"],
    certify: ["认证中心", "认证必须由负责该能力的负责人完成，员工不能自己认证自己"],
    approval: ["审批中心", "Red Flag · Promotion Review · Founder 最终批准"],
    accounts: ["账号管理", "设定姓名、登录 ID 与密码 — 仅 Boss 可见"],
  };
  const [t, s] = titles[tab];
  return (
    <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22 }}>{t}</div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{s}</div>
    </div>
  );
}

/* ---------------- dashboard ---------------- */

function Dashboard({ employees, onOpen, onAdd, role, log, crossLineConfig, missionsConfig }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{employees.length} 名员工在晋升体系中</div>
        {(role === "FOUNDER" || role === "MANAGER") && <Btn tone="amber" small onClick={onAdd}>+ 新增员工（复制模板）</Btn>}
      </div>

      {employees.map((emp) => {
        const pct = progressPercent(emp, crossLineConfig, missionsConfig);
        const activeFlag = emp.redFlags.some((f) => f.status === "ON_HOLD");
        const pendingCerts = [
          ...crossLineConfig.filter((c) => (emp.crossLine[c.key] || {}).status === "PENDING_CERT"),
          ...missionsConfig.filter((m) => (emp.missions[m.key] || {}).status === "PENDING_CERT"),
        ].length;
        return (
          <Panel key={emp.id}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", cursor: "pointer", flexWrap: "wrap" }} onClick={() => onOpen(emp.id)}>
              <div style={{
                width: 44, height: 44, background: "var(--track)", border: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Oswald', sans-serif", fontSize: 18, color: "var(--amber)", flexShrink: 0,
              }}>{emp.initial}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12.5, marginLeft: 10 }}>{emp.position} · Level {emp.level}{emp.level2Path ? ` (${emp.level2Path})` : ""}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--amber)" }}>{pct}%</div>
                </div>
                <Bar pct={pct} color={activeFlag ? "var(--red)" : "var(--amber)"} />
                <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11.5, color: "var(--muted)", flexWrap: "wrap" }}>
                  {activeFlag && <span style={{ color: "var(--red)" }}>● Red Flag ON HOLD</span>}
                  {pendingCerts > 0 && <span style={{ color: "var(--amber)" }}>● {pendingCerts} 项待认证</span>}
                  {emp.level === 1 && gate1Requirements(emp, crossLineConfig).every((r) => r.done) && <span style={{ color: "var(--green)" }}>● Gate 1 全部达成，等待最终批准</span>}
                  {emp.level === 2 && gate2Requirements(emp, missionsConfig).every((r) => r.done) && <span style={{ color: "var(--green)" }}>● Gate 2 全部达成，等待最终批准</span>}
                  {emp.finalStatus === "APPROVED" && <span style={{ color: "var(--green)" }}>● 已晋升 Assistant Operations Manager</span>}
                </div>
              </div>
            </div>
          </Panel>
        );
      })}

      <Panel title="职业发展路径模板库 · Future Replication" sub="系统支持为不同部门建立多条晋升路径（当前仅 Operations Track 有完整互动追踪）">
        {PATH_TEMPLATES.map((p) => (
          <div key={p.key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 12.5, gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: p.active ? "var(--text)" : "var(--muted)" }}>{p.label}</span>
            <span style={{ color: p.active ? "var(--green)" : "var(--muted)", fontFamily: "'JetBrains Mono', monospace" }}>{p.active ? "启用中" : "待开放"}</span>
          </div>
        ))}
      </Panel>

      <Panel title="审计日志 · Audit Log" sub="每一次认证与审批都被记录">
        {log.length === 0 && <div style={{ color: "var(--muted)", fontSize: 12.5 }}>暂无记录</div>}
        {log.slice(0, 12).map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 10, fontSize: 12, padding: "5px 0", borderBottom: "1px solid var(--line)", color: "var(--muted)", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{new Date(l.t).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
            <span style={{ color: "var(--amber)", flexShrink: 0 }}>{l.who}</span>
            <span>{l.action}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

/* ---------------- employee profile ---------------- */

function StepperPipeline({ emp, crossLineConfig, missionsConfig }) {
  const steps = ["REJOIN", "LEVEL 1", "GATE 1", "LEVEL 2", "GATE 2", "ASST OPS MGR"];
  let activeIdx = 1;
  if (gate1Requirements(emp, crossLineConfig).every((r) => r.done) && emp.level === 1) activeIdx = 2;
  if (emp.level === 2) activeIdx = 3;
  if (gate2Requirements(emp, missionsConfig).every((r) => r.done) && emp.level === 2) activeIdx = 4;
  if (emp.finalStatus === "APPROVED") activeIdx = 5;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 4, overflowX: "auto", paddingBottom: 4 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            padding: "7px 12px", fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
            whiteSpace: "nowrap", flexShrink: 0,
            color: i <= activeIdx ? "#1C1B1A" : "var(--muted)",
            background: i <= activeIdx ? "var(--amber)" : "var(--track)",
            border: `1px solid ${i <= activeIdx ? "var(--amber)" : "var(--line)"}`,
            fontWeight: i === activeIdx ? 700 : 500,
          }}>{s}</div>
          {i < steps.length - 1 && <div style={{ width: 18, height: 1, background: i < activeIdx ? "var(--amber)" : "var(--line)", flexShrink: 0 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function CanAct(role, certifierName, certifierField) {
  if (role === "FOUNDER" || role === "MANAGER") return true;
  if (role === "CERTIFIER") {
    if (!certifierName) return false;
    const tokens = certifierName.split(",").map((s) => s.trim()).filter(Boolean);
    return tokens.some((t) => certifierField.includes(t));
  }
  return false;
}

/* Resolves "认证人" display text so it always reflects the account's CURRENT display name,
   instead of a name hardcoded into the task config. Boss renames an account in 账号管理 →
   every task/mission card referencing that person's certifierScope updates automatically. */
function resolveCertifierLabel(text, accounts) {
  if (!text || !accounts || accounts.length === 0) return text;
  const pairs = [];
  accounts.forEach((a) => {
    if (!a.certifierScope) return;
    a.certifierScope.split(",").map((s) => s.trim()).filter(Boolean).forEach((kw) => {
      pairs.push({ kw, name: a.displayName });
    });
  });
  pairs.sort((a, b) => b.kw.length - a.kw.length);
  let result = text;
  pairs.forEach(({ kw, name }) => {
    if (kw && result.includes(kw)) result = result.split(kw).join(name);
  });
  return result;
}

/* editable config form, used inside CertRow when an admin clicks "编辑任务内容" */
function ConfigEditor({ config, isMission, onSave, onCancel }) {
  const [label, setLabel] = useState(config.label);
  const [certifier, setCertifier] = useState(config.certifier);
  const [target, setTarget] = useState(config.target || "");
  const [targetCount, setTargetCount] = useState(config.targetCount || "");
  const [bodyText, setBodyText] = useState(isMission ? (config.desc || "") : (config.tasks || []).join("\n"));

  return (
    <div style={{ border: "1px dashed var(--amber)", padding: 12, marginTop: 10, background: "var(--panel)" }}>
      <Field label="标题 LABEL">
        <input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} />
      </Field>
      <Field label="认证人 CERTIFIER">
        <input style={inputStyle} value={certifier} onChange={(e) => setCertifier(e.target.value)} />
      </Field>
      {(config.hasTarget || config.target) && (
        <Field label="月度目标金额 TARGET (RM)">
          <input type="number" style={inputStyle} value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
      )}
      {config.targetCount !== undefined && (
        <Field label="需完成数量 TARGET COUNT">
          <input type="number" style={inputStyle} value={targetCount} onChange={(e) => setTargetCount(e.target.value)} />
        </Field>
      )}
      <Field label={isMission ? "任务说明 DESCRIPTION" : "任务清单（每行一项）TASK LIST"}>
        <textarea style={{ ...inputStyle, minHeight: isMission ? 70 : 120, resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
      </Field>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Btn small tone="amber" onClick={() => {
          const patch = { label, certifier };
          if (config.hasTarget || config.target) patch.target = Number(target) || 0;
          if (config.targetCount !== undefined) patch.targetCount = Number(targetCount) || 0;
          if (isMission) patch.desc = bodyText;
          else patch.tasks = bodyText.split("\n").map((t) => t.trim()).filter(Boolean);
          onSave(patch);
        }}>保存修改</Btn>
        <Btn small onClick={onCancel}>取消</Btn>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      {children}
    </div>
  );
}

function CertRow({ item, config, canAct, canSubmit, canEditConfig, isMission, onCertify, onSubmitEvidence, onSaveConfig }) {
  const [score, setScore] = useState(item.score || 80);
  const [comment, setComment] = useState("");
  const [evidence, setEvidence] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ border: "1px solid var(--line)", marginBottom: 8, background: "var(--track)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", cursor: "pointer", gap: 8, flexWrap: "wrap" }} onClick={() => setOpen(!open)}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{config.label}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>认证人：{config.certifier}{item.certifiedAt ? ` · ${item.certifiedAt}` : ""}{item.score ? ` · ${item.score}分` : ""}</div>
        </div>
        <Badge status={item.status} />
      </div>
      {open && (
        <div style={{ padding: "0 12px 12px", borderTop: "1px solid var(--line)" }}>
          {canEditConfig && !editing && (
            <div style={{ marginTop: 10 }}>
              <Btn small onClick={(e) => { e.stopPropagation(); setEditing(true); }}>✎ 编辑任务内容</Btn>
            </div>
          )}
          {editing ? (
            <ConfigEditor
              config={config} isMission={isMission}
              onSave={(patch) => { onSaveConfig(patch); setEditing(false); }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              {config.tasks && (
                <div style={{ margin: "10px 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {config.tasks.map((t, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "3px 8px", background: "var(--panel)", border: "1px solid var(--line)", color: "var(--muted)" }}>{t}</span>
                  ))}
                </div>
              )}
              {config.hasTarget && <div style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0" }}>月度目标：{fmtRM(config.target)}</div>}
            </>
          )}

          {item.evidence && <div style={{ fontSize: 12, color: "var(--text)", margin: "8px 0" }}>已提交证据：{item.evidence}</div>}
          {item.comment && <div style={{ fontSize: 12, color: "var(--amber)", margin: "8px 0" }}>认证备注：{item.comment}</div>}

          {canSubmit && (item.status === "NOT_STARTED" || item.status === "IN_PROGRESS") && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="填写证据说明后提交认证…" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
              <Btn small tone="amber" disabled={!evidence.trim()} onClick={() => { onSubmitEvidence(evidence); setEvidence(""); }}>提交待认证</Btn>
            </div>
          )}

          {canAct && (item.status === "PENDING_CERT" || item.status === "IN_PROGRESS" || item.status === "NOT_STARTED" || item.status === "RETRY") && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="number" min="0" max="100" style={{ ...inputStyle, width: 70 }} value={score} onChange={(e) => setScore(Number(e.target.value))} />
              <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} placeholder="认证备注…" value={comment} onChange={(e) => setComment(e.target.value)} />
              <Btn small tone="green" onClick={() => onCertify("PASS", score, comment)}>PASS</Btn>
              <Btn small tone="red" onClick={() => onCertify("FAIL", score, comment)}>FAIL</Btn>
              <Btn small onClick={() => onCertify("RETRY", score, comment)}>需更多证据</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmployeeProfile({ emp, employees, setSelectedId, role, certifierName, updateEmployee, crossLineConfig, missionsConfig, updateCrossLineConfigItem, updateMissionsConfigItem, accounts }) {
  const gate1 = gate1Requirements(emp, crossLineConfig);
  const gate1Eligible = gate1.every((r) => r.done);
  const gate2 = gate2Requirements(emp, missionsConfig);
  const gate2Eligible = gate2.every((r) => r.done);
  const canManage = role === "FOUNDER" || role === "MANAGER";

  const setCross = (key, patch) => updateEmployee(emp.id, (e) => { e.crossLine[key] = { ...e.crossLine[key], ...patch }; return e; }, `${emp.name} · ${key} 更新`);
  const setMission = (key, patch) => updateEmployee(emp.id, (e) => { e.missions[key] = { ...e.missions[key], ...patch }; return e; }, `${emp.name} · ${key} Mission 更新`);

  const [salesTarget] = useState(40000);
  const [salesActual, setSalesActual] = useState(0);
  const [salesMonth, setSalesMonth] = useState("");

  return (
    <div>
      {employees.length > 1 && role !== "EMPLOYEE" && (
        <select value={emp.id} onChange={(e) => setSelectedId(e.target.value)} style={{ ...inputStyle, width: 220, marginBottom: 14, fontSize: 12.5 }}>
          {employees.map((e2) => <option key={e2.id} value={e2.id}>{e2.name}</option>)}
        </select>
      )}

      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20 }}>{emp.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{emp.position} · {emp.department} · 重新加入 {emp.rejoinDate}</div>
            {emp.note && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, maxWidth: 480, lineHeight: 1.5 }}>{emp.note}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, color: "var(--amber)" }}>{progressPercent(emp, crossLineConfig, missionsConfig)}%</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>总体晋升进度</div>
          </div>
        </div>
        <StepperPipeline emp={emp} crossLineConfig={crossLineConfig} missionsConfig={missionsConfig} />
      </Panel>

      {/* LEVEL 1 */}
      <Panel title="LEVEL 1 · Cross-Line Operator" sub="目标：全面理解 KC Auto 业务，而不是只会单一岗位。点开每一项可查看/编辑任务内容" accent="var(--amber)">
        {crossLineConfig.map((c) => {
          const item = emp.crossLine[c.key] || { status: "NOT_STARTED" };
          const resolvedConfig = { ...c, certifier: resolveCertifierLabel(c.certifier, accounts) };
          return (
            <CertRow
              key={c.key} item={item} config={resolvedConfig}
              canAct={CanAct(role, certifierName, c.certifier)}
              canSubmit={role === "EMPLOYEE"}
              canEditConfig={canManage}
              onSaveConfig={(patch) => updateCrossLineConfigItem(c.key, patch)}
              onSubmitEvidence={(ev) => setCross(c.key, { status: "PENDING_CERT", evidence: ev })}
              onCertify={(status, score, comment) => setCross(c.key, { status, score, comment, certifiedAt: new Date().toISOString().slice(0, 10) })}
            />
          );
        })}

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>销售追踪 · Sales (目标 {fmtRM(crossLineConfig.find((c) => c.key === "sales")?.target || 40000)}/月) <span style={{ fontWeight: 400, color: "var(--muted)" }}>· 每月只能提交一次，提交后不可更改</span></div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 90, marginBottom: 8, overflowX: "auto" }}>
            {emp.salesRecords.map((r, i) => {
              const h = Math.min(100, (r.actual / r.target) * 100);
              const hit = r.actual >= r.target;
              return (
                <div key={i} style={{ flex: "0 0 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <div style={{ fontSize: 10, color: hit ? "var(--green)" : "var(--muted)", marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round((r.actual / r.target) * 100)}%</div>
                  <div style={{ width: "60%", height: `${h}%`, background: hit ? "var(--green)" : "var(--amber)", minHeight: 3 }} />
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{r.month.slice(5)}</div>
                </div>
              );
            })}
            {emp.salesRecords.length === 0 && <div style={{ color: "var(--muted)", fontSize: 12 }}>暂无销售记录</div>}
          </div>
          {canManage && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input placeholder="YYYY-MM" style={{ ...inputStyle, width: 90 }} value={salesMonth} onChange={(e) => setSalesMonth(e.target.value)} />
              <input type="number" placeholder="实际业绩" style={{ ...inputStyle, width: 110 }} value={salesActual || ""} onChange={(e) => setSalesActual(Number(e.target.value))} />
              <Btn small tone="amber" disabled={!salesMonth || !salesActual} onClick={() => {
                if (emp.salesRecords.some((r) => r.month === salesMonth)) {
                  alert(`${salesMonth} 已经提交过销售记录，提交后不可更改，请确认月份是否正确。`);
                  return;
                }
                updateEmployee(emp.id, (e) => { e.salesRecords.push({ month: salesMonth, target: salesTarget, actual: salesActual }); return e; }, `${emp.name} · 添加销售记录 ${salesMonth}`);
                setSalesMonth(""); setSalesActual(0);
              }}>+ 添加月度记录</Btn>
            </div>
          )}
        </div>
      </Panel>

      {/* PROBLEM SOLVING (Level 1 / Gate 1 requirement) */}
      <Panel title="Problem Solving 项目 · Level 1" sub="Gate 1 要求完成至少 3 个跨部门 Problem Solving 项目">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13 }}>已完成 <b style={{ color: "var(--amber)" }}>{emp.problemSolvingCount || 0}</b> / 3</span>
          {canManage && (emp.problemSolvingCount || 0) < 3 && (
            <Btn small onClick={() => updateEmployee(emp.id, (e) => { e.problemSolvingCount = (e.problemSolvingCount || 0) + 1; return e; }, `${emp.name} · Problem Solving +1（Level 1）`)}>+1 完成项</Btn>
          )}
          {(emp.problemSolvingCount || 0) >= 3 && <Badge status="PASS" />}
        </div>
      </Panel>

      {/* GATE 1 */}
      <GatePanel title="GATE 1" requirements={gate1} eligible={gate1Eligible}
        managerPass={emp.gate1.managerPass} founderReview={emp.gate1.founderReview}
        canManagerAct={role === "MANAGER" || role === "FOUNDER"} canFounderAct={role === "FOUNDER"}
        onManagerPass={() => updateEmployee(emp.id, (e) => { e.gate1.managerPass = true; return e; }, `${emp.name} · Gate1 Manager PASS`)}
        onFounderReview={() => updateEmployee(emp.id, (e) => { e.gate1.founderReview = true; return e; }, `${emp.name} · Gate1 Founder Review 完成`)}
      />

      {gate1Eligible && !emp.level2Path && canManage && (
        <Panel title="选择 Level 2 发展方向">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn tone="amber" onClick={() => updateEmployee(emp.id, (e) => { e.level = 2; e.level2Path = "SC"; e.position = "SC Assistant"; return e; }, `${emp.name} · 进入 Level 2 (SC Assistant)`)}>SC Assistant（客户 / 流程 / 交付）</Btn>
            <Btn tone="amber" onClick={() => updateEmployee(emp.id, (e) => { e.level = 2; e.level2Path = "HT"; e.position = "HT Assistant"; return e; }, `${emp.name} · 进入 Level 2 (HT Assistant)`)}>HT Assistant（技术 / 品质 / 技师团队）</Btn>
          </div>
        </Panel>
      )}

      {/* LEVEL 2 */}
      {emp.level >= 2 && (
        <Panel title={`LEVEL 2 · ${emp.level2Path === "SC" ? "SC Assistant" : "HT Assistant"}`} sub="Leadership / SOP / Project / Problem Solving" accent="var(--amber)">
          {missionsConfig.map((m) => {
            const item = emp.missions[m.key] || { status: "LOCKED", count: 0 };
            const countMission = m.targetCount;
            const resolvedCertifier = resolveCertifierLabel(m.certifier, accounts);
            return (
              <div key={m.key}>
                <CertRow
                  item={item}
                  config={{ label: m.label, certifier: resolvedCertifier, tasks: m.desc ? [m.desc] : null, hasTarget: !!m.target, target: m.target, targetCount: m.targetCount }}
                  canAct={CanAct(role, certifierName, m.certifier)}
                  canSubmit={role === "EMPLOYEE"}
                  canEditConfig={canManage}
                  isMission
                  onSaveConfig={(patch) => updateMissionsConfigItem(m.key, patch)}
                  onSubmitEvidence={(ev) => setMission(m.key, { status: "PENDING_CERT", evidence: ev })}
                  onCertify={(status, score, comment) => setMission(m.key, { status, score, comment, certifiedAt: new Date().toISOString().slice(0, 10) })}
                />
                {countMission !== undefined && canManage && item.status !== "PASS" && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: -4, marginBottom: 8, marginLeft: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11.5, color: "var(--muted)" }}>已完成 {item.count || 0}/{countMission}</span>
                    <Btn small onClick={() => setMission(m.key, { count: (item.count || 0) + 1, status: (item.count || 0) + 1 >= countMission ? "PENDING_CERT" : "IN_PROGRESS" })}>+1 完成项</Btn>
                  </div>
                )}
              </div>
            );
          })}
        </Panel>
      )}

      {emp.level >= 2 && (
        <GatePanel title="GATE 2" requirements={gate2} eligible={gate2Eligible}
          managerPass={emp.gate2.managerPass} founderReview={emp.gate2.founderReview}
          canManagerAct={role === "MANAGER" || role === "FOUNDER"} canFounderAct={role === "FOUNDER"}
          onManagerPass={() => updateEmployee(emp.id, (e) => { e.gate2.managerPass = true; return e; }, `${emp.name} · Gate2 Manager PASS`)}
          onFounderReview={() => updateEmployee(emp.id, (e) => { e.gate2.founderReview = true; return e; }, `${emp.name} · Gate2 Founder Review 完成`)}
        />
      )}

      {gate2Eligible && emp.finalStatus !== "APPROVED" && role === "FOUNDER" && (
        <Panel title="最终晋升批准" accent="var(--green)">
          <div style={{ fontSize: 13, marginBottom: 12 }}>{emp.name} 已满足 Gate 2 全部条件，可批准为 <b>Assistant Operations Manager</b>。</div>
          <Btn tone="green" onClick={() => updateEmployee(emp.id, (e) => { e.finalStatus = "APPROVED"; e.position = "Assistant Operations Manager"; return e; }, `${emp.name} · Founder 批准晋升为 Assistant Operations Manager`)}>批准晋升</Btn>
        </Panel>
      )}

      {emp.finalStatus === "APPROVED" && (
        <Panel accent="var(--green)"><div style={{ fontSize: 14, color: "var(--green)", fontWeight: 700 }}>✓ 已晋升为 Assistant Operations Manager</div></Panel>
      )}

      <RedFlagPanel emp={emp} canManage={canManage} updateEmployee={updateEmployee} />
    </div>
  );
}

function GatePanel({ title, requirements, eligible, managerPass, founderReview, canManagerAct, canFounderAct, onManagerPass, onFounderReview }) {
  return (
    <Panel title={title} sub={eligible ? "全部条件已满足 — 代表获得晋升评估资格，不代表自动晋升" : "晋升评估资格进度"} accent={eligible ? "var(--green)" : "var(--amber)"}>
      {requirements.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
          <span style={{ width: 14, height: 14, border: `1px solid ${r.done ? "var(--green)" : "var(--line)"}`, background: r.done ? "var(--green)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#1C1B1A" }}>{r.done ? "✓" : ""}</span>
          <span style={{ color: r.done ? "var(--text)" : "var(--muted)" }}>{r.label}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {canManagerAct && !managerPass && <Btn small tone="amber" onClick={onManagerPass}>标记 Manager PASS</Btn>}
        {canFounderAct && !founderReview && <Btn small tone="amber" onClick={onFounderReview}>标记 Founder Review 完成</Btn>}
      </div>
    </Panel>
  );
}

function RedFlagPanel({ emp, canManage, updateEmployee }) {
  const [type, setType] = useState(RED_FLAG_TYPES[0]);
  const [desc, setDesc] = useState("");
  return (
    <Panel title="Red Flag" sub="出现红线行为，可暂停晋升；由 Manager + Founder Review 决定" accent={emp.redFlags.some(f => f.status === "ON_HOLD") ? "var(--red)" : undefined}>
      {emp.redFlags.length === 0 && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>暂无记录</div>}
      {emp.redFlags.map((f, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{f.type}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{f.desc} · {f.date}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge status={f.status === "ON_HOLD" ? "FAIL" : "PASS"} />
            {canManage && f.status === "ON_HOLD" && (
              <Btn small onClick={() => updateEmployee(emp.id, (e) => { e.redFlags[i].status = "RESOLVED"; return e; }, `${emp.name} · Red Flag 已解除`)}>解除</Btn>
            )}
          </div>
        </div>
      ))}
      {canManage && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, width: 180 }}>
            {RED_FLAG_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} placeholder="描述…" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Btn small tone="red" onClick={() => {
            updateEmployee(emp.id, (e) => { e.redFlags.push({ type, desc, date: new Date().toISOString().slice(0, 10), status: "ON_HOLD" }); return e; }, `${emp.name} · 记录 Red Flag：${type}`);
            setDesc("");
          }}>记录 Red Flag</Btn>
        </div>
      )}
    </Panel>
  );
}

/* ---------------- certifier queue ---------------- */

function CertifyQueue({ employees, role, certifierName, updateEmployee, crossLineConfig, missionsConfig }) {
  const seesAll = role === "FOUNDER" || role === "MANAGER";
  const matches = (certifierField) => seesAll || (certifierField || "").includes(certifierName || "\u0000");

  const rows = [];
  employees.forEach((emp) => {
    crossLineConfig.forEach((c) => {
      const item = emp.crossLine[c.key];
      if (item && matches(c.certifier) && (item.status === "PENDING_CERT" || item.status === "RETRY")) {
        rows.push({ emp, key: c.key, config: c, item, level: "L1" });
      }
    });
    if (emp.level >= 2) {
      missionsConfig.forEach((m) => {
        const item = emp.missions[m.key];
        if (item && matches(m.certifier) && (item.status === "PENDING_CERT" || item.status === "RETRY")) {
          rows.push({ emp, key: m.key, config: { label: m.label, certifier: m.certifier }, item, level: "L2" });
        }
      });
    }
  });

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 12.5, color: "var(--muted)" }}>
        {seesAll ? "查看全部待认证队列" : <>正在以 <span style={{ color: "var(--amber)" }}>{certifierName}</span> 身份查看待认证队列</>} · {rows.length} 项
      </div>
      {rows.length === 0 && <Panel><div style={{ fontSize: 13, color: "var(--muted)" }}>暂无待认证项目。</div></Panel>}
      {rows.map((r, i) => (
        <QueueRow key={i} row={r} updateEmployee={updateEmployee} />
      ))}
    </div>
  );
}

function QueueRow({ row, updateEmployee }) {
  const [score, setScore] = useState(80);
  const [comment, setComment] = useState("");
  const { emp, key, config, item, level } = row;
  const act = (status) => {
    updateEmployee(emp.id, (e) => {
      const target = level === "L1" ? e.crossLine : e.missions;
      target[key] = { ...target[key], status, score, comment, certifiedAt: new Date().toISOString().slice(0, 10) };
      return e;
    }, `${emp.name} · ${config.label} → ${status}`);
  };
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name} <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: 12.5 }}>· {config.label} ({level})</span></div>
          {item.evidence && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>证据：{item.evidence}</div>}
        </div>
        <Badge status={item.status} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="number" min="0" max="100" style={{ ...inputStyle, width: 70 }} value={score} onChange={(e) => setScore(Number(e.target.value))} />
        <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} placeholder="认证备注…" value={comment} onChange={(e) => setComment(e.target.value)} />
        <Btn small tone="green" onClick={() => act("PASS")}>PASS</Btn>
        <Btn small tone="red" onClick={() => act("FAIL")}>FAIL</Btn>
        <Btn small onClick={() => act("RETRY")}>需更多证据</Btn>
      </div>
    </Panel>
  );
}

/* ---------------- approval center ---------------- */

function ApprovalCenter({ employees, role, updateEmployee, onOpen, crossLineConfig, missionsConfig }) {
  const [reviewDraft, setReviewDraft] = useState({});

  if (role !== "MANAGER" && role !== "FOUNDER") {
    return <Panel><div style={{ fontSize: 13, color: "var(--muted)" }}>切换左侧「当前身份」为 Manager 或 Founder 以查看审批中心。</div></Panel>;
  }

  return (
    <div>
      {employees.map((emp) => {
        const g1 = gate1Requirements(emp, crossLineConfig);
        const g2 = gate2Requirements(emp, missionsConfig);
        const activeFlags = emp.redFlags.filter((f) => f.status === "ON_HOLD");
        const draft = reviewDraft[emp.id] || { recommendation: "", decision: "APPROVED" };
        return (
          <Panel key={emp.id} title={emp.name} sub={`${emp.position} · Level ${emp.level}`}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ fontSize: 12.5 }}>
                <div style={{ color: "var(--muted)", marginBottom: 4 }}>Gate 1</div>
                <div style={{ color: g1.every(r => r.done) ? "var(--green)" : "var(--text)" }}>{g1.filter(r => r.done).length}/{g1.length} 达成</div>
              </div>
              {emp.level >= 2 && (
                <div style={{ fontSize: 12.5 }}>
                  <div style={{ color: "var(--muted)", marginBottom: 4 }}>Gate 2</div>
                  <div style={{ color: g2.every(r => r.done) ? "var(--green)" : "var(--text)" }}>{g2.filter(r => r.done).length}/{g2.length} 达成</div>
                </div>
              )}
              <div style={{ fontSize: 12.5 }}>
                <div style={{ color: "var(--muted)", marginBottom: 4 }}>Red Flags (Active)</div>
                <div style={{ color: activeFlags.length ? "var(--red)" : "var(--green)" }}>{activeFlags.length}</div>
              </div>
              <Btn small onClick={() => onOpen(emp.id)}>查看完整档案</Btn>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>提交 Promotion Review</div>
              <textarea
                style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                placeholder="Manager Recommendation…"
                value={draft.recommendation}
                onChange={(e) => setReviewDraft({ ...reviewDraft, [emp.id]: { ...draft, recommendation: e.target.value } })}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  style={{ ...inputStyle, width: 180 }}
                  value={draft.decision}
                  onChange={(e) => setReviewDraft({ ...reviewDraft, [emp.id]: { ...draft, decision: e.target.value } })}
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="EXTEND">EXTEND DEVELOPMENT</option>
                  <option value="RETRY">RETRY</option>
                </select>
                <Btn small tone="amber" disabled={!draft.recommendation} onClick={() => {
                  updateEmployee(emp.id, (e) => {
                    e.promotionReviews.push({
                      date: new Date().toISOString().slice(0, 10),
                      recommendation: draft.recommendation, decision: draft.decision, by: role,
                    });
                    return e;
                  }, `${emp.name} · Promotion Review 提交（${draft.decision}）`);
                  setReviewDraft({ ...reviewDraft, [emp.id]: { recommendation: "", decision: "APPROVED" } });
                }}>提交 Review</Btn>
              </div>

              {emp.promotionReviews.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {emp.promotionReviews.slice().reverse().map((r, i) => (
                    <div key={i} style={{ fontSize: 12, padding: "6px 0", borderTop: "1px solid var(--line)", color: "var(--muted)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.date}</span> · <span style={{ color: r.decision === "APPROVED" ? "var(--green)" : r.decision === "REJECTED" ? "var(--red)" : "var(--amber)" }}>{r.decision}</span> · {r.recommendation}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

/* ---------------- login ---------------- */

function LoginScreen({ accounts, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const acc = accounts.find((a) => a.username.trim().toLowerCase() === username.trim().toLowerCase() && a.password === password);
    if (!acc) { setError("账号或密码不正确"); return; }
    setError("");
    onLogin(acc);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 480, padding: 24 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 320, border: "1px solid var(--line)", background: "var(--panel)", padding: 28, position: "relative" }}>
        <CornerMarks />
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22 }}>KC AUTO</div>
          <div style={{ fontSize: 11, color: "var(--amber)", letterSpacing: 1.5, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>PERFORMANCE · 晋升系统登录</div>
        </div>
        <Field label="账号 ID">
          <input autoFocus style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="登录 ID" />
        </Field>
        <Field label="密码 PASSWORD">
          <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
        </Field>
        {error && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", background: "var(--amber)", border: "1px solid var(--amber)", color: "#1C1B1A", padding: "10px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>登录</button>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 16, textAlign: "center", lineHeight: 1.6 }}>
          没有账号？请联系 Boss 在「账号管理」中为你新增。
        </div>
      </form>
    </div>
  );
}

/* ---------------- accounts admin (Boss only) ---------------- */

function AccountRow({ acc, employees, currentUser, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(acc.displayName);
  const [username, setUsername] = useState(acc.username);
  const [password, setPassword] = useState(acc.password);
  const [role, setRole] = useState(acc.role);
  const [certifierScope, setCertifierScope] = useState(acc.certifierScope || "");
  const [employeeId, setEmployeeId] = useState(acc.employeeId || "");

  const save = () => {
    onUpdate(acc.id, {
      displayName, username: username.trim(), password,
      role,
      certifierScope: role === "CERTIFIER" ? certifierScope : null,
      employeeId: role === "EMPLOYEE" ? employeeId : null,
    });
    setEditing(false);
  };

  return (
    <div style={{ border: "1px solid var(--line)", background: "var(--track)", marginBottom: 8, padding: 12 }}>
      {!editing ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{acc.displayName} {acc.id === currentUser.id && <span style={{ fontSize: 10, color: "var(--amber)" }}>（当前登录）</span>}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              ID: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{acc.username}</span> · 密码: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{acc.password}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--amber)", marginTop: 2 }}>
              {ROLE_LABELS[acc.role]}{acc.certifierScope ? ` · 负责认证：${acc.certifierScope}` : ""}{acc.employeeId ? ` · 对应员工：${(employees.find(e => e.id === acc.employeeId) || {}).name || acc.employeeId}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={() => setEditing(true)}>编辑</Btn>
            <Btn small tone="red" onClick={() => onDelete(acc.id)}>删除</Btn>
          </div>
        </div>
      ) : (
        <div>
          <Field label="姓名 DISPLAY NAME"><input style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field>
          <Field label="登录 ID"><input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} /></Field>
          <Field label="密码 PASSWORD"><input style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <Field label="角色 ROLE">
            <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="FOUNDER">Founder</option>
              <option value="MANAGER">Manager</option>
              <option value="CERTIFIER">部门认证人 Certifier</option>
              <option value="EMPLOYEE">员工 Employee</option>
            </select>
          </Field>
          {role === "CERTIFIER" && (
            <Field label="负责认证的部门 / 名称（须与任务中「认证人」文字对应）">
              <input style={inputStyle} value={certifierScope} onChange={(e) => setCertifierScope(e.target.value)} placeholder="例如：Kim" />
            </Field>
          )}
          {role === "EMPLOYEE" && (
            <Field label="对应员工档案">
              <select style={inputStyle} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                <option value="">— 选择员工 —</option>
                {employees.map((e2) => <option key={e2.id} value={e2.id}>{e2.name}</option>)}
              </select>
            </Field>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn small tone="amber" onClick={save}>保存</Btn>
            <Btn small onClick={() => setEditing(false)}>取消</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountsAdmin({ accounts, employees, currentUser, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CERTIFIER");
  const [certifierScope, setCertifierScope] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const submitAdd = () => {
    if (!displayName.trim() || !username.trim() || !password.trim()) return;
    onAdd({
      displayName: displayName.trim(), username: username.trim(), password: password.trim(),
      role, certifierScope: role === "CERTIFIER" ? certifierScope.trim() : null,
      employeeId: role === "EMPLOYEE" ? employeeId : null,
    });
    setDisplayName(""); setUsername(""); setPassword(""); setCertifierScope(""); setEmployeeId(""); setAdding(false);
  };

  return (
    <div>
      <Panel title="账号列表" sub="全部部门认证人以自己的 ID 登录后台，仅能操作自己负责认证的项目。姓名、ID、密码均由 Boss 在此设定">
        {accounts.map((acc) => (
          <AccountRow key={acc.id} acc={acc} employees={employees} currentUser={currentUser} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </Panel>

      <Panel title="新增账号">
        {!adding ? (
          <Btn tone="amber" onClick={() => setAdding(true)}>+ 新增账号</Btn>
        ) : (
          <div>
            <Field label="姓名 DISPLAY NAME"><input style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例如：Kim" /></Field>
            <Field label="登录 ID"><input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="例如：kim" /></Field>
            <Field label="密码 PASSWORD"><input style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="设定密码" /></Field>
            <Field label="角色 ROLE">
              <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="FOUNDER">Founder</option>
                <option value="MANAGER">Manager</option>
                <option value="CERTIFIER">部门认证人 Certifier</option>
                <option value="EMPLOYEE">员工 Employee</option>
              </select>
            </Field>
            {role === "CERTIFIER" && (
              <Field label="负责认证的部门 / 名称（须与任务中「认证人」文字对应）">
                <input style={inputStyle} value={certifierScope} onChange={(e) => setCertifierScope(e.target.value)} placeholder="例如：Kim" />
              </Field>
            )}
            {role === "EMPLOYEE" && (
              <Field label="对应员工档案">
                <select style={inputStyle} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                  <option value="">— 选择员工 —</option>
                  {employees.map((e2) => <option key={e2.id} value={e2.id}>{e2.name}</option>)}
                </select>
              </Field>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Btn small tone="amber" onClick={submitAdd}>保存新账号</Btn>
              <Btn small onClick={() => setAdding(false)}>取消</Btn>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
