'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Upload } from 'lucide-react'

export default function CreatePickPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [confidence, setConfidence] = useState(1)
  const [formData, setFormData] = useState({
    pickType: 'SINGLE',
    sport: 'NFL',
    matchup: '',
    details: '',
    odds: '',
    gameDate: '',
    isPremium: false,
    price: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          confidence,
          gameDate: new Date(formData.gameDate),
        }),
      })

      if (response.ok) {
        router.push('/feed')
      }
    } catch (error) {
      console.error('Error creating pick:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create a Pick</h1>
            <p className="text-gray-600 mt-1">
              Share your betting insight with the community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pick Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pick Type <span className="text-red-500">*</span>
              </label>
              <select
                name="pickType"
                value={formData.pickType}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="SINGLE">Single Pick</option>
                <option value="PARLAY">Parlay</option>
              </select>
            </div>

            {/* Sport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sport <span className="text-red-500">*</span>
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="NFL">NFL</option>
                <option value="NBA">NBA</option>
                <option value="MLB">MLB</option>
                <option value="NHL">NHL</option>
                <option value="SOCCER">Soccer</option>
                <option value="COLLEGE_FOOTBALL">College Football</option>
                <option value="COLLEGE_BASKETBALL">College Basketball</option>
              </select>
            </div>

            {/* Your Pick Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Your Pick</h3>

              {/* Matchup */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matchup <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="matchup"
                  value={formData.matchup}
                  onChange={handleChange}
                  placeholder="e.g., Lakers vs Warriors"
                  className="input-field"
                  required
                />
              </div>

              {/* Pick Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick Details <span className="text-red-500">*</span> (1000 characters remaining)
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="e.g., Lakers -5.5, LeBron Over 25.5 points"
                  className="input-field min-h-[100px]"
                  maxLength={1000}
                  required
                />
              </div>

              {/* Odds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Odds</label>
                <input
                  type="text"
                  name="odds"
                  value={formData.odds}
                  onChange={handleChange}
                  placeholder="e.g., -110, +150"
                  className="input-field"
                />
              </div>
            </div>

            {/* Add Photo or Video */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photo or Video (Optional) • Max 5 min
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600">Click to upload photo or video</p>
              </div>
            </div>

            {/* Game Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game Date</label>
              <input
                type="date"
                name="gameDate"
                value={formData.gameDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Confidence Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence: {confidence} Unit{confidence > 1 ? 's' : ''}
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">1 Unit</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm text-gray-600">5 Units</span>
              </div>
            </div>

            {/* Monetization Options */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Monetization Options</h3>
              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Sell as Individual Pick</p>
                    <p className="text-sm text-gray-600">
                      Charge a one-time fee for this specific pick (15% platform fee applies)
                    </p>
                  </div>
                </label>

                {formData.isPremium && (
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price (USD)"
                    className="input-field"
                    min="1"
                    step="0.01"
                  />
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    💡 Enable premium seller in your profile to offer monthly subscriptions
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Posting...' : 'Post Pick'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
