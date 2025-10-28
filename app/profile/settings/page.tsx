import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileSettingsForm from './ProfileSettingsForm'

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/profile/settings')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      instagram: true,
      facebook: true,
      youtube: true,
      twitter: true,
      tiktok: true,
      website: true,
    },
  })

  if (!user) {
    redirect('/auth/signin?callbackUrl=/profile/settings')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your bio, profile image, and social connections so followers can learn
            more about you.
          </p>
        </div>
        <ProfileSettingsForm user={user} />
      </div>
    </div>
  )
}
