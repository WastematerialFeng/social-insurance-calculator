'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalculationResult } from '@/types'
import { FileText, RefreshCw, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function ResultsPage() {
  const [results, setResults] = useState<CalculationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // 只在组件挂载时获取数据
  useEffect(() => {
    setMounted(true)
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/results?page=1&limit=50', {
        cache: 'no-store'
      })
      const data = await response.json()

      console.log('Results API response:', data)

      if (data.success && data.data) {
        console.log('Setting results:', data.data.length, 'items')
        setResults(data.data)
      } else {
        console.error('API returned error:', data.message)
        setError(data.message || '获取结果失败')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('获取结果时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleClearResults = async () => {
    if (!confirm('确定要清空所有计算结果吗？此操作不可恢复。')) {
      return
    }

    try {
      const response = await fetch('/api/results', { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        setResults([])
        alert('计算结果已清空')
      } else {
        setError(data.message || '清空结果失败')
      }
    } catch (error) {
      setError('清空结果时发生错误')
    }
  }

  // Calculate summary statistics
  const summary = {
    totalEmployees: results.length,
    totalCompanyFee: results.reduce((sum, r) => sum + r.company_fee, 0),
    totalIndividualFee: results.reduce((sum, r) => sum + r.individual_fee, 0),
    totalFee: results.reduce((sum, r) => sum + r.total_fee, 0),
    avgCompanyFee: results.length > 0 ? results.reduce((sum, r) => sum + r.company_fee, 0) / results.length : 0,
    avgIndividualFee: results.length > 0 ? results.reduce((sum, r) => sum + r.individual_fee, 0) / results.length : 0,
    avgTotalFee: results.length > 0 ? results.reduce((sum, r) => sum + r.total_fee, 0) / results.length : 0
  }

  // 如果还没挂载，返回空
  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              社保费用计算结果
            </h1>
            <p className="text-lg text-slate-600">
              查看和分析员工社保公积金费用计算结果
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          {results.length > 0 && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">员工总数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    参与社保计算
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">公司总承担</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ¥{summary.totalCompanyFee.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    月均 ¥{summary.avgCompanyFee.toFixed(2)}/人
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">个人总承担</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{summary.totalIndividualFee.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    月均 ¥{summary.avgIndividualFee.toFixed(2)}/人
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">费用总计</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{summary.totalFee.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    月均 ¥{summary.avgTotalFee.toFixed(2)}/人
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>计算结果明细</CardTitle>
                  <CardDescription>
                    每位员工的社保费用计算详情
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={fetchResults}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                  {results.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearResults}
                      className="text-red-600 hover:text-red-700"
                    >
                      清空结果
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">加载中...</span>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">暂无计算结果</p>
                  <p className="text-gray-400 text-sm mt-2">
                    请先上传数据并执行计算
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => window.location.href = '/upload'}
                  >
                    前往上传数据
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          员工工号
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          员工姓名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          城市
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          月平均工资
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          缴费基数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          公司承担
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          个人承担
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          总计
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          月数
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.map((row, index) => (
                        <tr key={`${row.employee_id}-${row.city_name}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.employee_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.employee_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.city_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ¥{row.avg_salary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ¥{row.contribution_base.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            ¥{row.company_fee.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            ¥{row.individual_fee.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ¥{row.total_fee.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.months_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}