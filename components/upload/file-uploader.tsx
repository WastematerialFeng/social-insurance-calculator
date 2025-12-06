'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in bytes
  description?: string
  exampleFormat?: string[]
}

export function FileUploader({
  onFileSelect,
  accept = '.xlsx,.xls',
  maxSize = 10 * 1024 * 1024, // 10MB
  description = '拖拽Excel文件到此处，或点击选择文件',
  exampleFormat
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError('文件大小超过限制（最大10MB）')
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('文件格式不支持，请上传Excel文件（.xlsx或.xls）')
      } else {
        setError('文件上传失败')
      }
      return
    }

    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] } : undefined,
    maxSize,
    multiple: false
  })

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {!selectedFile ? (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? '释放文件到此处' : description}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                支持格式：Excel（.xlsx, .xls），最大10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <File className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {exampleFormat && exampleFormat.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Excel文件格式示例：</p>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            {exampleFormat.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}