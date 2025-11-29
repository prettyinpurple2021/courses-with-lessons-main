import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';

const PrivacyPolicyPage = () => {
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
              Privacy <span className="text-hot-pink">Policy</span>
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-8">
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="text-gray-300 mb-4">
                  Welcome to SoloSuccess Intel Academy ("we," "our," or "us"). We are committed to protecting your personal 
                  information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and 
                  safeguard your information when you use our online learning platform and services.
                </p>
                <p className="text-gray-300 mb-4">
                  By using SoloSuccess Intel Academy, you agree to the collection and use of information in accordance with 
                  this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Personal Information</h3>
                <p className="text-gray-300 mb-4">
                  When you register for an account, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Name (first and last)</li>
                  <li>Email address</li>
                  <li>Password (encrypted)</li>
                  <li>Profile information (bio, avatar/profile picture)</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Usage Information</h3>
                <p className="text-gray-300 mb-4">
                  We automatically collect certain information when you use our platform:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Course progress and completion data</li>
                  <li>Lesson viewing history and video watch time</li>
                  <li>Activity submissions and quiz responses</li>
                  <li>Forum posts and community interactions</li>
                  <li>Notes and annotations you create</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and general location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-300 mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Provide Services:</strong> To create and manage your account, deliver course content, track your progress, and issue certificates</li>
                  <li><strong className="text-white">Process Payments:</strong> To process transactions and send purchase confirmations</li>
                  <li><strong className="text-white">Communication:</strong> To send you course updates, notifications, technical notices, and respond to your inquiries</li>
                  <li><strong className="text-white">Improve Services:</strong> To analyze usage patterns, improve our platform, and develop new features</li>
                  <li><strong className="text-white">Community Features:</strong> To enable forum participation, member profiles, and community interactions</li>
                  <li><strong className="text-white">Security:</strong> To detect, prevent, and address technical issues and fraudulent activity</li>
                  <li><strong className="text-white">Legal Compliance:</strong> To comply with legal obligations and enforce our terms of service</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-300 mb-4">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Service Providers:</strong> With third-party vendors who perform services on our behalf (payment processing, email delivery, hosting)</li>
                  <li><strong className="text-white">Community Features:</strong> Your profile information and forum posts are visible to other members</li>
                  <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
                <p className="text-gray-300 mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Encryption of data in transit using SSL/TLS</li>
                  <li>Secure password hashing using industry-standard algorithms</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure cloud infrastructure with reputable providers</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your 
                  information, we cannot guarantee absolute security.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights and Choices</h2>
                <p className="text-gray-300 mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                  <li><strong className="text-white">Correction:</strong> Update or correct inaccurate information through your account settings</li>
                  <li><strong className="text-white">Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing emails (account-related emails may still be sent)</li>
                  <li><strong className="text-white">Data Portability:</strong> Request your data in a portable format</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  To exercise these rights, please contact us at{' '}
                  <a href="mailto:privacy@solosuccess.academy" className="text-hot-pink hover:underline">
                    privacy@solosuccess.academy
                  </a>
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-gray-300 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Keep you logged in to your account</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content recommendations</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  You can control cookies through your browser settings, but disabling them may affect platform functionality.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
                <p className="text-gray-300 mb-4">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
                  outlined in this policy. When you delete your account, we will delete or anonymize your personal information 
                  within 30 days, except where we are required to retain it for legal or regulatory purposes.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
                <p className="text-gray-300 mb-4">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                  information from children. If you believe we have collected information from a child, please contact us 
                  immediately.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
                <p className="text-gray-300 mb-4">
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-300 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
                  the new policy on this page and updating the "Effective Date" at the top. Your continued use of our services 
                  after changes are posted constitutes acceptance of the updated policy.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
                <p className="text-gray-300 mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mt-4">
                  <p className="text-white mb-2"><strong>Email:</strong>{' '}
                    <a href="mailto:privacy@solosuccess.academy" className="text-hot-pink hover:underline">
                      privacy@solosuccess.academy
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
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
