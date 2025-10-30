import { NextRequest, NextResponse } from 'next/server'

const SUPPORT_EMAIL = 'support@edgebook.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, category, subject, message } = body

    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Category labels for display
    const categoryLabels: Record<string, string> = {
      account: 'Account & Profile',
      payments: 'Payments & Transactions',
      technical: 'Technical Support',
      safety: 'Safety & Compliance',
      general: 'General Inquiry'
    }

    const categoryLabel = categoryLabels[category] || category

    // Send email to support team
    const supportEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #206344 0%, #1a4f35 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 20px;
            }
            .label {
              font-weight: 600;
              color: #206344;
              margin-bottom: 5px;
            }
            .value {
              color: #4b5563;
              background: white;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .message-box {
              background: white;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
              white-space: pre-wrap;
              font-family: inherit;
            }
            .badge {
              display: inline-block;
              background: #206344;
              color: white;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">New Support Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">EdgeBook Support Center</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Category</div>
              <div class="value">
                <span class="badge">${categoryLabel}</span>
              </div>
            </div>

            <div class="field">
              <div class="label">From</div>
              <div class="value">${name} (<a href="mailto:${email}">${email}</a>)</div>
            </div>

            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>

            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message}</div>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>How to respond:</strong> Reply directly to this email to contact ${name} at ${email}
            </p>
          </div>
        </body>
      </html>
    `

    // Send confirmation email to user
    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #206344 0%, #1a4f35 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              background: #206344;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin-top: 20px;
            }
            .info-box {
              background: white;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #206344;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">We've Received Your Message</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">EdgeBook Support Team</p>
          </div>
          <div class="content">
            <p>Hi ${name},</p>

            <p>Thank you for contacting EdgeBook support. We've received your message and will get back to you within 24 hours.</p>

            <div class="info-box">
              <p style="margin: 0 0 10px 0;"><strong>Your Request Details:</strong></p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${categoryLabel}</p>
              <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>

            <p>Our support team is reviewing your request and will respond to you at <strong>${email}</strong>.</p>

            <p>In the meantime, you might find helpful information in our support resources:</p>

            <a href="${process.env.NEXTAUTH_URL}/support" class="button">Visit Support Center</a>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The EdgeBook Team
            </p>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              If you didn't submit this support request, please ignore this email or contact us at support@edgebook.ai
            </p>
          </div>
        </body>
      </html>
    `

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      // Log the support request for manual processing
      console.log('Support request received (email service not configured):')
      console.log({
        from: `${name} <${email}>`,
        category: categoryLabel,
        subject,
        message,
        timestamp: new Date().toISOString()
      })

      // Return success even without sending emails
      return NextResponse.json(
        {
          success: true,
          message: 'Your message has been received. We will contact you soon.',
          note: 'Email notifications are currently disabled.'
        },
        { status: 200 }
      )
    }

    // Initialize Resend only if API key is available
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send both emails
    const [supportResult, confirmationResult] = await Promise.allSettled([
      // Email to support team (with reply-to set to user's email)
      resend.emails.send({
        from: `EdgeBook Support <${SUPPORT_EMAIL}>`,
        to: SUPPORT_EMAIL,
        replyTo: email,
        subject: `[${categoryLabel}] ${subject}`,
        html: supportEmailHtml,
      }),
      // Confirmation email to user
      resend.emails.send({
        from: `EdgeBook Support <${SUPPORT_EMAIL}>`,
        to: email,
        subject: 'We received your message - EdgeBook Support',
        html: confirmationEmailHtml,
      }),
    ])

    // Check if support email was sent successfully
    if (supportResult.status === 'rejected') {
      console.error('Failed to send support email:', supportResult.reason)
      return NextResponse.json(
        { error: 'Failed to send support request' },
        { status: 500 }
      )
    }

    // Log if confirmation email failed (but still return success)
    if (confirmationResult.status === 'rejected') {
      console.error('Failed to send confirmation email:', confirmationResult.reason)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing support request:', error)
    return NextResponse.json(
      { error: 'Failed to process support request' },
      { status: 500 }
    )
  }
}
