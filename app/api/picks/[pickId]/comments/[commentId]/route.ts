import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isModerator } from '@/lib/authorization'
import { logUnauthorized, logForbidden, logSuccess, AuditAction, AuditResource } from '@/lib/audit'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pickId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      await logUnauthorized(AuditResource.COMMENT, params.commentId, undefined, request)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentId } = params

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user is owner, moderator, or admin
    const isOwner = comment.userId === session.user.id
    const canModerate = await isModerator(session.user.id)

    if (!isOwner && !canModerate) {
      await logForbidden(
        AuditAction.DELETE_COMMENT,
        AuditResource.COMMENT,
        session.user.id,
        commentId,
        'User does not own this comment and is not a moderator',
        request
      )
      return NextResponse.json(
        { error: 'You can only delete your own comments unless you are a moderator' },
        { status: 403 }
      )
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    })

    await logSuccess(
      AuditAction.DELETE_COMMENT,
      AuditResource.COMMENT,
      session.user.id,
      commentId,
      { isModeratorAction: canModerate && !isOwner },
      request
    )

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
