// SQLite 数据存储系统
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import { MONITOR_CONFIG, DEFAULT_BUDGETS } from './config.js';
import { APIRequest, APIResponse } from './interceptor.js';

export interface UsageRecord {
  id: string;
  timestamp: Date;
  model: string;
  request_type: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  response_time: number;
  success: boolean;
  error?: string;
}

export interface DailyStats {
  date: string;
  total_tokens: number;
  total_cost: number;
  call_count: number;
  success_count: number;
  error_count: number;
  avg_response_time: number;
}

export interface BudgetConfig {
  id?: number;
  type: 'daily' | 'monthly' | 'total';
  threshold: number;
  alert_threshold: number;
  is_active: boolean;
  created_at?: Date;
}

export class StorageManager {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.resolve(MONITOR_CONFIG.DB_PATH);
  }

  // 初始化数据库
  async init(): Promise<void> {
    try {
      // 确保数据库目录存在
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // 打开数据库连接
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // 创建数据表
      await this.createTables();
      await this.insertDefaultBudgets();

      console.log(`✅ 数据库初始化成功: ${this.dbPath}`);
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error);
      throw error;
    }
  }

  // 创建数据表
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // API调用记录表
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS usage_records (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        model TEXT NOT NULL,
        request_type TEXT NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        total_tokens INTEGER NOT NULL,
        cost REAL NOT NULL,
        response_time INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        error TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // 每日统计表
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        date TEXT PRIMARY KEY,
        total_tokens INTEGER DEFAULT 0,
        total_cost REAL DEFAULT 0,
        call_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        avg_response_time REAL DEFAULT 0,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // 预算配置表
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS budget_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT UNIQUE NOT NULL,
        threshold REAL NOT NULL,
        alert_threshold REAL DEFAULT 0.8,
        is_active BOOLEAN DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // 创建索引
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_records(timestamp);
      CREATE INDEX IF NOT EXISTS idx_usage_model ON usage_records(model);
      CREATE INDEX IF NOT EXISTS idx_usage_success ON usage_records(success);
    `);
  }

  // 插入默认预算配置
  private async insertDefaultBudgets(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const budgets = [
      { type: 'daily', threshold: DEFAULT_BUDGETS.daily },
      { type: 'monthly', threshold: DEFAULT_BUDGETS.monthly },
      { type: 'total', threshold: DEFAULT_BUDGETS.total }
    ];

    for (const budget of budgets) {
      await this.db.run(`
        INSERT OR IGNORE INTO budget_config (type, threshold)
        VALUES (?, ?)
      `, [budget.type, budget.threshold]);
    }
  }

  // 记录API调用
  async recordCall(request: APIRequest, response: APIResponse): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.run(`
        INSERT INTO usage_records (
          id, timestamp, model, request_type,
          input_tokens, output_tokens, total_tokens,
          cost, response_time, success, error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        response.id,
        request.timestamp.getTime(),
        request.model,
        request.request_type,
        request.input_tokens || 0,
        response.output_tokens,
        response.total_tokens,
        response.cost,
        response.response_time,
        response.success,
        response.error || null
      ]);

      // 更新每日统计
      await this.updateDailyStats(request.timestamp);
    } catch (error) {
      console.error('记录API调用失败:', error);
    }
  }

  // 更新每日统计
  private async updateDailyStats(timestamp: Date): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const date = timestamp.toISOString().split('T')[0];

    // 计算当日统计
    const stats = await this.db.get(`
      SELECT
        COUNT(*) as call_count,
        SUM(total_tokens) as total_tokens,
        SUM(cost) as total_cost,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as error_count,
        AVG(response_time) as avg_response_time
      FROM usage_records
      WHERE DATE(timestamp/1000, 'unixepoch') = ?
    `, [date]);

    // 更新或插入统计记录
    await this.db.run(`
      INSERT OR REPLACE INTO daily_stats (
        date, total_tokens, total_cost, call_count,
        success_count, error_count, avg_response_time, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      date,
      stats.total_tokens || 0,
      stats.total_cost || 0,
      stats.call_count || 0,
      stats.success_count || 0,
      stats.error_count || 0,
      stats.avg_response_time || 0,
      Date.now()
    ]);
  }

  // 获取使用统计
  async getUsageStats(period: 'today' | 'week' | 'month' | 'all'): Promise<{
    total_tokens: number;
    total_cost: number;
    call_count: number;
    success_rate: number;
    avg_response_time: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    let dateFilter = '';
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = `AND DATE(timestamp/1000, 'unixepoch') = '${now.toISOString().split('T')[0]}'`;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `AND timestamp >= ${weekAgo.getTime()}`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = `AND timestamp >= ${monthAgo.getTime()}`;
        break;
    }

    const stats = await this.db.get(`
      SELECT
        SUM(total_tokens) as total_tokens,
        SUM(cost) as total_cost,
        COUNT(*) as call_count,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
        AVG(response_time) as avg_response_time
      FROM usage_records
      WHERE 1=1 ${dateFilter}
    `);

    const successRate = stats.call_count > 0
      ? (stats.success_count / stats.call_count) * 100
      : 0;

    return {
      total_tokens: stats.total_tokens || 0,
      total_cost: stats.total_cost || 0,
      call_count: stats.call_count || 0,
      success_rate: Math.round(successRate * 100) / 100,
      avg_response_time: Math.round((stats.avg_response_time || 0) * 100) / 100
    };
  }

  // 获取最近的使用记录
  async getRecentCalls(limit: number = 10): Promise<UsageRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`
      SELECT
        id, timestamp, model, request_type,
        input_tokens, output_tokens, total_tokens,
        cost, response_time, success, error
      FROM usage_records
      ORDER BY timestamp DESC
      LIMIT ?
    `, [limit]);

    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
  }

  // 获取预算配置
  async getBudgetConfig(): Promise<BudgetConfig[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all('SELECT * FROM budget_config WHERE is_active = 1');
  }

  // 更新预算配置
  async updateBudgetConfig(type: string, threshold: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE budget_config
      SET threshold = ?, updated_at = ?
      WHERE type = ?
    `, [threshold, Date.now(), type]);
  }

  // 获取每日统计数据
  async getDailyStats(days: number = 30): Promise<DailyStats[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`
      SELECT *
      FROM daily_stats
      WHERE date >= date('now', '-${days} days')
      ORDER BY date DESC
    `);

    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
  }

  // 清理旧数据
  async cleanupOldData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MONITOR_CONFIG.LOG_RETENTION_DAYS);

    const result = await this.db.run(`
      DELETE FROM usage_records
      WHERE timestamp < ?
    `, [cutoffDate.getTime()]);

    if (result.changes && result.changes > 0) {
      console.log(`🧹 清理了 ${result.changes} 条旧记录`);
    }
  }

  // 导出数据
  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const records = await this.db.all(`
      SELECT *
      FROM usage_records
      ORDER BY timestamp DESC
    `);

    if (format === 'json') {
      return JSON.stringify(records, null, 2);
    } else {
      // CSV格式
      const headers = Object.keys(records[0] || {}).join(',');
      const rows = records.map(r => Object.values(r).join(','));
      return [headers, ...rows].join('\n');
    }
  }

  // 关闭数据库连接
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}