'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TrendingUp } from 'lucide-react'

export default function CreatePostBox() {
  const { data: session } = useSession()
  const router = useRouter()
  const avatarInitial = session?.user?.name?.[0]?.toUpperCase() || 'U'

  const handlePickClick = () => {
    router.push('/createpick')
  }

  const handleAnalystClick = () => {
    router.push('/aianalyst')
  }

  if (!session?.user) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-semibold text-white flex-shrink-0">
          {avatarInitial}
        </div>

        {/* Input Area */}
        <button
          onClick={handlePickClick}
          className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 text-sm transition-colors cursor-pointer"
        >
          What&apos;s your pick, {session.user.name?.split(' ')[0]}?
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={handlePickClick}
          className="flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm font-medium"
        >
          <TrendingUp size={20} className="text-primary" />
          <span>Sports Pick</span>
        </button>
        <button
          onClick={handleAnalystClick}
          className="flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm font-medium"
        >
          <Image src="/gamelens.svg" alt="GameLens AI" width={20} height={20} className="flex-shrink-0" />
          <span>GameLens AI Analyst</span>
        </button>
      </div>
    </div>
  )
}
