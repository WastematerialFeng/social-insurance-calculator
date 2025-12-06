'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUploader } from '@/components/upload/file-uploader'
import { Upload, Calculator, CheckCircle, AlertCircle, Download } from 'lucide-react'

export default function UploadPage() {
  const [citiesFile, setCitiesFile] = useState<File | null>(null)
  const [salariesFile, setSalariesFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [calculationStatus, setCalculationStatus] = useState<'idle' | 'calculating' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [calculationYear, setCalculationYear] = useState('2024')
  const [manualCityInput, setManualCityInput] = useState('')

  // Fetch available cities on component mount
  React.useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/calculate')
      const data = await response.json()
      // API returns { cities: [...], years: [...] }
      if (data.cities && Array.isArray(data.cities)) {
        setAvailableCities(data.cities)
        // 默认选择第一个城市
        if (data.cities.length > 0) {
          setSelectedCities([data.cities[0]])
        }
      } else if (data.success === false) {
        setMessage(`提示：${data.message}。请先上传城市标准数据。`)
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error)
      setMessage('无法获取城市数据，请确保已上传城市标准数据')
    }
  }

  const handleCitiesUpload = async () => {
    if (!citiesFile) {
      setMessage('请选择城市标准Excel文件')
      return
    }

    setUploadStatus('uploading')
    setMessage('正在上传城市数据...')

    const formData = new FormData()
    formData.append('file', citiesFile)
    formData.append('type', 'cities')
    formData.append('overwrite', 'true')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadStatus('success')
        setMessage(`城市数据上传成功！共导入 ${result.data.rowsInserted} 条记录`)
        fetchCities() // Refresh available cities
      } else {
        setUploadStatus('error')
        setMessage(result.message || '上传失败')
      }
    } catch (error) {
      setUploadStatus('error')
      setMessage('上传过程中发生错误')
    }
  }

  const handleSalariesUpload = async () => {
    if (!salariesFile) {
      setMessage('请选择员工工资Excel文件')
      return
    }

    setUploadStatus('uploading')
    setMessage('正在上传工资数据...')

    const formData = new FormData()
    formData.append('file', salariesFile)
    formData.append('type', 'salaries')
    formData.append('overwrite', 'true')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadStatus('success')
        setMessage(`工资数据上传成功！共导入 ${result.data.rowsInserted} 条记录`)
      } else {
        setUploadStatus('error')
        setMessage(result.message || '上传失败')
      }
    } catch (error) {
      setUploadStatus('error')
      setMessage('上传过程中发生错误')
    }
  }

  const handleCalculate = async () => {
    if (selectedCities.length === 0) {
      setMessage('请选择至少一个城市进行计算')
      return
    }

    setCalculationStatus('calculating')
    setMessage('正在进行社保费用计算...')

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cityNames: selectedCities,
          calculationYear
        })
      })

      const result = await response.json()

      if (result.success) {
        setCalculationStatus('success')
        setMessage(
          `计算完成！${result.data.summary.totalEmployees} 名员工的社保费用已计算完成。` +
          `公司总承担：¥${result.data.summary.totalCompanyFee.toFixed(2)}`
        )
      } else {
        setCalculationStatus('error')
        setMessage(result.message || '计算失败')
      }
    } catch (error) {
      setCalculationStatus('error')
      setMessage('计算过程中发生错误')
    }
  }

  const toggleCitySelection = (cityName: string) => {
    setSelectedCities(prev =>
      prev.includes(cityName)
        ? prev.filter(c => c !== cityName)
        : [...prev, cityName]
    )
  }

  const addManualCity = () => {
    if (manualCityInput.trim() && !selectedCities.includes(manualCityInput.trim())) {
      setSelectedCities(prev => [...prev, manualCityInput.trim()])
      setManualCityInput('')
    }
  }

  const downloadTemplate = (type: 'cities' | 'salaries') => {
    const link = document.createElement('a')
    link.href = `/${type}-template.xlsx`
    link.download = `${type}-template.xlsx`
    link.click()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              数据上传与计算
            </h1>
            <p className="text-lg text-slate-600">
              上传城市标准和员工工资数据，执行社保费用计算
            </p>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              uploadStatus === 'success' || calculationStatus === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {uploadStatus === 'success' || calculationStatus === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cities Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>城市标准数据</span>
                </CardTitle>
                <CardDescription>
                  上传各城市的社保缴费基数和比例标准
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploader
                  onFileSelect={setCitiesFile}
                  description="上传城市标准Excel文件"
                  exampleFormat={[
                    'city_name | year | base_min | base_max | rate',
                    '佛山 | 2024 | 4546 | 26421 | 0.014'
                  ]}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCitiesUpload}
                    disabled={!citiesFile || uploadStatus === 'uploading'}
                    className="flex-1"
                  >
                    {uploadStatus === 'uploading' ? '上传中...' : '上传城市数据'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadTemplate('cities')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    模板
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Salaries Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>员工工资数据</span>
                </CardTitle>
                <CardDescription>
                  上传员工的月度工资发放记录
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploader
                  onFileSelect={setSalariesFile}
                  description="上传员工工资Excel文件"
                  exampleFormat={[
                    'employee_id | employee_name | month | salary_amount',
                    '0001 | 张三 | 202401 | 8500'
                  ]}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSalariesUpload}
                    disabled={!salariesFile || uploadStatus === 'uploading'}
                    className="flex-1"
                  >
                    {uploadStatus === 'uploading' ? '上传中...' : '上传工资数据'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadTemplate('salaries')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    模板
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculation Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>执行社保费用计算</span>
              </CardTitle>
              <CardDescription>
                选择要计算的城市和年份，系统将自动计算所有员工的社保费用
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计算年份
                </label>
                <input
                  type="text"
                  value={calculationYear}
                  onChange={(e) => setCalculationYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：2024"
                />
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择城市（可多选）
                </label>
                {availableCities.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {availableCities.map((city) => (
                      <label
                        key={city}
                        className={`
                          flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors
                          ${selectedCities.includes(city)
                            ? 'bg-blue-50 text-blue-700 border border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCities.includes(city)}
                          onChange={() => toggleCitySelection(city)}
                          className="rounded"
                        />
                        <span className="text-sm">{city}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Manual city input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCityInput}
                    onChange={(e) => setManualCityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addManualCity()}
                    placeholder="输入城市名称（如：佛山、广州等）"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={addManualCity}
                    disabled={!manualCityInput.trim()}
                    variant="outline"
                  >
                    添加
                  </Button>
                </div>

                {/* Selected cities display */}
                {selectedCities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">已选择：</span>
                    {selectedCities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {city}
                        <button
                          onClick={() => toggleCitySelection(city)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleCalculate}
                disabled={selectedCities.length === 0 || calculationStatus === 'calculating'}
                className="w-full"
                size="lg"
              >
                {calculationStatus === 'calculating' ? '计算中，请稍候...' : '执行社保费用计算'}
              </Button>

              {calculationStatus === 'success' && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/results'}
                  >
                    查看计算结果
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}