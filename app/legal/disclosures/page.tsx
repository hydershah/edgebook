import LegalLayout from '@/components/LegalLayout'

const sections = [
  { id: 'general', title: 'General Disclosures' },
  { id: 'no-guarantee', title: 'No Guarantee of Results' },
  { id: 'user-content', title: 'User-Generated Content' },
  { id: 'not-financial', title: 'Not Financial Advice' },
  { id: 'risk', title: 'Risk Disclosure' },
  { id: 'fees', title: 'Platform Fees' },
  { id: 'accuracy', title: 'Accuracy of Information' },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'legal', title: 'Legal Compliance' },
  { id: 'responsible', title: 'Responsible Use' },
  { id: 'disclaimer', title: 'General Disclaimer' },
]

export default function Disclosures() {
  return (
    <LegalLayout title="Disclosures" sections={sections}>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Disclosures</h1>
      <p className="text-gray-600 mb-8">Last updated: January 2025</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section id="general">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. General Disclosures</h2>
          <p className="text-gray-700 mb-4">
            EdgeBook is a social platform for sports enthusiasts to share predictions, picks, and insights. This page contains important disclosures about the nature of our Service and the limitations of the information provided on our platform.
          </p>
          <p className="text-gray-700 mb-4">
            By using EdgeBook, you acknowledge that you have read, understood, and agree to these disclosures. If you do not agree with any part of these disclosures, please do not use our Service.
          </p>
        </section>

        <section id="no-guarantee">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. No Guarantee of Results</h2>
          <p className="text-gray-700 mb-4 font-semibold text-lg">
            PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS
          </p>
          <p className="text-gray-700 mb-4">
            All picks, predictions, and advice shared on EdgeBook are for informational and entertainment purposes only. We make no representations or warranties about the accuracy, reliability, completeness, or timeliness of any content on our platform.
          </p>
          <p className="text-gray-700 mb-4">
            The fact that a user has had successful picks in the past does not guarantee that their future picks will be successful. Sports outcomes are inherently unpredictable, and many factors can influence results.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Historical performance data is provided for informational purposes only</li>
            <li>Success rates can vary significantly over time</li>
            <li>No pick or prediction is guaranteed to be accurate</li>
            <li>You should not rely solely on information from EdgeBook when making decisions</li>
          </ul>
        </section>

        <section id="user-content">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User-Generated Content</h2>
          <p className="text-gray-700 mb-4">
            All picks, predictions, analyses, and other content on EdgeBook are created by users of the platform, not by EdgeBook itself. EdgeBook does not:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Verify the accuracy of user-generated content</li>
            <li>Endorse any specific picks or predictions</li>
            <li>Guarantee the expertise or qualifications of content creators</li>
            <li>Take responsibility for the quality or reliability of user content</li>
            <li>Verify the win-loss records or statistics claimed by users</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Users are solely responsible for their own content and any consequences that may arise from posting or following such content. EdgeBook acts as a platform provider and is not responsible for user actions or decisions.
          </p>
        </section>

        <section id="not-financial">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Not Financial Advice</h2>
          <p className="text-gray-700 mb-4">
            Content on EdgeBook is for informational and entertainment purposes only and should not be considered as:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Professional financial advice</li>
            <li>Investment recommendations</li>
            <li>Gambling advice or recommendations</li>
            <li>Legal advice regarding gambling laws</li>
            <li>Professional consultation of any kind</li>
          </ul>
          <p className="text-gray-700 mb-4">
            EdgeBook and its users are not licensed financial advisors, professional gamblers, or legal experts. You should consult with appropriate professionals before making any financial decisions.
          </p>
        </section>

        <section id="risk">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Risk Disclosure</h2>
          <p className="text-gray-700 mb-4 font-semibold">
            IMPORTANT: Sports betting and gambling involve significant financial risk.
          </p>
          <p className="text-gray-700 mb-4">
            While EdgeBook is a platform for sharing sports picks and predictions, we recognize that some users may use this information in connection with sports betting activities. You should be aware that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>You can lose money when betting on sports</li>
            <li>No system or strategy can guarantee profits</li>
            <li>Gambling can be addictive and lead to financial problems</li>
            <li>You should never bet more than you can afford to lose</li>
            <li>Past success does not guarantee future results</li>
            <li>Sports outcomes are unpredictable and subject to many variables</li>
          </ul>
          <p className="text-gray-700 mb-4">
            EdgeBook strongly encourages responsible decision-making and does not promote irresponsible betting behavior.
          </p>
        </section>

        <section id="fees">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Platform Fees</h2>
          <p className="text-gray-700 mb-4">
            EdgeBook operates as a marketplace connecting content creators with users interested in sports picks and predictions. Our business model includes the following fee structure:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Platform Fee: 15% of all premium pick purchases</li>
            <li>This fee is deducted from the purchase price before payment to the seller</li>
            <li>Fees are clearly displayed before purchase</li>
            <li>All sales are final and non-refundable unless otherwise stated</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Sellers set their own prices for premium content. EdgeBook does not control or influence pricing decisions made by content creators.
          </p>
          <p className="text-gray-700 mb-4">
            Payment processing is handled by third-party payment processors. Standard payment processing fees may apply in addition to EdgeBook&apos;s platform fee.
          </p>
        </section>

        <section id="accuracy">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Accuracy of Information</h2>
          <p className="text-gray-700 mb-4">
            While we strive to maintain accurate information on our platform, EdgeBook makes no guarantees about:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>The accuracy of game schedules, scores, or statistics</li>
            <li>The correctness of user-reported win-loss records</li>
            <li>The validity of user claims about expertise or experience</li>
            <li>The timeliness of information displayed on the platform</li>
            <li>The completeness of any data or analytics provided</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Users are responsible for verifying any information before making decisions based on it. We recommend consulting official sources for game information, statistics, and betting lines.
          </p>
        </section>

        <section id="third-party">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            EdgeBook may integrate with or reference third-party services, websites, or applications. Please be aware that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>We do not control or endorse third-party services</li>
            <li>Third-party services have their own terms and privacy policies</li>
            <li>We are not responsible for the content or practices of third parties</li>
            <li>Links to third-party services do not constitute endorsement</li>
            <li>Use of third-party services is at your own risk</li>
          </ul>
          <p className="text-gray-700 mb-4">
            This includes but is not limited to sports data providers, analytics services, payment processors, and social media platforms.
          </p>
        </section>

        <section id="legal">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Legal Compliance</h2>
          <p className="text-gray-700 mb-4 font-semibold">
            You are responsible for ensuring your use of EdgeBook complies with all applicable laws in your jurisdiction.
          </p>
          <p className="text-gray-700 mb-4">
            Sports betting laws vary significantly by location. Some jurisdictions prohibit or restrict sports betting, while others have specific licensing requirements. You should:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Understand the laws applicable to your location</li>
            <li>Comply with all local, state, and federal regulations</li>
            <li>Ensure you meet any age requirements for betting in your jurisdiction</li>
            <li>Use licensed and regulated betting services where required</li>
            <li>Report winnings for tax purposes as required by law</li>
          </ul>
          <p className="text-gray-700 mb-4">
            EdgeBook does not facilitate betting transactions and is not responsible for ensuring your compliance with gambling laws. If you are unsure about the legality of sports betting in your area, consult with a legal professional.
          </p>
        </section>

        <section id="responsible">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Responsible Use</h2>
          <p className="text-gray-700 mb-4">
            EdgeBook is committed to promoting responsible use of our platform. We encourage all users to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Set personal limits on spending and time</li>
            <li>Never chase losses</li>
            <li>Keep betting or following picks as entertainment, not income</li>
            <li>Seek help if you feel your behavior is becoming problematic</li>
            <li>Be honest about your experience and results when sharing picks</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-700 mb-3">
              If you or someone you know has a gambling problem, help is available:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li><strong>National Problem Gambling Helpline:</strong> 1-800-522-4700</li>
              <li><strong>Website:</strong> ncpgambling.org</li>
              <li><strong>Crisis Text Line:</strong> Text &quot;HELP&quot; to 741741</li>
            </ul>
          </div>
        </section>

        <section id="disclaimer">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. General Disclaimer</h2>
          <p className="text-gray-700 mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>EdgeBook provides the platform &quot;as is&quot; without warranties of any kind</li>
            <li>We make no representations about the suitability, reliability, or accuracy of information on the platform</li>
            <li>We are not liable for any losses or damages arising from your use of the Service</li>
            <li>We are not responsible for decisions you make based on information from our platform</li>
            <li>You assume all risks associated with using the Service</li>
          </ul>
          <p className="text-gray-700 mb-4">
            By using EdgeBook, you acknowledge that you have read and understood all of the disclosures on this page and accept all associated risks.
          </p>
        </section>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Reminder</h3>
          <p className="text-gray-700">
            EdgeBook is a platform for sharing sports picks and predictions for informational and entertainment purposes only. We do not facilitate gambling transactions, provide professional advice, or guarantee any results. Always make informed decisions and comply with all applicable laws in your jurisdiction.
          </p>
        </div>
      </div>
    </LegalLayout>
  )
}
