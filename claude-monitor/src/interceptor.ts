// Claude API 拦截器
import { randomUUID } from 'crypto';
import { CLAUDE_PRICING } from './config.js';

export interface APIRequest {
  id: string;
  timestamp: Date;
  model: string;
  input_tokens?: number;
  request_type: string;
}

export interface APIResponse {
  id: string;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  response_time: number;
  success: boolean;
  error?: string;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

// 全局存储当前请求信息
const activeRequests = new Map<string, APIRequest>();

// 计算Token使用费用
export function calculateCost(model: string, usage: TokenUsage): number {
  const pricing = CLAUDE_PRICING[model as keyof typeof CLAUDE_PRICING];
  if (!pricing) {
    console.warn(`Unknown model: ${model}`);
    return 0;
  }

  const inputCost = pricing.per_million
    ? (usage.input_tokens / 1_000_000) * pricing.input
    : usage.input_tokens * pricing.input;

  const outputCost = pricing.per_million
    ? (usage.output_tokens / 1_000_000) * pricing.output
    : usage.output_tokens * pricing.output;

  return inputCost + outputCost;
}

// 创建API拦截函数
export function createAPIInterceptor(onRequest: (req: APIRequest) => void,
                                     onResponse: (res: APIResponse) => void) {

  // 拦截Anthropic SDK的API调用
  function interceptCreate() {
    const Module = require('module');
    const originalRequire = Module.prototype.require;

    Module.prototype.require = function(id: string) {
      const module = originalRequire.apply(this, arguments);

      // 拦截@anthropic-ai/sdk
      if (id === '@anthropic-ai/sdk') {
        const originalMessages = module.default?.prototype?.messages;
        const originalCreate = module.default?.prototype?.create;

        // 拦截messages方法
        if (originalMessages) {
          module.default.prototype.messages = async function(...args: any[]) {
            const requestId = randomUUID();
            const startTime = Date.now();

            // 解析请求参数
            const [messages] = args;
            let inputTokens = 0;
            let model = 'claude-3-sonnet'; // 默认模型

            if (messages && Array.isArray(messages)) {
              // 简单估算输入tokens（实际应该用tokenizer）
              inputTokens = messages.reduce((sum: number, msg: any) => {
                return sum + Math.ceil((JSON.stringify(msg).length || 0) / 4);
              }, 0);
            }

            // 记录请求
            const request: APIRequest = {
              id: requestId,
              timestamp: new Date(),
              model,
              input_tokens: inputTokens,
              request_type: 'messages'
            };

            activeRequests.set(requestId, request);
            onRequest(request);

            try {
              // 执行原始请求
              const response = await originalMessages.apply(this, args);
              const endTime = Date.now();

              // 提取使用信息
              const usage = response.usage || {};
              const outputTokens = usage.output_tokens || 0;
              const totalTokens = usage.total_tokens || inputTokens + outputTokens;

              // 计算费用
              const cost = calculateCost(model, {
                input_tokens: usage.input_tokens || inputTokens,
                output_tokens: outputTokens,
                total_tokens: totalTokens
              });

              // 记录响应
              const apiResponse: APIResponse = {
                id: requestId,
                output_tokens: outputTokens,
                total_tokens: totalTokens,
                cost: cost,
                response_time: endTime - startTime,
                success: true
              };

              onResponse(apiResponse);
              activeRequests.delete(requestId);

              return response;
            } catch (error: any) {
              const endTime = Date.now();

              // 记录错误响应
              const apiResponse: APIResponse = {
                id: requestId,
                output_tokens: 0,
                total_tokens: inputTokens,
                cost: 0,
                response_time: endTime - startTime,
                success: false,
                error: error.message
              };

              onResponse(apiResponse);
              activeRequests.delete(requestId);

              throw error;
            }
          };
        }

        // 拦截create方法
        if (originalCreate) {
          module.default.prototype.create = async function(...args: any[]) {
            const requestId = randomUUID();
            const startTime = Date.now();

            // 解析请求参数
            let inputTokens = 0;
            let model = args[0]?.model || 'claude-3-sonnet';
            let requestType = 'create';

            if (args[0]?.prompt) {
              inputTokens = Math.ceil((args[0].prompt.length || 0) / 4);
            } else if (args[0]?.messages) {
              inputTokens = Math.ceil((JSON.stringify(args[0].messages).length || 0) / 4);
              requestType = 'messages';
            }

            // 记录请求
            const request: APIRequest = {
              id: requestId,
              timestamp: new Date(),
              model,
              input_tokens: inputTokens,
              request_type: requestType
            };

            activeRequests.set(requestId, request);
            onRequest(request);

            try {
              // 执行原始请求
              const response = await originalCreate.apply(this, args);
              const endTime = Date.now();

              // 提取使用信息
              const usage = response.usage || {};
              const outputTokens = usage.output_tokens || 0;
              const totalTokens = usage.total_tokens || inputTokens + outputTokens;

              // 计算费用
              const cost = calculateCost(model, {
                input_tokens: usage.input_tokens || inputTokens,
                output_tokens: outputTokens,
                total_tokens: totalTokens
              });

              // 记录响应
              const apiResponse: APIResponse = {
                id: requestId,
                output_tokens: outputTokens,
                total_tokens: totalTokens,
                cost: cost,
                response_time: endTime - startTime,
                success: true
              };

              onResponse(apiResponse);
              activeRequests.delete(requestId);

              return response;
            } catch (error: any) {
              const endTime = Date.now();

              // 记录错误响应
              const apiResponse: APIResponse = {
                id: requestId,
                output_tokens: 0,
                total_tokens: inputTokens,
                cost: 0,
                response_time: endTime - startTime,
                success: false,
                error: error.message
              };

              onResponse(apiResponse);
              activeRequests.delete(requestId);

              throw error;
            }
          };
        }
      }

      return module;
    };
  }

  return { interceptCreate };
}

// 获取活跃请求统计
export function getActiveRequestsStats() {
  const stats = {
    count: activeRequests.size,
    models: {} as Record<string, number>,
    oldestRequest: null as Date | null
  };

  for (const [_, request] of activeRequests) {
    stats.models[request.model] = (stats.models[request.model] || 0) + 1;
    if (!stats.oldestRequest || request.timestamp < stats.oldestRequest) {
      stats.oldestRequest = request.timestamp;
    }
  }

  return stats;
}