import { Link } from 'react-router-dom';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import CourseCard from '../components/course/CourseCard';
import PricingCard from '../components/pricing/PricingCard';
import DynamicMetaTags from '../components/common/DynamicMetaTags';
import { usePageMeta } from '../hooks/usePageMeta';


// Mock course data - will be replaced with API data later
const courses = [
  {
    id: '1',
    courseNumber: 1,
    title: 'Foundation & Mindset',
    description: 'Build the mental fortitude and foundational knowledge every successful entrepreneur needs. Master the basics of business strategy and develop an unshakeable mindset.',
    duration: '4 weeks',
    lessonsCount: 12,
    isLocked: false,
  },
  {
    id: '2',
    courseNumber: 2,
    title: 'Market Intelligence',
    description: 'Learn to read your market like a tactical map. Understand your customers, competitors, and position yourself for dominance in your niche.',
    duration: '4 weeks',
    lessonsCount: 12,
    isLocked: false,
  },
  {
    id: '3',
    courseNumber: 3,
    title: 'Strategic Operations',
    description: 'Streamline your operations with military precision. Build systems that scale and processes that run like clockwork.',
    duration: '4 weeks',
    lessonsCount: 12,
    isLocked: false,
  },
  {
    id: '4',
    courseNumber: 4,
    title: 'Financial Command',
    description: 'Take control of your finances with confidence. Master budgeting, forecasting, and financial strategy to fuel sustainable growth.',
    duration: '4 weeks',
    lessonsCount: 12,
    isLocked: false,
  },
  {
    id: '5',
    courseNumber: 5,
    title: 'Marketing Warfare',
    description: 'Deploy marketing strategies that capture attention and convert. Learn to position your brand and dominate your market space.',
    duration: '4 weeks',
    lessonsCount: 12,
    isLocked: false,
  },
  {
    id: '6',
    courseNumber: 6,
    title: 'Sales Mastery',
    description: 'Close deals with confidence and authenticity. Develop a sales process that feels natural and drives consistent revenue.',
    duration: '4 weeks',
    lessonsCount: 12,
    isLocked: false,
  },
  {
    id: '7',
    courseNumber: 7,
    title: 'Leadership & Scale',
    description: 'Step into your role as a leader. Build teams, delegate effectively, and scale your business beyond your wildest dreams.',
    duration: '4 weeks',
    lessonsCount: 12,
    isLocked: false,
  },
];

