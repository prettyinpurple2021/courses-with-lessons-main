import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';

const DisclaimerPage = () => {
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
              <span className="text-hot-pink">Disclaimer</span>
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-8">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              
              <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-lg p-6 mb-8">
                <p className="text-white font-semibold mb-2">⚠️ Important Notice</p>
                <p className="text-gray-300">
                  Please read this disclaimer carefully before using our services or relying on any information 
                  provided through SoloSuccess Intel Academy.
                </p>
              </div>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Educational Purpose Only</h2>
                <p className="text-gray-300 mb-4">
                  The content provided by SoloSuccess Intel Academy, including all courses, lessons, activities, 
                  materials, and resources, is intended for <strong className="text-white">educational and informational 
                  purposes only</strong>. Our courses are designed to teach general business and entrepreneurship 
                  concepts and strategies.
                </p>
                <p className="text-gray-300 mb-4">
                  The information provided should not be construed as professional advice. We encourage you to seek the 
                  advice of qualified professionals for specific questions or situations pertaining to your individual 
                  circumstances.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. No Income or Success Guarantees</h2>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mb-4">
                  <p className="text-gray-300 mb-4">
                    <strong className="text-white">We make no guarantees regarding:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li>Specific income levels or financial results</li>
                    <li>Business success or profitability</li>
                    <li>Return on investment of time or money</li>
                    <li>Achievement of specific business milestones</li>
                    <li>Outcomes similar to testimonials or case studies</li>
                  </ul>
                </div>
                <p className="text-gray-300 mb-4">
                  Your results will vary based on many factors, including but not limited to: your background, 
                  experience, work ethic, market conditions, and economic environment. Starting and running a business 
                  involves risk, and there is no guarantee of success.
                </p>
                <p className="text-gray-300 mb-4">
                  Any testimonials, case studies, or examples of results achieved by our students are not guarantees 
                  that you will achieve similar results. These examples are provided for illustrative purposes only.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. Not Professional Advice</h2>
                <p className="text-gray-300 mb-4">
                  The content provided through our platform does <strong className="text-white">NOT</strong> constitute:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Legal Advice:</strong> We are not attorneys. Content related to business structure, contracts, and regulations is for educational purposes only. Consult a licensed attorney for legal matters.</li>
                  <li><strong className="text-white">Financial Advice:</strong> We are not financial advisors. Content related to business finances, investments, and accounting is educational. Consult a certified financial professional.</li>
                  <li><strong className="text-white">Tax Advice:</strong> We are not tax professionals. Content related to taxation is general information only. Consult a licensed tax professional for tax-related matters.</li>
                  <li><strong className="text-white">Medical or Mental Health Advice:</strong> Content related to stress management or work-life balance is not medical advice. Consult healthcare professionals for medical concerns.</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Individual Responsibility</h2>
                <p className="text-gray-300 mb-4">
                  You are solely responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Your own business decisions and actions</li>
                  <li>Evaluating the applicability of any information to your situation</li>
                  <li>Seeking appropriate professional guidance when needed</li>
                  <li>Compliance with all applicable laws and regulations in your jurisdiction</li>
                  <li>Conducting your own research and due diligence</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Content and Links</h2>
                <p className="text-gray-300 mb-4">
                  Our platform may contain links to third-party websites, tools, or resources. We provide these links 
                  for your convenience and information, but:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>We do not endorse or guarantee the accuracy of third-party content</li>
                  <li>We are not responsible for the content, products, or services offered by third parties</li>
                  <li>Your use of third-party sites is at your own risk and subject to their terms</li>
                  <li>We do not receive compensation for most third-party recommendations</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  Where we do have affiliate relationships or receive compensation, this will be clearly disclosed.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. Content Accuracy</h2>
                <p className="text-gray-300 mb-4">
                  While we strive to provide accurate and up-to-date information, we make no representations or 
                  warranties about:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>The completeness, accuracy, reliability, or timeliness of any content</li>
                  <li>The suitability of content for any specific purpose</li>
                  <li>Whether content remains current as laws, markets, and best practices change</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  Business environments, regulations, and best practices change frequently. You should verify 
                  information and ensure it is current and applicable to your situation.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-300 mb-4">
                  To the fullest extent permitted by law, SoloSuccess Intel Academy and its owners, operators, 
                  instructors, employees, and affiliates shall not be liable for:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Any direct, indirect, incidental, consequential, or punitive damages</li>
                  <li>Loss of profits, revenue, data, or business opportunities</li>
                  <li>Any damages arising from your use of or reliance on our content</li>
                  <li>Any actions you take or fail to take based on our educational material</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. Testimonials and Success Stories</h2>
                <p className="text-gray-300 mb-4">
                  Any testimonials, reviews, or success stories featured on our platform:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Represent individual experiences and results</li>
                  <li>Are not intended to represent or guarantee typical results</li>
                  <li>May not be representative of what you may achieve</li>
                  <li>Should not be relied upon as a predictor of your success</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                <p className="text-gray-300 mb-4">
                  If you have questions about this disclaimer, please contact us:
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mt-4">
                  <p className="text-white mb-2"><strong>Email:</strong>{' '}
                    <a href="mailto:legal@solosuccess.academy" className="text-hot-pink hover:underline">
                      legal@solosuccess.academy
                    </a>
                  </p>
                </div>
              </section>
              
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-700">
                <Link to="/terms" className="text-hot-pink hover:underline">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-hot-pink hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/refunds" className="text-hot-pink hover:underline">
                  Refund Policy
                </Link>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
