import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logUnauthorized, logForbidden, logSuccess, AuditAction, AuditResource } from '@/lib/audit'
import { isAdmin } from '@/lib/authorization'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      await logUnauthorized(AuditResource.CHAT, params.chatId, undefined, request)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY: Verify user owns the chat or is admin
    const chat = await prisma.chat.findUnique({
      where: { id: params.chatId },
      select: { userId: true },
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Check if user owns the chat or is an admin
    const userIsAdmin = await isAdmin(session.user.id)
    const isOwner = chat.userId === session.user.id

    if (!isOwner && !userIsAdmin) {
      await logForbidden(
        AuditAction.ACCESS_CHAT,
        AuditResource.CHAT,
        session.user.id,
        params.chatId,
        'User does not own this chat',
        request
      )
      return NextResponse.json(
        { error: 'You do not have permission to access this chat' },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { chatId: params.chatId },
      orderBy: { createdAt: 'asc' },
    })

    await logSuccess(
      AuditAction.ACCESS_CHAT,
      AuditResource.CHAT,
      session.user.id,
      params.chatId,
      undefined,
      request
    )

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      await logUnauthorized(AuditResource.CHAT, params.chatId, undefined, request)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY: Verify user owns the chat or is admin
    const chat = await prisma.chat.findUnique({
      where: { id: params.chatId },
      select: { userId: true },
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Check if user owns the chat or is an admin
    const userIsAdmin = await isAdmin(session.user.id)
    const isOwner = chat.userId === session.user.id

    if (!isOwner && !userIsAdmin) {
      await logForbidden(
        AuditAction.ACCESS_CHAT,
        AuditResource.CHAT,
        session.user.id,
        params.chatId,
        'User does not own this chat',
        request
      )
      return NextResponse.json(
        { error: 'You do not have permission to post to this chat' },
        { status: 403 }
      )
    }

    const { content } = await request.json()

    // Save user message
    await prisma.message.create({
      data: {
        chatId: params.chatId,
        role: 'user',
        content,
      },
    })

    // Get conversation history
    const previousMessages = await prisma.message.findMany({
      where: { chatId: params.chatId },
      orderBy: { createdAt: 'asc' },
    })

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI sports analyst. Help users with prediction strategies, analyze their performance, provide insights on games, and give data-driven advice. Be helpful, informative, and responsible. Always remind users to play responsibly.',
        },
        ...previousMessages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ],
    })

    const assistantMessage = completion.choices[0].message.content

    // Save assistant message
    const savedMessage = await prisma.message.create({
      data: {
        chatId: params.chatId,
        role: 'assistant',
        content: assistantMessage || 'I apologize, but I could not generate a response.',
      },
    })

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: params.chatId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ assistantMessage: savedMessage })
  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
