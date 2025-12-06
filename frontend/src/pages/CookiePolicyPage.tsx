import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';

const CookiePolicyPage = () => {
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
              Cookie <span className="text-hot-pink">Policy</span>
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-8">
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
                <p className="text-gray-300 mb-4">
                  Cookies are small text files that are placed on your device when you visit our website. They help us 
                  provide you with a better experience by remembering your preferences, keeping you logged in, and 
                  understanding how you use our platform.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Necessary Cookies</h3>
                <p className="text-gray-300 mb-4">
                  These cookies are essential for the website to function properly. They cannot be disabled.
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
                  <table className="w-full text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-white">Cookie Name</th>
                        <th className="text-left py-2 text-white">Purpose</th>
                        <th className="text-left py-2 text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">auth_token</td>
                        <td className="py-2">Keeps you logged into your account</td>
                        <td className="py-2">7 days</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">refresh_token</td>
                        <td className="py-2">Allows secure session renewal</td>
                        <td className="py-2">30 days</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">cookie_consent</td>
                        <td className="py-2">Stores your cookie preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr>
                        <td className="py-2">csrf_token</td>
                        <td className="py-2">Security protection against attacks</td>
                        <td className="py-2">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Analytics Cookies</h3>
                <p className="text-gray-300 mb-4">
                  These cookies help us understand how visitors interact with our website by collecting anonymous information.
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
                  <table className="w-full text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-white">Cookie Name</th>
                        <th className="text-left py-2 text-white">Provider</th>
                        <th className="text-left py-2 text-white">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">_ga, _ga_*</td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">Tracks page views and user journeys</td>
                      </tr>
                      <tr>
                        <td className="py-2">plausible_*</td>
                        <td className="py-2">Plausible Analytics</td>
                        <td className="py-2">Privacy-friendly analytics</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Marketing Cookies</h3>
                <p className="text-gray-300 mb-4">
                  These cookies may be set through our site by advertising partners to build a profile of your interests.
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
                  <table className="w-full text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-white">Cookie Name</th>
                        <th className="text-left py-2 text-white">Provider</th>
                        <th className="text-left py-2 text-white">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">_fbp</td>
                        <td className="py-2">Meta (Facebook)</td>
                        <td className="py-2">Advertising and remarketing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Cookies</h2>
                <p className="text-gray-300 mb-4">
                  We use the following third-party services that may set cookies:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">YouTube:</strong> For embedded video content in lessons</li>
                  <li><strong className="text-white">Cloudinary:</strong> For image and media delivery</li>
                  <li><strong className="text-white">Google Analytics:</strong> For understanding site usage</li>
                  <li><strong className="text-white">Payment Processors:</strong> For secure payment handling</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Managing Your Cookie Preferences</h2>
                <p className="text-gray-300 mb-4">
                  You can manage your cookie preferences in several ways:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Cookie Banner:</strong> Use our cookie consent banner when you first visit to set preferences</li>
                  <li><strong className="text-white">Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                  <li><strong className="text-white">Opt-Out Links:</strong> Visit the opt-out pages of third-party services directly</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  Please note that blocking certain cookies may impact the functionality of our platform.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Browser-Specific Instructions</h2>
                <p className="text-gray-300 mb-4">
                  To manage cookies in your browser:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li><strong className="text-white">Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                  <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong className="text-white">Edge:</strong> Settings → Cookies and Site Permissions</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. Updates to This Policy</h2>
                <p className="text-gray-300 mb-4">
                  We may update this Cookie Policy from time to time. We will notify you of any material changes by 
                  posting the new policy on this page and updating the "Effective Date" at the top.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
                <p className="text-gray-300 mb-4">
                  If you have questions about our use of cookies, please contact us:
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mt-4">
                  <p className="text-white mb-2"><strong>Email:</strong>{' '}
                    <a href="mailto:privacy@solosuccess.academy" className="text-hot-pink hover:underline">
                      privacy@solosuccess.academy
                    </a>
                  </p>
                </div>
              </section>
              
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-700">
                <Link to="/privacy" className="text-hot-pink hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-hot-pink hover:underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
