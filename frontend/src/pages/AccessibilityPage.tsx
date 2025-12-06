import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';

const AccessibilityPage = () => {
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
              Accessibility <span className="text-hot-pink">Statement</span>
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-8">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Our Commitment</h2>
                <p className="text-gray-300 mb-4">
                  SoloSuccess Intel Academy is committed to ensuring digital accessibility for people of all abilities. 
                  We believe that every aspiring entrepreneur deserves equal access to quality education, regardless of 
                  disability or impairment. We are continually improving the user experience for everyone and applying 
                  the relevant accessibility standards.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Conformance Status</h2>
                <p className="text-gray-300 mb-4">
                  The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to 
                  improve accessibility for people with disabilities. We aim to conform to{' '}
                  <strong className="text-white">WCAG 2.1 Level AA</strong> standards.
                </p>
                <div className="bg-success-teal bg-opacity-20 border border-success-teal border-opacity-30 rounded-lg p-4 mb-4">
                  <p className="text-white font-semibold mb-2">Current Compliance Level:</p>
                  <p className="text-gray-300">WCAG 2.1 Level AA - Partially Conformant</p>
                </div>
                <p className="text-gray-300 mb-4">
                  "Partially conformant" means that some parts of the content do not fully conform to the accessibility 
                  standard. We are actively working to address any gaps.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Accessibility Features</h2>
                <p className="text-gray-300 mb-4">
                  Our platform includes the following accessibility features:
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">Navigation & Structure</h3>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Consistent navigation throughout the website</li>
                  <li>Semantic HTML structure with proper heading hierarchy</li>
                  <li>Skip navigation links for keyboard users</li>
                  <li>Breadcrumb navigation for orientation</li>
                  <li>Descriptive page titles</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">Visual Design</h3>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Sufficient color contrast ratios (minimum 4.5:1 for normal text)</li>
                  <li>Resizable text up to 200% without loss of functionality</li>
                  <li>No content that relies solely on color to convey information</li>
                  <li>Clear focus indicators for interactive elements</li>
                  <li>Responsive design that works across devices and screen sizes</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">Interactive Elements</h3>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>All functionality available via keyboard</li>
                  <li>ARIA labels and roles for screen reader compatibility</li>
                  <li>Form inputs with associated labels</li>
                  <li>Clear error messages and validation feedback</li>
                  <li>Sufficient click/touch target sizes</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">Media Content</h3>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Video player with caption support</li>
                  <li>Alt text for meaningful images</li>
                  <li>No auto-playing audio or video</li>
                  <li>Pause, stop, or hide options for moving content</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Known Limitations</h2>
                <p className="text-gray-300 mb-4">
                  We are aware of the following accessibility limitations and are actively working to address them:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li><strong className="text-white">YouTube Videos:</strong> Some embedded YouTube videos may not have captions enabled. We are working with content creators to ensure all videos are captioned.</li>
                  <li><strong className="text-white">PDF Documents:</strong> Some downloadable resources may not be fully accessible. We are in the process of remediating these documents.</li>
                  <li><strong className="text-white">Complex Charts:</strong> Some data visualizations in the dashboard may not be fully accessible to screen readers. Alternative text descriptions are provided where possible.</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Assistive Technology Compatibility</h2>
                <p className="text-gray-300 mb-4">
                  Our platform is designed to be compatible with the following assistive technologies:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                  <li>Screen magnification software</li>
                  <li>Speech recognition software</li>
                  <li>Keyboard-only navigation</li>
                  <li>Browser accessibility extensions</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Browser Support</h2>
                <p className="text-gray-300 mb-4">
                  For the best accessible experience, we recommend using the latest versions of:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Google Chrome</li>
                  <li>Mozilla Firefox</li>
                  <li>Apple Safari</li>
                  <li>Microsoft Edge</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Feedback & Assistance</h2>
                <p className="text-gray-300 mb-4">
                  We welcome your feedback on the accessibility of SoloSuccess Intel Academy. If you encounter any 
                  accessibility barriers or need assistance:
                </p>
                <div className="bg-black bg-opacity-30 rounded-lg p-6 mt-4">
                  <p className="text-white mb-2"><strong>Email:</strong>{' '}
                    <a href="mailto:accessibility@solosuccess.academy" className="text-hot-pink hover:underline">
                      accessibility@solosuccess.academy
                    </a>
                  </p>
                  <p className="text-white mb-2"><strong>Phone:</strong> Contact us via our support channels</p>
                  <p className="text-white"><strong>Response Time:</strong> We aim to respond within 2 business days</p>
                </div>
                <p className="text-gray-300 mt-4">
                  When contacting us, please provide:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>The URL of the page you were on</li>
                  <li>A description of the accessibility issue</li>
                  <li>The assistive technology you were using (if applicable)</li>
                  <li>Your preferred method of contact</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Continuous Improvement</h2>
                <p className="text-gray-300 mb-4">
                  We are committed to ongoing accessibility improvements. Our efforts include:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                  <li>Regular accessibility audits and testing</li>
                  <li>Training for our content creators and developers</li>
                  <li>Incorporating accessibility into our design and development processes</li>
                  <li>Monitoring and addressing user feedback</li>
                  <li>Staying current with accessibility best practices and standards</li>
                </ul>
              </section>
              
              <div className="bg-hot-pink bg-opacity-10 border border-hot-pink border-opacity-30 rounded-lg p-6 mt-8">
                <p className="text-white text-sm">
                  <strong>Enforcement:</strong> If you are not satisfied with our response, you may file a complaint 
                  with your local civil rights enforcement agency or accessibility regulatory body.
                </p>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage;
