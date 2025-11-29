import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <CamoBackground variant="subtle" className="fixed inset-0 z-0" />
      
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-hot-pink hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          
          <GlassmorphicCard variant="elevated" className="p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-headline font-bold text-white mb-6">
              Terms of <span className="text-hot-pink">Service</span>
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-8">
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-300 mb-4">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you and SoloSuccess Intel 
                  Academy ("Company," "we," "us," or "our") concerning your access to and use of our online learning platform 
                  and services.
                </p>
                <p className="text-gray-300 mb-4">
                  By accessing or using our platform, you agree that you have read, understood, and agree to be bound by these 
                  Terms. If you do not agree with these Terms, you must not access or use our services.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
                <p className="text-gray-300 mb-4">
                  You must be at least 18 years old to use our services. By using our platform, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>You are at least 18 years of age</li>
                  <li>You have the legal capacity to enter into these Terms</li>
                  <li>You will comply with these Terms and all applicable laws</li>
                  <li>All information you provide is accurate and current</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration and Security</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.1 Account Creation</h3>
                <p className="text-gray-300 mb-4">
                  To access certain features, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Provide accurate, complete, and current information</li>
                  <li>Maintain and update your information as needed</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Account Termination</h3>
                <p className="text-gray-300 mb-4">
                  We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, 
                  abusive, or illegal activity.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Course Access and License</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.1 License Grant</h3>
                <p className="text-gray-300 mb-4">
                  Upon purchase, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use 
                  the course materials for your personal, non-commercial educational purposes.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.2 Restrictions</h3>
                <p className="text-gray-300 mb-4">
                  You may NOT:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Share your account credentials with others</li>
                  <li>Download, copy, or distribute course materials without permission</li>
                  <li>Record, screenshot, or reproduce video content</li>
                  <li>Sell, rent, or sublicense access to courses</li>
                  <li>Use course content for commercial purposes</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Remove copyright or proprietary notices</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.3 Lifetime Access</h3>
                <p className="text-gray-300 mb-4">
                  "Lifetime access" means you can access purchased courses for as long as the platform operates and the courses 
                  remain available. We reserve the right to discontinue courses with reasonable notice.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Payment and Pricing</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Pricing</h3>
                <p className="text-gray-300 mb-4">
                  All prices are listed in USD and are subject to change. We will notify you of price changes before they affect 
                  your purchases. Prices do not include applicable taxes, which will be added at checkout.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 Payment Processing</h3>
                <p className="text-gray-300 mb-4">
                  Payments are processed securely through third-party payment processors. By providing payment information, you 
                  authorize us to charge the applicable fees.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 No Recurring Charges</h3>
                <p className="text-gray-300 mb-4">
                  All purchases are one-time payments. We do not charge recurring subscription fees unless explicitly stated 
                  for specific services.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. Refund Policy</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.1 30-Day Money-Back Guarantee</h3>
                <p className="text-gray-300 mb-4">
                  We offer a 30-day money-back guarantee on all course purchases. If you're not satisfied, contact us within 
                  30 days of purchase for a full refund.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.2 Refund Conditions</h3>
                <p className="text-gray-300 mb-4">
                  To be eligible for a refund:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Request must be made within 30 days of purchase</li>
                  <li>You must not have completed more than 50% of the course</li>
                  <li>You must not have received a certificate of completion</li>
                  <li>No evidence of content theft or violation of Terms</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.3 Refund Process</h3>
                <p className="text-gray-300 mb-4">
                  Refunds are processed within 5-10 business days to your original payment method. Upon refund, your access 
                  to the course will be revoked.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property Rights</h2>
                <p className="text-gray-300 mb-4">
                  All content on our platform, including but not limited to text, graphics, logos, videos, audio, software, 
                  and course materials, is the property of SoloSuccess Intel Academy and is protected by copyright, trademark, 
                  and other intellectual property laws.
                </p>
                <p className="text-gray-300 mb-4">
                  You retain ownership of any content you create and submit (forum posts, project submissions, etc.), but you 
                  grant us a license to use, display, and distribute such content as necessary to provide our services.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. User Conduct and Community Guidelines</h2>
                <p className="text-gray-300 mb-4">
                  You agree to use our platform respectfully and professionally. Prohibited conduct includes:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Harassment, bullying, or threatening behavior</li>
                  <li>Posting offensive, discriminatory, or inappropriate content</li>
                  <li>Spamming or unsolicited advertising</li>
                  <li>Impersonating others or providing false information</li>
                  <li>Attempting to hack, disrupt, or compromise platform security</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers and Limitations of Liability</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.1 Educational Content Disclaimer</h3>
                <p className="text-gray-300 mb-4">
                  Our courses provide educational information and guidance. Results may vary, and we make no guarantees about 
                  specific outcomes, business success, or income levels. Your success depends on your own effort, dedication, 
                  and circumstances.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.2 "As Is" Basis</h3>
                <p className="text-gray-300 mb-4">
                  Our services are provided "as is" and "as available" without warranties of any kind, either express or implied, 
                  including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.3 Limitation of Liability</h3>
                <p className="text-gray-300 mb-4">
                  To the maximum extent permitted by law, SoloSuccess Intel Academy shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                  directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">10. Indemnification</h2>
                <p className="text-gray-300 mb-4">
                  You agree to indemnify, defend, and hold harmless SoloSuccess Intel Academy and its officers, directors, 
                  employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your violation 
                  of these Terms or your use of our services.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">11. Modifications to Services and Terms</h2>
                <p className="text-gray-300 mb-4">
                  We reserve the right to modify, suspend, or discontinue any part of our services at any time. We may also 
                  update these Terms periodically. Material changes will be communicated via email or platform notification. 
                  Continued use after changes constitutes acceptance of the updated Terms.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law and Dispute Resolution</h2>
                <p className="text-gray-300 mb-4">
                  These Terms are governed by and construed in accordance with the laws of the United States. Any disputes 
                  arising from these Terms or your use of our services shall be resolved through binding arbitration, except 
                  where prohibited by law.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">13. Severability</h2>
                <p className="text-gray-300 mb-4">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or 
                  eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
                <p className="text-gray-300 mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mt-4">
                  <p className="text-white mb-2"><strong>Legal Inquiries:</strong>{' '}
                    <a href="mailto:legal@solosuccess.academy" className="text-hot-pink hover:underline">
                      legal@solosuccess.academy
                    </a>
                  </p>
                  <p className="text-white mb-2"><strong>General Support:</strong>{' '}
                    <a href="mailto:support@solosuccess.academy" className="text-hot-pink hover:underline">
                      support@solosuccess.academy
                    </a>
                  </p>
                  <p className="text-white"><strong>Response Time:</strong> Within 48 hours</p>
                </div>
              </section>
              
              <div className="bg-hot-pink bg-opacity-10 border border-hot-pink border-opacity-30 rounded-lg p-6 mt-8">
                <p className="text-white text-sm">
                  <strong>Important:</strong> By using SoloSuccess Intel Academy, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
