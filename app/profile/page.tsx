import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ProfileIndexPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/profile')
  }

  redirect(`/profile/${session.user.id}`)
}
