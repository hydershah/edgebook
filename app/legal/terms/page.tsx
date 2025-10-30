import LegalLayout from '@/components/LegalLayout'

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'description', title: 'Service Description' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'User Accounts' },
  { id: 'content', title: 'User Content' },
  { id: 'fees', title: 'Fees and Payments' },
  { id: 'prohibited', title: 'Prohibited Conduct' },
  { id: 'intellectual', title: 'Intellectual Property' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'limitation', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'termination', title: 'Termination' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'contact', title: 'Contact Information' },
]

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" sections={sections}>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
      <p className="text-gray-600 mb-8">Last updated: January 2025</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section id="acceptance">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            Welcome to EdgeBook. By accessing or using our platform, website, or services (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our Service.
          </p>
          <p className="text-gray-700 mb-4">
            These Terms constitute a legally binding agreement between you and EdgeBook. We reserve the right to modify these Terms at any time, and your continued use of the Service following any changes indicates your acceptance of the new Terms.
          </p>
        </section>

        <section id="description">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
          <p className="text-gray-700 mb-4">
            EdgeBook is a social platform that allows users to share, discover, and discuss sports predictions and picks. The Service enables users to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Create and share sports picks and predictions</li>
            <li>Follow other users and view their picks</li>
            <li>Purchase premium picks from other users</li>
            <li>Engage with the community through comments and interactions</li>
            <li>Access AI-powered analytics and insights</li>
          </ul>
          <p className="text-gray-700 mb-4">
            EdgeBook is for informational and entertainment purposes only. We do not facilitate, promote, or endorse gambling activities.
          </p>
        </section>

        <section id="eligibility">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Eligibility</h2>
          <p className="text-gray-700 mb-4">
            You must be at least 18 years old to use EdgeBook. By using our Service, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>You are at least 18 years of age</li>
            <li>You have the legal capacity to enter into these Terms</li>
            <li>Your use of the Service complies with all applicable laws and regulations in your jurisdiction</li>
            <li>You are not prohibited from using the Service under any applicable law</li>
          </ul>
        </section>

        <section id="accounts">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            To access certain features of the Service, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized access or security breach</li>
          </ul>
          <p className="text-gray-700 mb-4">
            You may not transfer your account to another person or use another person&apos;s account without permission.
          </p>
        </section>

        <section id="content">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content</h2>
          <p className="text-gray-700 mb-4">
            You retain ownership of any content you post on EdgeBook, including picks, predictions, comments, and other materials (&quot;User Content&quot;). By posting User Content, you grant EdgeBook a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content in connection with operating the Service.
          </p>
          <p className="text-gray-700 mb-4">
            You are solely responsible for your User Content and the consequences of posting it. You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>You own or have the necessary rights to your User Content</li>
            <li>Your User Content does not infringe on any third party&apos;s rights</li>
            <li>Your User Content complies with these Terms and all applicable laws</li>
          </ul>
          <p className="text-gray-700 mb-4">
            EdgeBook does not endorse any User Content and is not responsible for its accuracy, reliability, or consequences of relying on it.
          </p>
        </section>

        <section id="fees">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Fees and Payments</h2>
          <p className="text-gray-700 mb-4">
            EdgeBook charges a platform fee of 15% on all premium pick sales. This fee is deducted from the purchase price before payment is transferred to the seller.
          </p>
          <p className="text-gray-700 mb-4">
            Payment processing is handled through secure third-party payment processors. You agree to comply with their terms and conditions. All fees are non-refundable unless otherwise stated or required by law.
          </p>
          <p className="text-gray-700 mb-4">
            Sellers are responsible for accurately pricing their content and complying with all applicable tax obligations related to their sales.
          </p>
        </section>

        <section id="prohibited">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree not to engage in any of the following prohibited activities:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Violating any laws, regulations, or third-party rights</li>
            <li>Posting false, misleading, or fraudulent content</li>
            <li>Impersonating any person or entity</li>
            <li>Harassing, threatening, or abusing other users</li>
            <li>Attempting to gain unauthorized access to the Service</li>
            <li>Interfering with the proper functioning of the Service</li>
            <li>Using automated systems to access the Service without permission</li>
            <li>Posting spam or unsolicited commercial content</li>
            <li>Collecting or harvesting user information without consent</li>
          </ul>
        </section>

        <section id="intellectual">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            The Service and its original content, features, and functionality are owned by EdgeBook and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p className="text-gray-700 mb-4">
            You may not copy, modify, distribute, sell, or lease any part of our Service without our prior written consent. You also may not reverse engineer or attempt to extract the source code of our software.
          </p>
        </section>

        <section id="disclaimers">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
          <p className="text-gray-700 mb-4 uppercase font-semibold">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied.
          </p>
          <p className="text-gray-700 mb-4">
            EdgeBook does not warrant that the Service will be uninterrupted, secure, or error-free. We do not warrant the accuracy, completeness, or reliability of any content on the Service.
          </p>
          <p className="text-gray-700 mb-4">
            Sports predictions and picks shared on EdgeBook are for informational purposes only. Past performance is not indicative of future results. EdgeBook makes no representations or warranties about the accuracy or potential success of any picks.
          </p>
        </section>

        <section id="limitation">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the maximum extent permitted by law, EdgeBook shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>
        </section>

        <section id="indemnification">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
          <p className="text-gray-700 mb-4">
            You agree to indemnify, defend, and hold harmless EdgeBook and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney&apos;s fees, arising out of or in any way connected with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Your access to or use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Your User Content</li>
          </ul>
        </section>

        <section id="termination">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
          <p className="text-gray-700 mb-4">
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
          </p>
          <p className="text-gray-700 mb-4">
            Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
          </p>
        </section>

        <section id="changes">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by updating the date at the top of these Terms and, in some cases, provide additional notice (such as via email or through the Service).
          </p>
          <p className="text-gray-700 mb-4">
            Your continued use of the Service after any changes indicates your acceptance of the new Terms.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700">
            Email: legal@edgebook.ai
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
