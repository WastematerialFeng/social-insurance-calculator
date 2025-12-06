import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            五险一金计算器
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            根据员工工资数据和城市社保标准，自动计算公司应缴纳的社保公积金费用
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Data Upload Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <Link href="/upload">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">数据上传</CardTitle>
                <CardDescription className="text-base">
                  上传城市标准和员工工资Excel文件
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-500 mb-4">
                  支持 .xlsx 格式的Excel文件上传
                </p>
                <div className="space-y-2 text-left text-sm text-slate-600">
                  <p>• 上传城市社保标准数据</p>
                  <p>• 上传员工工资记录</p>
                  <p>• 执行批量计算</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Results Query Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <Link href="/results">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">结果查询</CardTitle>
                <CardDescription className="text-base">
                  查看已计算完成的社保费用结果
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-500 mb-4">
                  展示详细的计算结果和统计信息
                </p>
                <div className="space-y-2 text-left text-sm text-slate-600">
                  <p>• 员工社保费用明细</p>
                  <p>• 公司承担部分汇总</p>
                  <p>• 支持清空重算</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>计算规则说明</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">缴费基数确定</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• 低于基数下限：按下限计算</li>
                    <li>• 高于基数上限：按上限计算</li>
                    <li>• 介于区间内：按实际工资计算</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">费用承担比例</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• 总比例：1.4%</li>
                    <li>• 公司承担：70%（0.98%）</li>
                    <li>• 个人承担：30%（0.42%）</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
