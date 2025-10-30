import LegalLayout from '@/components/LegalLayout'

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-collect', title: 'Information We Collect' },
  { id: 'how-use', title: 'How We Use Your Information' },
  { id: 'sharing', title: 'Information Sharing' },
  { id: 'cookies', title: 'Cookies and Tracking' },
  { id: 'security', title: 'Data Security' },
  { id: 'retention', title: 'Data Retention' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'children', title: 'Children\'s Privacy' },
  { id: 'international', title: 'International Transfers' },
  { id: 'changes', title: 'Changes to Privacy Policy' },
  { id: 'contact', title: 'Contact Information' },
]

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" sections={sections}>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: January 2025</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section id="introduction">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Welcome to EdgeBook&apos;s Privacy Policy. This policy describes how EdgeBook (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares information about you when you use our website, mobile application, and services (collectively, the &quot;Service&quot;).
          </p>
          <p className="text-gray-700 mb-4">
            We are committed to protecting your privacy and ensuring you have a positive experience on our platform. By using EdgeBook, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section id="information-collect">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, username, password, and profile information</li>
            <li><strong>Payment Information:</strong> Payment card details, billing address, and transaction history (processed securely through third-party payment processors)</li>
            <li><strong>Content:</strong> Picks, predictions, comments, messages, and other content you post or share</li>
            <li><strong>Communications:</strong> Information you provide when you contact us for support or feedback</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Information We Collect Automatically</h3>
          <p className="text-gray-700 mb-4">
            When you use our Service, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Usage Information:</strong> Pages viewed, features used, time spent on pages, and navigation paths</li>
            <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address, and device identifiers</li>
            <li><strong>Location Information:</strong> Approximate geographic location based on your IP address</li>
            <li><strong>Cookies and Similar Technologies:</strong> Information collected through cookies, web beacons, and similar technologies</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Information from Third Parties</h3>
          <p className="text-gray-700 mb-4">
            We may receive information about you from third parties, such as:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Authentication services if you sign in through third-party platforms</li>
            <li>Analytics providers</li>
            <li>Payment processors</li>
            <li>Public databases and social media platforms</li>
          </ul>
        </section>

        <section id="how-use">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Provide, maintain, and improve our Service</li>
            <li>Process transactions and send related information</li>
            <li>Create and manage your account</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address technical issues and fraudulent activity</li>
            <li>Personalize and improve your experience</li>
            <li>Facilitate social features, such as following other users</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section id="sharing">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We may share information about you as follows:
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 With Other Users</h3>
          <p className="text-gray-700 mb-4">
            Your profile information and content you post are visible to other users of the Service. Your picks, comments, and other activities may be publicly accessible.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 With Service Providers</h3>
          <p className="text-gray-700 mb-4">
            We share information with third-party service providers who perform services on our behalf, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Payment processing and fraud detection</li>
            <li>Cloud hosting and data storage</li>
            <li>Analytics and performance monitoring</li>
            <li>Customer support and communication</li>
            <li>Email delivery services</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 For Legal Reasons</h3>
          <p className="text-gray-700 mb-4">
            We may disclose information if we believe it is necessary to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Comply with applicable law, regulation, legal process, or government request</li>
            <li>Enforce our Terms of Service and other agreements</li>
            <li>Protect the rights, property, or safety of EdgeBook, our users, or others</li>
            <li>Detect, prevent, or address fraud or security issues</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Business Transfers</h3>
          <p className="text-gray-700 mb-4">
            If EdgeBook is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.5 With Your Consent</h3>
          <p className="text-gray-700 mb-4">
            We may share information with your consent or at your direction.
          </p>
        </section>

        <section id="cookies">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to collect and track information about your use of our Service. Cookies are small data files stored on your device.
          </p>
          <p className="text-gray-700 mb-4">
            We use the following types of cookies:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
          </ul>
          <p className="text-gray-700 mb-4">
            You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our Service.
          </p>
        </section>

        <section id="security">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We take reasonable measures to protect your information from unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and audits</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Employee training on data protection</li>
            <li>Secure payment processing through PCI-compliant providers</li>
          </ul>
          <p className="text-gray-700 mb-4">
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.
          </p>
        </section>

        <section id="retention">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your information for as long as necessary to provide our Service, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
          <p className="text-gray-700 mb-4">
            When you delete your account, we will delete or anonymize your information, except where we are required to retain it for legal or regulatory purposes.
          </p>
        </section>

        <section id="rights">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your information</li>
            <li><strong>Portability:</strong> Request a copy of your information in a portable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your information</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, please contact us at privacy@edgebook.ai. You can also manage certain information through your account settings.
          </p>
        </section>

        <section id="children">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
          </p>
          <p className="text-gray-700 mb-4">
            If we become aware that we have collected personal information from a child under 18, we will take steps to delete that information as quickly as possible.
          </p>
        </section>

        <section id="international">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
          <p className="text-gray-700 mb-4">
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those of your country.
          </p>
          <p className="text-gray-700 mb-4">
            When we transfer your information internationally, we implement appropriate safeguards to protect your information in accordance with this Privacy Policy and applicable law.
          </p>
        </section>

        <section id="changes">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you by updating the date at the top of this policy and, in some cases, provide additional notice (such as via email or through the Service).
          </p>
          <p className="text-gray-700 mb-4">
            We encourage you to review this Privacy Policy periodically to stay informed about our information practices.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p className="text-gray-700 mb-2">
            Email: privacy@edgebook.ai
          </p>
          <p className="text-gray-700">
            For general inquiries: support@edgebook.ai
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
