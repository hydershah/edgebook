import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';

interface EmailChangeNotificationProps {
  userName: string;
  oldEmail: string;
  newEmail: string;
}

export const EmailChangeNotification = ({
  userName = 'there',
  oldEmail = 'old@example.com',
  newEmail = 'new@example.com',
}: EmailChangeNotificationProps) => (
  <Layout preview="Your EdgeBook email address has been changed">
    <Section style={content}>
      <Heading style={h1}>Email Address Changed</Heading>

      <Text style={text}>
        Hi {userName},
      </Text>

      <Text style={text}>
        This is a security notification to let you know that the email address associated with your EdgeBook account has been changed.
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Previous email:</strong> {oldEmail}
        </Text>
        <Text style={infoText}>
          <strong>New email:</strong> {newEmail}
        </Text>
      </Section>

      <Hr style={hr} />

      <Section style={warningBox}>
        <Text style={warningText}>
          <strong>⚠️ Didn't make this change?</strong>
        </Text>
        <Text style={warningText}>
          If you didn't request this email change, your account may be compromised. Please take action immediately:
        </Text>
        <ul style={warningList}>
          <li style={warningListItem}>Reset your password right away</li>
          <li style={warningListItem}>Contact our support team</li>
          <li style={warningListItem}>Review your account activity</li>
        </ul>
      </Section>

      <Section style={buttonContainer}>
        <Button href="https://edgebook.ai/auth/forgot-password">
          Reset Password Now
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={text}>
        For your security, all future account-related emails will be sent to your new email address: <strong>{newEmail}</strong>
      </Text>

      <Text style={text}>
        If you have any questions or concerns, please contact our support team immediately.
      </Text>

      <Text style={text}>
        Best regards,
        <br />
        The EdgeBook Team
      </Text>
    </Section>
  </Layout>
);

export default EmailChangeNotification;

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

const buttonContainer = {
  margin: '32px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
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

const warningBox = {
  backgroundColor: '#fff3f3',
  border: '1px solid #ffcccc',
  borderRadius: '5px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#c41e3a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const warningList = {
  margin: '8px 0',
  paddingLeft: '20px',
};

const warningListItem = {
  color: '#c41e3a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};
