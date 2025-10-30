import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { validateS3Config } from '@/lib/env'

// Validate S3 configuration at module load time
const s3Config = validateS3Config()

// Only initialize S3 client if properly configured
const s3Client = s3Config.isConfigured
  ? new S3Client({
      region: s3Config.region!,
      credentials: {
        accessKeyId: s3Config.accessKeyId!,
        secretAccessKey: s3Config.secretAccessKey!,
      },
    })
  : null

export async function POST(request: NextRequest) {
  try {
    // Check if S3 is configured
    if (!s3Config.isConfigured || !s3Client) {
      console.error('S3 upload service not configured:', s3Config.error)
      return NextResponse.json(
        {
          error: 'File upload service is not configured',
          details: 'The file upload feature requires AWS S3 configuration. Please contact support.',
        },
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    const buffer = Buffer.from(await file.arrayBuffer())

    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Config.bucket!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const url = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${fileName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
