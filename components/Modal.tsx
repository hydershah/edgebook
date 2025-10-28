'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message: string
  type?: 'info' | 'success' | 'error' | 'confirm'
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  isLoading = false,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          Icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
        }
      case 'error':
        return {
          Icon: AlertCircle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
        }
      case 'confirm':
        return {
          Icon: Info,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
        }
      default:
        return {
          Icon: Info,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200',
        }
    }
  }

  const { Icon, bgColor, iconColor, borderColor } = getIconAndColor()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in">
          {/* Close button */}
          {!isLoading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center mb-4`}>
              <Icon size={28} className={iconColor} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 leading-relaxed mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className={`flex gap-3 ${type === 'confirm' ? 'flex-row-reverse' : ''}`}>
              {type === 'confirm' && onConfirm ? (
                <>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-primary to-green-700 hover:from-primary-dark hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      confirmText
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelText}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-green-700 hover:from-primary-dark hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