// Mock pricing data
const pricingTiers = [
  {
    title: 'Single Course',
    price: '$97',
    period: 'one-time',
    description: 'Perfect for getting started with one course',
    features: [
      { text: 'Access to 1 course of your choice', included: true },
      { text: '12 comprehensive video lessons', included: true },
      { text: 'Interactive activities & exercises', included: true },
      { text: 'Final project & certification exam', included: true },
      { text: 'Course completion certificate', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Lifetime access to course content', included: true },
      { text: 'Email support', included: true },
    ],
    ctaText: 'Start Learning',
    ctaLink: '/register',
    featured: false,
  },
  {
    title: 'Full Bootcamp',
    price: '$497',
    period: 'one-time',
    description: 'Complete transformation with all 7 courses',
    features: [
      { text: 'All 7 courses included', included: true },
      { text: '84 comprehensive video lessons', included: true },
      { text: 'Interactive activities & exercises', included: true },
      { text: '7 final projects & certification exams', included: true },
      { text: '7 course completion certificates', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Lifetime access to all content', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Exclusive community events', included: true },
    ],
    ctaText: 'Join Bootcamp',
    ctaLink: '/register',
    featured: true,
  },
];


const HomePage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Camo Background */}
      <CamoBackground variant="subtle" className="fixed inset-0 z-0" />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left space-y-6 lg:space-y-8">
              {/* Main Heading */}
              <h1 className="font-headline font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                <span className="text-white">SoloSuccess</span>
                <br />
                <span className="text-hot-pink">Intel Academy</span>
              </h1>
              
              {/* Subheading */}
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                Bootcamp Training for Female Founders
              </p>
              
              {/* Description */}
              <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Master the art of entrepreneurship with military-style discipline and unapologetic feminine power. 
                Our comprehensive 7-course bootcamp gives you the strategic framework, tactical skills, and unwavering 
                confidence to build and scale your business successfully.
              </p>
              
              {/* Value Props */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="px-4 py-2 bg-hot-pink bg-opacity-20 rounded-full border border-hot-pink border-opacity-30">
                  <span className="text-white text-sm font-semibold">✓ Self-Paced Learning</span>
                </div>
                <div className="px-4 py-2 bg-success-teal bg-opacity-20 rounded-full border border-success-teal border-opacity-30">
                  <span className="text-white text-sm font-semibold">✓ Lifetime Access</span>
                </div>
                <div className="px-4 py-2 bg-purple-500 bg-opacity-20 rounded-full border border-purple-500 border-opacity-30">
                  <span className="text-white text-sm font-semibold">✓ Community Support</span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <GlassmorphicButton 
                    variant="primary" 
                    size="lg"
                    className="w-full sm:w-auto holographic-hover"
                  >
                    Start Your Journey
                  </GlassmorphicButton>
                </Link>
                
                <Link to="/login">
                  <GlassmorphicButton 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </GlassmorphicButton>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-hot-pink">7</div>
                  <div className="text-xs sm:text-sm text-gray-300">Courses</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-hot-pink">84</div>
                  <div className="text-xs sm:text-sm text-gray-300">Lessons</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-hot-pink">100%</div>
                  <div className="text-xs sm:text-sm text-gray-300">Badass</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Illustration Placeholder */}
            <div className="relative hidden lg:block">
              <div className="glassmorphic-elevated rounded-2xl p-8 aspect-square flex items-center justify-center">
                {/* Placeholder for Girl Boss Drill Sergeant Character */}
                <div className="text-center space-y-4">
                  <div className="w-64 h-64 mx-auto bg-gradient-to-br from-hot-pink to-success-teal rounded-full flex items-center justify-center">
                    <svg 
                      className="w-32 h-32 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                  <p className="text-white text-sm italic">
                    "Drop and give me 20... business strategies!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section - Course Overview */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold text-white mb-4">
              Your <span className="text-hot-pink">7-Course</span> Journey
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              A comprehensive curriculum designed to take you from foundation to mastery. 
              Each course builds on the last, giving you a complete business education.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-10 rounded-full backdrop-blur-sm">
              <svg className="w-5 h-5 text-hot-pink" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white text-sm font-semibold">84 Video Lessons • 7 Certifications • Lifetime Access</span>
            </div>
          </div>
          
          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-12 lg:mt-16">
            <p className="text-gray-300 mb-6">
              Ready to start your transformation?
            </p>
            <Link to="/register">
              <GlassmorphicButton 
                variant="primary" 
                size="lg"
                className="holographic-hover"
              >
                Enroll Now
              </GlassmorphicButton>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-black bg-opacity-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold text-white mb-4">
              Simple, <span className="text-hot-pink">Transparent</span> Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              One-time payment. Lifetime access. No subscriptions, no hidden fees. 
              Invest in yourself and your business today.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-success-teal bg-opacity-20 rounded-full backdrop-blur-sm border border-success-teal border-opacity-30">
              <svg className="w-5 h-5 text-success-teal" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white text-sm font-semibold">30-Day Money Back Guarantee</span>
            </div>
          </div>
          
          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {pricingTiers.map((tier, index) => (
              <div key={index} className="flex">
                <PricingCard {...tier} />
              </div>
            ))}
          </div>
          
          {/* Money Back Guarantee */}
          <div className="text-center mt-12 lg:mt-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white bg-opacity-10 rounded-full backdrop-blur-sm">
              <svg 
                className="w-6 h-6 text-success-teal" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
              <span className="text-white font-semibold">30-Day Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glassmorphic-elevated rounded-3xl p-8 sm:p-12 lg:p-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold text-white mb-6">
              Ready to Transform Your <span className="text-hot-pink">Business?</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join SoloSuccess Intel Academy today and get immediate access to our comprehensive bootcamp program. 
              Start building the business you've always dreamed of.
            </p>
            <Link to="/register">
              <GlassmorphicButton 
                variant="primary" 
                size="lg"
                className="holographic-hover shine-effect"
              >
                Start Your Journey Now
              </GlassmorphicButton>
            </Link>
            <p className="text-sm text-gray-400 mt-6">
              30-Day Money Back Guarantee • Lifetime Access • No Recurring Fees
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 SoloSuccess Intel Academy. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-hot-pink transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-hot-pink transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-hot-pink transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
