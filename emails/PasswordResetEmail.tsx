import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  userName = 'there',
  resetUrl = 'https://edgebook.ai/reset-password',
}: PasswordResetEmailProps) => (
  <Layout preview="Reset your EdgeBook password">
    <Section style={content}>
      <Heading style={h1}>Password Reset Request</Heading>

      <Text style={text}>
        Hi {userName},
      </Text>

      <Text style={text}>
        We received a request to reset the password for your EdgeBook account. If you made this request, click the button below to set a new password:
      </Text>

      <Section style={buttonContainer}>
        <Button href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      <Text style={smallText}>
        This link will expire in 1 hour for security reasons.
      </Text>

      <Hr style={hr} />

      <Section style={warningBox}>
        <Text style={warningText}>
          <strong>🔒 Security Notice</strong>
        </Text>
        <Text style={warningText}>
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </Text>
        <Text style={warningText}>
          For your security, never share this reset link with anyone.
        </Text>
      </Section>

      <Hr style={hr} />

      <Text style={text}>
        If you're having trouble clicking the button, you can copy and paste this link into your browser:
      </Text>

      <Text style={linkText}>
        {resetUrl}
      </Text>

      <Text style={text}>
        If you have any questions or concerns, please don't hesitate to contact our support team.
      </Text>

      <Text style={text}>
        Best regards,
        <br />
        The EdgeBook Team
      </Text>
    </Section>
  </Layout>
);

export default PasswordResetEmail;

const content = {
  padding: '40px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  lineHeight: '1.3',
};

const text = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
};

const buttonContainer = {
  margin: '32px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const warningBox = {
  backgroundColor: '#fff9e6',
  border: '1px solid #ffd966',
  borderRadius: '5px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#735c0f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const linkText = {
  color: '#0070f3',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  wordBreak: 'break-all' as const,
};
