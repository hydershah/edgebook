'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Upload, X, Image as ImageIcon, Video, Calendar, TrendingUp, Lock, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AccountStatusBanner from '@/components/AccountStatusBanner'
import GameSelector from '@/components/GameSelector'
import PredictionSelector from '@/components/PredictionSelector'

const pickSchema = z
  .object({
    pickType: z.enum(['SINGLE', 'PARLAY'], {
      required_error: 'Pick type is required',
      invalid_type_error: 'Invalid pick type',
    }),
    sport: z.enum(
      ['NFL', 'NBA', 'MLB', 'NHL', 'SOCCER', 'COLLEGE_FOOTBALL', 'COLLEGE_BASKETBALL'],
      {
        required_error: 'Sport is required',
        invalid_type_error: 'Invalid sport',
      }
    ),
    matchup: z
      .string()
      .trim()
      .min(1, 'Matchup is required')
      .max(200, 'Matchup must be less than 200 characters')
      .regex(
        /^[a-zA-Z0-9\s@\-.,()&]+$/,
        'Matchup can only contain letters, numbers, spaces, and common punctuation (@-.,()&)'
      ),
    details: z
      .string()
      .trim()
      .optional()
      .transform((value) => {
        // Handle empty strings and whitespace-only strings
        if (!value || value.length === 0) return undefined
        return value
      })
      .refine(
        (val) => {
          if (!val) return true
          return val.length <= 1000
        },
        { message: 'Pick details must be less than 1000 characters' }
      ),
    odds: z
      .string()
      .trim()
      .optional()
      .transform((value) => {
        // Handle empty strings and whitespace-only strings
        if (!value || value.length === 0) return undefined
        return value
      })
      .refine(
        (val) => {
          if (!val) return true
          // Valid odds formats: -110, +150, 2.5, 1.91, etc.
          return /^[+-]?\d+(\.\d{1,2})?$/.test(val)
        },
        { message: 'Odds must be in valid format (e.g., -110, +150, 2.5)' }
      ),
    gameDate: z
      .string()
      .min(1, 'Game date is required')
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      }),
    confidence: z
      .number({
        required_error: 'Confidence level is required',
        invalid_type_error: 'Confidence must be a number',
      })
      .int('Confidence must be a whole number')
      .min(1, 'Confidence must be at least 1')
      .max(5, 'Confidence cannot exceed 5'),
    isPremium: z.boolean({
      invalid_type_error: 'Premium status must be true or false',
    }),
    price: z
      .string()
      .trim()
      .optional()
      .transform((val) => {
        // Handle empty strings and whitespace-only strings
        if (!val || val.length === 0) return undefined
        return val
      }),
  })
  .superRefine((data, ctx) => {
    // Validate that premium picks have a valid price
    if (data.isPremium) {
      if (!data.price || data.price.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Price is required for premium picks',
        })
        return
      }

      const parsed = Number.parseFloat(data.price)
      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Price must be a valid number',
        })
        return
      }

      if (parsed < 0.5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Minimum price is $0.50',
        })
        return
      }

      if (parsed > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Maximum price is $10,000',
        })
        return
      }

      // Check for max 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(data.price)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Price can only have up to 2 decimal places',
        })
      }
    }
  })

type CreatePickFormValues = z.infer<typeof pickSchema>

