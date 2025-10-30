import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({
  userName = 'there',
}: WelcomeEmailProps) => (
  <Layout preview="Welcome to EdgeBook! Let's get started.">
    <Section style={content}>
      <Heading style={h1}>Welcome to EdgeBook! 🎉</Heading>

      <Text style={text}>
        Hi {userName},
      </Text>

      <Text style={text}>
        We're thrilled to have you join the EdgeBook community! Your account is ready, and you can start tracking, sharing, and profiting from your sports picks right away.
      </Text>

      <Section style={buttonContainer}>
        <Button href="https://edgebook.ai/dashboard">
          Go to Dashboard
        </Button>
      </Section>

      <Hr style={hr} />

      <Heading as="h2" style={h2}>
        Get Started with EdgeBook
      </Heading>

      <Text style={text}>
        Here's what you can do now:
      </Text>

      <ul style={list}>
        <li style={listItem}>📊 Create your first sports pick and start tracking your performance</li>
        <li style={listItem}>💰 Set up your profile to start selling premium picks</li>
        <li style={listItem}>👥 Discover and follow top performers in the community</li>
        <li style={listItem}>📈 Build your reputation with verified, transparent statistics</li>
      </ul>

      <Text style={text}>
        EdgeBook makes it easy to showcase your expertise and monetize your sports knowledge. Whether you're a casual bettor or a seasoned pro, we're here to help you succeed.
      </Text>

      <Hr style={hr} />

      <Text style={text}>
        <strong>Need help getting started?</strong>
        <br />
        Check out our quick start guide or reply to this email with any questions.
      </Text>

      <Text style={text}>
        We're excited to see what you'll achieve on EdgeBook!
      </Text>

      <Text style={text}>
        Best regards,
        <br />
        The EdgeBook Team
      </Text>
    </Section>
  </Layout>
);

export default WelcomeEmail;

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
