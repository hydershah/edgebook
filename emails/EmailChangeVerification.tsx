import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';

interface EmailChangeVerificationProps {
  userName: string;
  newEmail: string;
  verificationUrl: string;
}

export const EmailChangeVerification = ({
  userName = 'there',
  newEmail = 'new@example.com',
  verificationUrl = 'https://edgebook.ai/verify',
}: EmailChangeVerificationProps) => (
  <Layout preview="Verify your new EdgeBook email address">
    <Section style={content}>
      <Heading style={h1}>Verify Your New Email Address</Heading>

      <Text style={text}>
        Hi {userName},
      </Text>

      <Text style={text}>
        You recently requested to change the email address associated with your EdgeBook account to:
      </Text>

      <Section style={emailBox}>
        <Text style={emailText}>
          <strong>{newEmail}</strong>
        </Text>
      </Section>

      <Text style={text}>
        To complete this change and ensure you receive all account notifications at this address, please verify it by clicking the button below:
      </Text>

      <Section style={buttonContainer}>
        <Button href={verificationUrl}>
          Verify New Email
        </Button>
      </Section>

      <Text style={smallText}>
        This verification link will expire in 24 hours.
      </Text>

      <Hr style={hr} />

      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>ℹ️ What happens next?</strong>
        </Text>
        <Text style={infoText}>
          Once verified, all future account communications will be sent to this new email address. Your login credentials will remain the same - you can continue to sign in with either your old or new email address.
        </Text>
      </Section>

      <Hr style={hr} />

      <Text style={text}>
        <strong>Didn't request this change?</strong>
        <br />
        If you didn't request to change your email address, please ignore this email. Your account email will remain unchanged unless this verification link is used.
      </Text>

      <Text style={text}>
        If you're having trouble clicking the button, you can copy and paste this link into your browser:
      </Text>

      <Text style={linkText}>
        {verificationUrl}
      </Text>

      <Text style={text}>
        If you have any questions, feel free to contact our support team.
      </Text>

      <Text style={text}>
        Best regards,
        <br />
        The EdgeBook Team
      </Text>
    </Section>
  </Layout>
);

export default EmailChangeVerification;

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

const emailBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '5px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const emailText = {
  color: '#1a1a1a',
  fontSize: '18px',
  lineHeight: '24px',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#f0f7ff',
  border: '1px solid #b3d9ff',
  borderRadius: '5px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#0d47a1',
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
