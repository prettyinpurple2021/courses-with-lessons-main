
export interface CourseContent {
    id: string;
    courseNumber: number;
    title: string;
    description: string;
    duration: string;
    lessonsCount: number;
    isLocked: boolean;
    syllabus: string[];
}

export const courses: CourseContent[] = [
    {
        id: '1',
        courseNumber: 1,
        title: 'Foundation & Mindset',
        description: 'Build the mental fortitude and foundational knowledge every successful entrepreneur needs. Master the basics of business strategy and develop an unshakeable mindset.',
        duration: '4 weeks',
        lessonsCount: 12,
        isLocked: false,
        syllabus: [
            'Understanding Entrepreneurship: What It Really Means to Be an Entrepreneur',
            'Business Planning Fundamentals: Creating Your First Business Plan',
            'Market Research and Analysis: Understanding Your Target Market',
            'Business Models and Revenue Streams: How Businesses Make Money',
            'Legal Foundations: Business Structures, Licenses, and Compliance',
            'Financial Basics: Understanding Revenue, Expenses, and Profit',
            'Brand Identity and Positioning: Building Your Business Brand',
            'Customer Discovery: Finding and Understanding Your Ideal Customer',
            'Value Proposition Development: What Makes Your Business Unique',
            'Goal Setting and Business Strategy: Creating Your Roadmap to Success',
            'Risk Management: Identifying and Mitigating Business Risks',
            'Launching Your Business: From Idea to First Customer',
        ]
    },
    {
        id: '2',
        courseNumber: 2,
        title: 'Market Intelligence',
        description: 'Learn to read your market like a tactical map. Understand your customers, competitors, and position yourself for dominance in your niche.',
        duration: '4 weeks',
        lessonsCount: 12,
        isLocked: false,
        syllabus: [
            'Marketing Fundamentals: Understanding the Marketing Mix and 4 Ps',
            'Target Audience Identification: Creating Detailed Customer Personas',
            'Brand Positioning and Messaging: Standing Out in a Crowded Market',
            'Content Marketing Strategy: Creating Valuable Content That Attracts Customers',
            'Social Media Marketing: Building Your Presence Across Platforms',
            'Email Marketing and Automation: Nurturing Leads into Customers',
            'SEO and Search Marketing: Getting Found Online',
            'Paid Advertising: Google Ads, Facebook Ads, and Beyond',
            'Marketing Analytics: Measuring What Matters',
            'Customer Acquisition Strategies: Growing Your Customer Base',
            'Conversion Optimization: Turning Visitors into Customers',
            'Marketing Funnels: Guiding Customers from Awareness to Purchase',
        ]
    },
    {
        id: '3',
        courseNumber: 3,
        title: 'Strategic Operations',
        description: 'Streamline your operations with military precision. Build systems that scale and processes that run like clockwork.',
        duration: '4 weeks',
        lessonsCount: 12,
        isLocked: false,
        syllabus: [
            'Financial Literacy Basics: Understanding Money in Business',
            'Reading Financial Statements: Income Statement, Balance Sheet, and Cash Flow',
            'Cash Flow Management: Keeping Your Business Solvent',
            'Budgeting and Forecasting: Planning Your Financial Future',
            'Pricing Strategies: How to Price Your Products and Services',
            'Profit and Loss Analysis: Understanding Your Bottom Line',
            'Tax Basics for Business Owners: What You Need to Know',
            'Financial Ratios and KPIs: Measuring Business Health',
            'Funding Options: Bootstrapping, Loans, and Investment',
            'Bookkeeping Essentials: Tracking Your Business Finances',
            'Break-Even Analysis: Knowing When Your Business Becomes Profitable',
            'Financial Planning for Growth: Scaling Your Business Financially',
        ]
    },
    {
        id: '4',
        courseNumber: 4,
        title: 'Financial Command',
        description: 'Take control of your finances with confidence. Master budgeting, forecasting, and financial strategy to fuel sustainable growth.',
        duration: '4 weeks',
        lessonsCount: 12,
        isLocked: false,
        syllabus: [
            'Sales Psychology: Understanding Buyer Behavior and Decision-Making',
            'The Sales Process: From Prospecting to Closing',
            'Building Rapport and Trust: The Foundation of Successful Sales',
            'Handling Objections: Turning "No" into "Yes"',
            'Sales Presentations and Pitching: Communicating Value Effectively',
            'Closing Techniques: Sealing the Deal',
            'Customer Relationship Management: Building Long-Term Relationships',
            'Upselling and Cross-Selling: Maximizing Customer Value',
            'Sales Funnels: Optimizing Your Conversion Process',
            'Lead Qualification: Identifying Your Best Prospects',
            'Follow-Up Strategies: Nurturing Leads Through the Sales Cycle',
            'Sales Metrics and Performance: Measuring Sales Success',
        ]
    },
    {
        id: '5',
        courseNumber: 5,
        title: 'Marketing Warfare',
        description: 'Deploy marketing strategies that capture attention and convert. Learn to position your brand and dominate your market space.',
        duration: '4 weeks',
        lessonsCount: 12,
        isLocked: false,
        syllabus: [
            'The Automate-First Mindset: Building Systems Instead of Doing Tasks',
            'Process Mapping: Documenting Your Business Operations',
            'Operations Hub: Creating Your Single Source of Truth',
            'Automation Tools: Mastering Zapier, Make, and Workflow Automation',
            'Lead Funnel Automation: Capturing and Nurturing Leads Automatically',
            'Client Onboarding Automation: Delivering White-Glove Experiences',
            'Project and Task Management: Automating Your Workflow',
            'Email Automation: Advanced Sequences and Nurture Campaigns',
            'Content Distribution Automation: Maximizing Your Content Reach',
            'Advanced Automation: Webhooks, Filters, and Conditional Logic',
            'Business Dashboards: Monitoring Your Operations at a Glance',
            'Testing, Debugging, and Maintaining Your Systems',
        ]
    },
    {
        id: '6',
        courseNumber: 6,
        title: 'Sales Mastery',
        description: 'Close deals with confidence and authenticity. Develop a sales process that feels natural and drives consistent revenue.',
        duration: '4 weeks',
        lessonsCount: 12,
        isLocked: false,
        syllabus: [
            'Leadership Foundations: Understanding Leadership vs. Management',
            'Leadership Styles: Finding Your Authentic Leadership Approach',
            'Building High-Performing Teams: Recruitment and Team Assembly',
            'Communication Skills: Effective Leadership Communication',
            'Delegation and Empowerment: Trusting Your Team',
            'Conflict Resolution: Managing Disagreements Constructively',
            'Employee Engagement: Motivating and Inspiring Your Team',
            'Performance Management: Setting Expectations and Providing Feedback',
            'Creating a Positive Team Culture: Values, Vision, and Environment',
            'Change Management: Leading Through Transitions',
            'Mentorship and Development: Growing Your Team Members',
            'Building Resilience: Leading Through Challenges and Setbacks',
        ]
    },
    {
        id: '7',
        courseNumber: 7,
        title: 'Leadership & Scale',
        description: 'Step into your role as a leader. Build teams, delegate effectively, and scale your business beyond your wildest dreams.',
        duration: '4 weeks',
        lessonsCount: 12,
        isLocked: false,
        syllabus: [
            'Growth Strategies: Understanding Different Paths to Scale',
            'Market Expansion: Growing Beyond Your Initial Market',
            'Product and Service Diversification: Expanding Your Offerings',
            'Strategic Partnerships: Leveraging Relationships for Growth',
            'Scaling Operations: Building Systems That Scale',
            'Technology and Automation for Growth: Tools That Enable Scale',
            'Customer Acquisition at Scale: Growing Your Customer Base Efficiently',
            'Financial Management for Growth: Funding and Managing Expansion',
            'Building a Scalable Team: Hiring and Managing for Growth',
            'Brand Expansion: Growing Your Brand Presence',
            'Innovation and Competitive Advantage: Staying Ahead',
            'Exit Strategies: Planning for the Future of Your Business',
        ]
    },
];
