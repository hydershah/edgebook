import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export const VerificationEmail = ({
  userName = 'there',
  verificationUrl = 'https://edgebook.ai/verify',
}: VerificationEmailProps) => (
  <Layout preview="Welcome to EdgeBook! Please verify your email address.">
    <Section style={content}>
      <Heading style={h1}>Welcome to EdgeBook! 🎉</Heading>

      <Text style={text}>
        Hi {userName},
      </Text>

      <Text style={text}>
        We're excited to have you join the EdgeBook community! You're one step away from tracking, sharing, and profiting from your sports picks.
      </Text>

      <Text style={text}>
        To get started, please verify your email address by clicking the button below:
      </Text>

      <Section style={buttonContainer}>
        <Button href={verificationUrl}>
          Verify Email Address
        </Button>
      </Section>

      <Text style={smallText}>
        This link will expire in 24 hours. If you didn't create an account with EdgeBook, you can safely ignore this email.
      </Text>

      <Hr style={hr} />

      <Heading as="h2" style={h2}>
        What's Next?
      </Heading>

      <Text style={text}>
        Once your email is verified, you'll be able to:
      </Text>

      <ul style={list}>
        <li style={listItem}>📊 Create and track your sports picks</li>
        <li style={listItem}>💰 Monetize your expertise by selling premium picks</li>
        <li style={listItem}>👥 Follow top performers and learn from the best</li>
        <li style={listItem}>📈 Build your reputation with verified statistics</li>
      </ul>

      <Text style={text}>
        If you have any questions, feel free to reply to this email. We're here to help!
      </Text>

      <Text style={text}>
        Best regards,
        <br />
        The EdgeBook Team
      </Text>
    </Section>
  </Layout>
);

export default VerificationEmail;

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

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
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

const list = {
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '8px 0',
};