export default function CreatePickPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [formError, setFormError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Game selection state
  const [selectedGame, setSelectedGame] = useState<{
    id: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    scheduled: string;
    status: string;
    venue?: string;
  } | null>(null)

  // Prediction data state
  const [predictionData, setPredictionData] = useState<{
    predictionType: 'WINNER' | 'SPREAD' | 'TOTAL';
    predictedWinner?: string;
    spreadValue?: number;
    spreadTeam?: string;
    totalValue?: number;
    totalPrediction?: 'OVER' | 'UNDER';
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreatePickFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(pickSchema),
    defaultValues: {
      pickType: 'SINGLE',
      sport: 'NFL',
      matchup: '',
      details: '',
      odds: undefined,
      gameDate: '',
      confidence: 1,
      isPremium: false,
      price: '',
    },
  })

  const isPremium = watch('isPremium')
  const confidenceValue = watch('confidence') ?? 1
  const pickType = watch('pickType')
  const sport = watch('sport')
  const details = watch('details') || ''
  const detailsLength = details.length

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File is too large. Maximum size is 50MB.')
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload an image (JPEG, PNG, GIF) or video (MP4, MOV).')
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to upload file')
      }

      const data = await response.json()
      setUploadedFile(file)
      setUploadedFileUrl(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      uploadFile(files[0])
    }
  }, [uploadFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      uploadFile(files[0])
    }
  }, [uploadFile])

  const removeFile = useCallback(() => {
    setUploadedFile(null)
    setUploadedFileUrl(null)
    setUploadError(null)
  }, [])

  const handleGameSelect = useCallback((game: any) => {
    setSelectedGame(game)

    // Auto-populate matchup field
    const matchup = `${game.awayTeam} @ ${game.homeTeam}`
    setValue('matchup', matchup)

    // Auto-populate game date
    const gameDate = new Date(game.scheduled).toISOString().split('T')[0]
    setValue('gameDate', gameDate)
  }, [setValue])

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    try {
      // Prepare data with proper type handling
      const payload = {
        pickType: values.pickType,
        sport: values.sport,
        matchup: values.matchup.trim(),
        details: values.details ? values.details.trim() : undefined,
        odds: values.odds || undefined,
        gameDate: values.gameDate,
        confidence: values.confidence,
        isPremium: values.isPremium,
        price: values.isPremium && values.price ? Number.parseFloat(values.price) : undefined,
        mediaUrl: uploadedFileUrl || undefined,

        // Sportradar game data
        sportradarGameId: selectedGame?.id || undefined,
        homeTeam: selectedGame?.homeTeam || undefined,
        awayTeam: selectedGame?.awayTeam || undefined,
        gameStatus: selectedGame?.status || undefined,
        venue: selectedGame?.venue || undefined,

        // Prediction data
        predictionType: predictionData?.predictionType || undefined,
        predictedWinner: predictionData?.predictedWinner || undefined,
        spreadValue: predictionData?.spreadValue || undefined,
        spreadTeam: predictionData?.spreadTeam || undefined,
        totalValue: predictionData?.totalValue || undefined,
        totalPrediction: predictionData?.totalPrediction || undefined,
      }

      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/feed')
        return
      }

      // If 403 (forbidden), refresh session to show updated account status
      if (response.status === 403) {
        await update()
      }

      const data = await response.json().catch(() => null)

      if (Array.isArray(data?.error)) {
        data.error.forEach((issue: { path?: string[]; message: string }) => {
          const field = issue.path?.[0]
          if (field) {
            setError(field as keyof CreatePickFormValues, {
              type: 'server',
              message: issue.message,
            })
          }
        })
        setFormError('Please review the highlighted fields and try again.')
        return
      }

      if (data?.error) {
        setFormError(typeof data.error === 'string' ? data.error : 'Failed to create pick.')
        return
      }

      setFormError('Something went wrong while creating your pick. Please try again.')
    } catch (error) {
      console.error('Error creating pick:', error)
      setFormError('We could not save your pick. Please check your connection and try again.')
    }
  })

  const isAuthenticated = status === 'authenticated'

  // Check account status for suspension/ban
  const user = session?.user as any
  const accountStatus = user?.accountStatus
  const suspendedUntil = user?.suspendedUntil
  const now = new Date()
  const isSuspended = accountStatus === 'SUSPENDED' && suspendedUntil && new Date(suspendedUntil) > now
  const isBanned = accountStatus === 'BANNED'
  const isAccountBlocked = isSuspended || isBanned

  const sports = [
    { value: 'NFL', label: 'NFL', icon: '🏈' },
    { value: 'NBA', label: 'NBA', icon: '🏀' },
    { value: 'MLB', label: 'MLB', icon: '⚾' },
    { value: 'NHL', label: 'NHL', icon: '🏒' },
    { value: 'SOCCER', label: 'Soccer', icon: '⚽' },
    { value: 'COLLEGE_FOOTBALL', label: 'CFB', icon: '🏈' },
    { value: 'COLLEGE_BASKETBALL', label: 'CBB', icon: '🏀' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Account Status Banner */}
      <AccountStatusBanner />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* User Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {session?.user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{session?.user?.name || 'Anonymous'}</h2>
                <p className="text-sm text-gray-500">Create a new pick</p>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 text-sm text-amber-900">
              <p>You need to sign in to post. You can draft below, but it won&apos;t submit until you sign in.</p>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border-b border-red-100 px-5 py-3 text-sm text-red-800">
              {formError}
            </div>
          )}

          <form onSubmit={onSubmit} className="p-5 space-y-5" noValidate>
            {/* Pick Type Tabs */}
            <div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setValue('pickType', 'SINGLE')}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                    pickType === 'SINGLE'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={isSubmitting || isAccountBlocked}
                >
                  Single Pick
                </button>
                <button
                  type="button"
                  onClick={() => setValue('pickType', 'PARLAY')}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all ${
                    pickType === 'PARLAY'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={isSubmitting || isAccountBlocked}
                >
                  Parlay
                </button>
              </div>
              {errors.pickType && (
                <p className="mt-2 text-xs text-red-600">{errors.pickType.message}</p>
              )}
            </div>

            {/* Sport Selection Pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Sport</label>
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setValue('sport', s.value as any)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                      sport === s.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isSubmitting || isAccountBlocked}
                  >
                    <span className="mr-1">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
              {errors.sport && (
                <p className="mt-2 text-xs text-red-600">{errors.sport.message}</p>
              )}
            </div>

            {/* Game Selector - Shows after sport is selected */}
            {sport && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Game
                </label>
                <GameSelector
                  sport={sport}
                  onGameSelect={handleGameSelect}
                  selectedGameId={selectedGame?.id}
                />
              </div>
            )}

            {/* Prediction Type Selector - Shows after game is selected */}
            {selectedGame && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Make Your Prediction
                </label>
                <PredictionSelector
                  sport={sport as any}
                  game={selectedGame}
                  onPredictionChange={setPredictionData}
                />
              </div>
            )}

            {/* Matchup Input */}
            <div>
              <input
                id="matchup"
                type="text"
                placeholder="Select a game to auto-fill matchup"
                className={`w-full px-4 py-3 border-0 border-b-2 ${
                  errors.matchup ? 'border-red-400' : 'border-gray-200'
                } focus:border-primary focus:ring-0 focus:outline-none text-lg placeholder-gray-400 transition-colors bg-gray-50`}
                {...register('matchup')}
                aria-invalid={errors.matchup ? 'true' : 'false'}
                aria-describedby={errors.matchup ? 'matchup-error' : undefined}
                readOnly
                disabled={isSubmitting || isAccountBlocked || !selectedGame}
              />
              {errors.matchup && (
                <p id="matchup-error" className="mt-2 text-xs text-red-600">
                  {errors.matchup.message}
                </p>
              )}
            </div>

            {/* Pick Details Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="details">
                Pick Details (Optional)
              </label>
              <div className="relative">
                <textarea
                  id="details"
                  placeholder="Share your pick details, analysis, and reasoning... (Optional)"
                  className={`w-full px-4 py-3 border ${
                    errors.details ? 'border-red-400' : 'border-gray-200'
                  } rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[120px] resize-none placeholder-gray-400 transition-all`}
                  maxLength={1000}
                  {...register('details')}
                  aria-invalid={errors.details ? 'true' : 'false'}
                  aria-describedby={errors.details ? 'details-error' : undefined}
                  disabled={isSubmitting || isAccountBlocked}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {detailsLength}/1000
                </div>
              </div>
              {errors.details && (
                <p id="details-error" className="mt-2 text-xs text-red-600">
                  {errors.details.message}
                </p>
              )}
            </div>

            {/* Odds Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="odds">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                Odds (Optional)
              </label>
              <input
                id="odds"
                type="text"
                placeholder="-110"
                className={`w-full px-4 py-2.5 border ${
                  errors.odds ? 'border-red-400' : 'border-gray-300'
                } rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all`}
                {...register('odds')}
                aria-invalid={errors.odds ? 'true' : 'false'}
                aria-describedby={errors.odds ? 'odds-error' : undefined}
                disabled={isSubmitting || isAccountBlocked}
              />
              {errors.odds && (
                <p id="odds-error" className="mt-1 text-xs text-red-600">
                  {errors.odds.message}
                </p>
              )}
            </div>

            {/* Media Upload */}
            <div>
              {!uploadedFile && !isUploading && (
                <label
                  htmlFor="file-upload"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`block border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                    onChange={handleFileSelect}
                    disabled={isSubmitting || isUploading || isAccountBlocked}
                  />
                  <div className="flex justify-center space-x-4 mb-3">
                    <ImageIcon className="text-gray-400" size={32} />
                    <Video className="text-gray-400" size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Add photos or videos
                  </p>
                  <p className="text-xs text-gray-500">
                    Drag and drop or click to upload (max 50MB)
                  </p>
                </label>
              )}

              {isUploading && (
                <div className="border-2 border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                  <div className="flex justify-center mb-3">
                    <Upload className="text-primary animate-pulse" size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Uploading...</p>
                </div>
              )}

              {uploadedFile && uploadedFileUrl && (
                <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {uploadedFile.type.startsWith('image/') ? (
                        <img
                          src={uploadedFileUrl}
                          alt="Uploaded preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Video className="text-gray-500" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Upload complete!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                      disabled={isSubmitting || isAccountBlocked}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {uploadError}
                </div>
              )}
            </div>

            {/* Confidence Level */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <label className="block text-sm font-medium text-gray-900 mb-4" htmlFor="confidence">
                Confidence Level: <span className="text-primary font-bold">{confidenceValue} Unit{confidenceValue > 1 ? 's' : ''}</span>
              </label>
              <div className="space-y-3">
                <input
                  id="confidence"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  className="w-full h-2.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary slider"
                  {...register('confidence', { valueAsNumber: true })}
                  disabled={isSubmitting || isAccountBlocked}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${((confidenceValue - 1) / 4) * 100}%, #d1d5db ${((confidenceValue - 1) / 4) * 100}%, #d1d5db 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              {errors.confidence && (
                <p className="mt-2 text-xs text-red-600">{errors.confidence.message}</p>
              )}
            </div>

            {/* Premium Options */}
            <div className="border-t border-gray-200 pt-5 space-y-4">
              <div
                className={`relative rounded-xl p-5 border-2 transition-all cursor-pointer ${
                  isPremium
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isSubmitting && setValue('isPremium', !isPremium)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    isPremium ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Lock size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Premium Pick</h3>
                      {isPremium && (
                        <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Monetize this pick with a one-time purchase fee
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      15% platform fee applies
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="mt-1.5 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                    {...register('isPremium')}
                    disabled={isSubmitting || isAccountBlocked}
                  />
                </div>

                {isPremium && (
                  <div className="mt-4 pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="price">
                      <DollarSign className="inline w-4 h-4 mr-1" />
                      Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        id="price"
                        type="text"
                        inputMode="decimal"
                        placeholder="9.99"
                        className={`w-full pl-8 pr-4 py-2.5 border ${
                          errors.price ? 'border-red-400' : 'border-gray-300'
                        } rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all`}
                        {...register('price')}
                        aria-invalid={errors.price ? 'true' : 'false'}
                        aria-describedby={errors.price ? 'price-error' : undefined}
                        disabled={isSubmitting || isAccountBlocked}
                        onKeyDown={(e) => {
                          // Only allow numbers, decimal point, and control keys
                          if (!/[\d.]/.test(e.key) && !['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                            e.preventDefault()
                          }
                        }}
                      />
                    </div>
                    {errors.price && (
                      <p id="price-error" className="mt-2 text-xs text-red-600">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Want recurring revenue?</p>
                  <p className="text-gray-600">Enable premium seller in your profile to offer monthly subscriptions</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              disabled={isSubmitting || isAccountBlocked}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post Pick'
              )}
            </button>
          </form>
        </div>

        {/* Tips Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Tips for great picks</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Include detailed analysis and reasoning</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Add context about team news and injuries</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Be transparent about your confidence level</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Follow up with results to build credibility</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
