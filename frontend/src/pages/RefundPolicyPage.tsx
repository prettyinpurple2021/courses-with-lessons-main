import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';

const RefundPolicyPage = () => {
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
              Refund <span className="text-hot-pink">Policy</span>
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-8">
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              
              {/* Guarantee Badge */}
              <div className="bg-success-teal bg-opacity-20 border border-success-teal border-opacity-30 rounded-lg p-6 mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-success-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-2xl font-bold text-white">30-Day Money-Back Guarantee</span>
                </div>
                <p className="text-gray-300">
                  We stand behind our courses. If you're not satisfied, we'll give you a full refund.
                </p>
              </div>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Our Commitment</h2>
                <p className="text-gray-300 mb-4">
                  At SoloSuccess Intel Academy, we want you to be completely satisfied with your purchase. We believe 
                  in the quality of our courses and stand behind them with a straightforward refund policy. If our 
                  courses aren't the right fit for you, simply request a refund within 30 days of your purchase.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility for Refund</h2>
                <p className="text-gray-300 mb-4">
                  To be eligible for a full refund, you must meet the following criteria:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Timeframe:</strong> Your refund request must be made within 30 days of the original purchase date</li>
                  <li><strong className="text-white">Course Progress:</strong> You must not have completed more than 50% of the purchased course(s)</li>
                  <li><strong className="text-white">No Certificate:</strong> You must not have received a course completion certificate</li>
                  <li><strong className="text-white">Good Standing:</strong> Your account must be in good standing with no Terms of Service violations</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">3. How to Request a Refund</h2>
                <p className="text-gray-300 mb-4">
                  Requesting a refund is simple:
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mb-4">
                  <ol className="list-decimal list-inside text-gray-300 space-y-3">
                    <li><strong className="text-white">Email Us:</strong> Send a refund request to{' '}
                      <a href="mailto:support@solosuccess.academy" className="text-hot-pink hover:underline">
                        support@solosuccess.academy
                      </a>
                    </li>
                    <li><strong className="text-white">Include Details:</strong> Provide your full name, email address, and order number</li>
                    <li><strong className="text-white">Reason (Optional):</strong> Let us know why the course didn't meet your expectations - this helps us improve</li>
                    <li><strong className="text-white">Confirmation:</strong> You'll receive a confirmation email within 24 hours</li>
                  </ol>
                </div>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">4. Refund Processing</h2>
                <p className="text-gray-300 mb-4">
                  Once your refund request is approved:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">Processing Time:</strong> Refunds are processed within 5-10 business days</li>
                  <li><strong className="text-white">Payment Method:</strong> Refunds are issued to your original payment method</li>
                  <li><strong className="text-white">Bank Processing:</strong> Your bank may take an additional 3-5 business days to reflect the refund</li>
                  <li><strong className="text-white">Access Revoked:</strong> Upon refund, your access to the course(s) will be revoked</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">5. Non-Refundable Items</h2>
                <p className="text-gray-300 mb-4">
                  The following are not eligible for refunds:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Purchases made more than 30 days ago</li>
                  <li>Courses where you have completed more than 50% of the content</li>
                  <li>Certificates already issued for completed courses</li>
                  <li>Accounts terminated for Terms of Service violations</li>
                  <li>Promotional or discounted purchases with explicit "no refund" terms</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">6. Partial Refunds</h2>
                <p className="text-gray-300 mb-4">
                  In some cases, we may offer partial refunds:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>If you've completed 50-75% of a course, you may be eligible for a 25% refund</li>
                  <li>Bundle purchases may be eligible for partial refunds based on courses accessed</li>
                  <li>Extenuating circumstances will be evaluated on a case-by-case basis</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">7. Chargebacks</h2>
                <p className="text-gray-300 mb-4">
                  We encourage you to contact us directly before initiating a chargeback with your bank or credit 
                  card company. Chargebacks incur significant fees and may result in account suspension. We're 
                  committed to resolving any issues directly and fairly.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
                <p className="text-gray-300 mb-4">
                  Have questions about our refund policy? We're here to help:
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mt-4">
                  <p className="text-white mb-2"><strong>Email:</strong>{' '}
                    <a href="mailto:support@solosuccess.academy" className="text-hot-pink hover:underline">
                      support@solosuccess.academy
                    </a>
                  </p>
                  <p className="text-white"><strong>Response Time:</strong> Within 24 hours</p>
                </div>
              </section>
              
              <div className="bg-hot-pink bg-opacity-10 border border-hot-pink border-opacity-30 rounded-lg p-6 mt-8">
                <p className="text-white text-sm">
                  <strong>Note:</strong> This Refund Policy is part of our{' '}
                  <Link to="/terms" className="text-hot-pink hover:underline">Terms of Service</Link>. 
                  By making a purchase, you agree to these terms.
                </p>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
