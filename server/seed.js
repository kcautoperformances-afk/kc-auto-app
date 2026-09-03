export const DEFAULT_CROSS_LINE_CONFIG = [
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

export const DEFAULT_MISSIONS_CONFIG = [
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

export function seedEmployees() {
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

export function seedAccounts() {
  return [
    { id: "acc-boss", username: "boss", password: "boss2026", displayName: "Boss", role: "FOUNDER", certifierScope: null, employeeId: null },
    { id: "acc-wy", username: "wy", password: "wy2026", displayName: "WY", role: "MANAGER", certifierScope: null, employeeId: null },
    { id: "acc-kim", username: "kim", password: "kim2026", displayName: "Kim", role: "CERTIFIER", certifierScope: "Kim", employeeId: null },
    { id: "acc-qing", username: "qing", password: "qing2026", displayName: "Qing", role: "CERTIFIER", certifierScope: "Qing", employeeId: null },
    { id: "acc-yoyo", username: "yoyo", password: "yoyo2026", displayName: "Yoyo", role: "CERTIFIER", certifierScope: "Yoyo", employeeId: null },
    { id: "acc-store", username: "store", password: "store2026", displayName: "Store 负责人", role: "CERTIFIER", certifierScope: "Store 负责人", employeeId: null },
    { id: "acc-aisyah", username: "aisyah", password: "aisyah2026", displayName: "Aisyah", role: "EMPLOYEE", certifierScope: null, employeeId: "emp-001" },
  ];
}

export const DEFAULT_POSITION_DESCRIPTIONS = {
  SC: { title: "SC Assistant", tag: "协助", body: "管车 + 管客户：跟进车辆进度、协调技师/零件、更新客户、追踪交车" },
  HT: { title: "HT Assistant", tag: "协助", body: "管技术 + 管品质：协助诊断、技术执行、QC、技师安排与培训、减少返工" },
  AOM: { title: "Assistant Operations Manager", tag: "", body: "管人 + 管流程：跨部门协调、KPI、SOP、解决营运问题、提升整体效率" },
};

export function defaultData() {
  return {
    employees: seedEmployees(),
    taskConfig: { crossLine: DEFAULT_CROSS_LINE_CONFIG, missions: DEFAULT_MISSIONS_CONFIG },
    accounts: seedAccounts(),
    positionDescriptions: DEFAULT_POSITION_DESCRIPTIONS,
    log: [],
  };
}
