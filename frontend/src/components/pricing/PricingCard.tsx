import { Link } from 'react-router-dom';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  featured?: boolean;
  ctaText: string;
  ctaLink: string;
}

const PricingCard = ({
  title,
  price,
  period,
  description,
  features,
  featured = false,
  ctaText,
  ctaLink,
}: PricingCardProps) => {
  return (
    <GlassmorphicCard
      variant={featured ? 'elevated' : 'default'}
      holographicBorder={featured}
      className={`h-full flex flex-col ${featured ? 'scale-105 lg:scale-110' : ''}`}
    >
      <div className="p-6 sm:p-8 flex flex-col h-full">
        {/* Featured Badge */}
        {featured && (
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-gradient-to-r from-hot-pink to-success-teal text-white text-xs font-bold rounded-full uppercase tracking-wide">
              Most Popular
            </span>
          </div>
        )}
        
        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-headline font-bold text-white mb-2">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-300 text-sm mb-6">
          {description}
        </p>
        
        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold text-hot-pink">
              {price}
            </span>
            <span className="text-gray-400 text-lg">
              /{period}
            </span>
          </div>
        </div>
        
        {/* Features List */}
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <svg 
                  className="w-5 h-5 text-success-teal flex-shrink-0 mt-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              ) : (
                <svg 
                  className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              )}
              <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        
        {/* CTA Button */}
        <Link to={ctaLink} className="block">
          <GlassmorphicButton
            variant={featured ? 'primary' : 'outline'}
            size="lg"
            className={`w-full ${featured ? 'holographic-hover shine-effect' : ''}`}
          >
            {ctaText}
          </GlassmorphicButton>
        </Link>
      </div>
    </GlassmorphicCard>
  );
};

export default PricingCard;
