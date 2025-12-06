// Claude Token Monitor 配置文件

export const CLAUDE_PRICING = {
  'claude-3-opus': {
    input: 15.0,    // $15 per million tokens
    output: 75.0,   // $75 per million tokens
    per_million: true
  },
  'claude-3-sonnet': {
    input: 3.0,
    output: 15.0,
    per_million: true
  },
  'claude-3-haiku': {
    input: 0.25,
    output: 1.25,
    per_million: true
  },
  'claude-3.5-sonnet': {
    input: 3.0,
    output: 15.0,
    per_million: true
  }
};

export const DEFAULT_BUDGETS = {
  daily: 10,      // $10 per day
  monthly: 200,   // $200 per month
  total: 1000     // $1000 total
};

export const MONITOR_CONFIG = {
  UPDATE_INTERVAL: 30000,  // 30 seconds
  DB_PATH: './monitor.db',
  LOG_RETENTION_DAYS: 90,
  ALERT_THRESHOLDS: {
    warning: 0.8,  // 80% of budget
    critical: 0.95  // 95% of budget
  }
};

export const UI_CONFIG = {
  COLORS: {
    primary: '#FF6B6B',
    success: '#4ECDC4',
    warning: '#FFE66D',
    danger: '#FF6B6B',
    info: '#95E1D3'
  },
  SYMBOLS: {
    loading: '⏳',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    token: '🪙',
    dollar: '💰',
    chart: '📊'
  }
};