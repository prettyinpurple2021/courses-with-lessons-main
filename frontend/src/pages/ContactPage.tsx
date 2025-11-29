import { useState } from 'react';
import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission (in production, this would send to your backend)
    try {
      // For now, just log to console and show success
      console.log('Contact form submission:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
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
              Get in <span className="text-hot-pink">Touch</span>
            </h1>
            
            <p className="text-gray-300 text-lg mb-8">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-hot-pink bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-hot-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Email</h3>
                  <a href="mailto:support@solosuccess.academy" className="text-gray-300 hover:text-hot-pink transition-colors">
                    support@solosuccess.academy
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-success-teal bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Response Time</h3>
                  <p className="text-gray-300">
                    Within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black bg-opacity-30 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-hot-pink transition-colors"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black bg-opacity-30 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-hot-pink transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-white font-semibold mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black bg-opacity-30 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-hot-pink transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-white font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black bg-opacity-30 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-hot-pink transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="bg-success-teal bg-opacity-20 border border-success-teal border-opacity-30 rounded-lg p-4">
                  <p className="text-success-teal font-semibold">
                    ✓ Message sent successfully! We'll get back to you within 24-48 hours.
                  </p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4">
                  <p className="text-red-400 font-semibold">
                    ✗ Something went wrong. Please try again or email us directly.
                  </p>
                </div>
              )}
              
              <GlassmorphicButton 
                variant="primary" 
                size="lg"
                className="w-full holographic-hover"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </GlassmorphicButton>
            </form>
            
            <div className="bg-hot-pink bg-opacity-10 border border-hot-pink border-opacity-30 rounded-lg p-4 mt-6">
              <p className="text-gray-300 text-sm text-center">
                <strong className="text-white">Prefer email?</strong> Send us a message directly at{' '}
                <a href="mailto:support@solosuccess.academy" className="text-hot-pink hover:underline">
                  support@solosuccess.academy
                </a>
              </p>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
