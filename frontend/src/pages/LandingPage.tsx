import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Target, 
  Globe, 
  Menu, 
  X, 
  ChevronRight, 
  Lock,
  PieChart,
  Rocket,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { logger } from '../utils/logger';

// High-Tech Matrix Background (Updated with Shield Background)
const TechBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Deep Space Base with Shield's Gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-950/90"></div>
    
    {/* Grid Pattern from Shield */}
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
    
    {/* Scanning Light Effect from Shield */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-[20%] w-full scan-line"></div>

    {/* Matrix Grid System */}
    <div className="absolute inset-0 opacity-20" 
         style={{ 
           backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
           backgroundSize: '40px 40px',
           transform: 'perspective(500px) rotateX(20deg)',
           transformOrigin: 'top center'
         }}>
    </div>

    {/* Digital Circuit Lines */}
    <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-1/4 -left-10 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="absolute bottom-1/3 -right-10 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-[1px] h-[30%] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
    </div>

    {/* Ambient Glows */}
    <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
    </div>
</div>
);

// Feature Card Component - High Tech Version
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="tech-border p-6 bg-slate-900/50 backdrop-blur-sm group hover:bg-slate-900/80 transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className="w-12 h-12 rounded bg-cyan-950/30 flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300">
          <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-white mb-2 tracking-wide group-hover:text-cyan-400 transition-colors">{title}</h3>
          <p className="font-body text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
        </div>
      </div>
  </div>
);

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-50 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      <TechBackground />

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-slate-950/90 backdrop-blur-md py-3 shadow-lg shadow-cyan-500/5' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-slate-900 border border-cyan-500/30 rounded">
              <Shield className="w-5 h-5 text-cyan-400" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl tracking-wide text-white leading-none">SOLOSUCCESS</span>
              <span className="font-heading text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase">Intel Academy</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-body font-medium text-sm tracking-wide text-slate-300">
            <a href="#" className="hover:text-cyan-400 transition-colors">Curriculum</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Intelligence</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">About</a>
            <Link to="/register">
                <button className="relative group overflow-hidden px-6 py-2.5 rounded bg-cyan-950/30 border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-black transition-all duration-300">
                <span className="relative z-10">Initialize Learning</span>
                <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-cyan-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-cyan-500/20 p-6 flex flex-col gap-4 font-body">
            <a href="#" className="text-slate-300 hover:text-cyan-400">Curriculum</a>
            <a href="#" className="text-slate-300 hover:text-cyan-400">Intelligence</a>
            <a href="#" className="text-slate-300 hover:text-cyan-400">About</a>
            <Link to="/register" className="bg-cyan-600/20 border border-cyan-500 text-cyan-400 w-full py-3 rounded font-semibold text-center">Initialize Learning</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-24 z-10">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Content */}
          <div className="space-y-8 relative">
            {/* Decorative Tech Line */}
            <div className="absolute -left-6 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent hidden lg:block"></div>

            <div className="inline-flex items-center gap-3 px-3 py-1 bg-cyan-950/30 border border-cyan-500/30 rounded text-cyan-400 text-xs font-mono tracking-wider">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
              SYSTEM STATUS: ONLINE // V.2.0
            </div>

            <h1 className="font-heading text-4xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              MASTER THE FUTURE OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-glow">
                BUSINESS INTELLIGENCE
              </span>
            </h1>
            
            <p className="font-body text-slate-400 text-lg lg:text-xl max-w-xl leading-relaxed border-l-2 border-cyan-500/20 pl-6">
              Elite education for the digital age. Integrate AI protocols, optimize operational architecture, and scale your enterprise with military-grade precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded flex items-center justify-center gap-2 font-heading font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] w-full sm:w-auto">
                    <Zap className="w-5 h-5 fill-current" />
                    Start Operation
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <Link to="/login">
                <button className="px-8 py-4 bg-transparent border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white rounded flex items-center justify-center gap-2 font-heading font-semibold transition-all hover:bg-cyan-950/20 w-full sm:w-auto">
                    <Layers className="w-5 h-5" />
                    System Modules
                </button>
              </Link>
            </div>
          </div>

          {/* Hero Visual - Logo */}
          <div className="relative flex justify-center items-center h-[400px] lg:h-[500px] perspective-1000">
             
             {/* Base Hologram Platform */}
             <div className="absolute bottom-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl transform rotate-x-60"></div>
             
             {/* Rotating Rings */}
             <div className="absolute w-[380px] h-[380px] border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite]">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
             </div>
             <div className="absolute w-[300px] h-[300px] border border-blue-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse] border-dashed"></div>

             {/* Logo */}
             <div className="relative z-10 animate-[float_5s_ease-in-out_infinite]">
                <div className="relative w-64 h-80 flex items-center justify-center">
                   <img 
                     src="/logo.jpg" 
                     alt="SoloSuccess Intel Academy Logo" 
                     className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                     onError={(e) => {
                       logger.error('Failed to load logo');
                       e.currentTarget.style.display = 'none';
                     }}
                   />
                </div>

                {/* Floating Data Points around Logo */}
                <div className="absolute -right-8 top-10 p-2 bg-slate-900/80 border border-cyan-500/30 rounded text-[10px] text-cyan-300 font-mono animate-pulse">
                   Processing...
                </div>
                <div className="absolute -left-8 bottom-20 p-2 bg-slate-900/80 border border-blue-500/30 rounded text-[10px] text-blue-300 font-mono">
                   Data: Secure
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Features / Capabilities - High Tech Cards */}
      <section className="relative py-24 z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              TACTICAL <span className="text-cyan-400 text-glow">CAPABILITIES</span>
            </h2>
            <p className="font-body text-slate-400 text-lg max-w-2xl mx-auto">
              Equip your organization with the tools needed to dominate the digital landscape through intelligent automation and strategic foresight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards with Tech Borders */}
            <FeatureCard 
              icon={<Layers className="w-6 h-6" />}
              title="Central Command"
              desc="A unified dashboard for managing all your AI operations and workflows."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6" />}
              title="Fortress Security"
              desc="Bank-grade encryption and compliance standards for your data."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Rapid Integration"
              desc="Deploy solutions into your existing stack in under 60 seconds."
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6" />}
              title="Precision Targeting"
              desc="Align AI agents with specific business KPIs for measurable results."
            />
            <FeatureCard 
              icon={<PieChart className="w-6 h-6" />}
              title="Market Intelligence"
              desc="Real-time data streams to keep you ahead of the curve."
            />
            <FeatureCard 
              icon={<Rocket className="w-6 h-6" />}
              title="Scalable Architecture"
              desc="Designed to grow from startup to enterprise seamlessy."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black border-t border-cyan-900/30 pt-16 pb-8 z-10">
         <div className="container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
             <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center rounded">
                    <Shield className="w-3 h-3 text-cyan-400" />
                 </div>
                 <span className="font-heading font-bold text-white text-lg tracking-wider">SOLOSUCCESS</span>
               </div>
               <p className="font-body text-slate-400 text-sm leading-relaxed max-w-xs">
                 Empowering the next generation of business leaders with cutting-edge AI education and tools.
               </p>
             </div>
             
             <div>
               <h4 className="font-heading text-white font-bold mb-4 tracking-wider text-sm uppercase">Platform</h4>
               <ul className="space-y-3 font-body text-slate-400 text-sm">
                 <li className="hover:text-cyan-400 cursor-pointer transition-colors">Features</li>
                 <li className="hover:text-cyan-400 cursor-pointer transition-colors">Pricing</li>
                 <li className="hover:text-cyan-400 cursor-pointer transition-colors">Enterprise</li>
               </ul>
             </div>

             <div>
               <h4 className="font-heading text-white font-bold mb-4 tracking-wider text-sm uppercase">Company</h4>
               <ul className="space-y-3 font-body text-slate-400 text-sm">
                 <li className="hover:text-cyan-400 cursor-pointer transition-colors">About Us</li>
                 <li className="hover:text-cyan-400 cursor-pointer transition-colors">Insights Blog</li>
                 <Link to="/contact" className="hover:text-cyan-400 cursor-pointer transition-colors block">Contact</Link>
               </ul>
             </div>

             <div>
               <h4 className="font-heading text-white font-bold mb-4 tracking-wider text-sm uppercase">Legal</h4>
               <ul className="space-y-3 font-body text-slate-400 text-sm">
                 <Link to="/privacy" className="hover:text-cyan-400 cursor-pointer transition-colors block">Privacy Policy</Link>
                 <Link to="/terms" className="hover:text-cyan-400 cursor-pointer transition-colors block">Terms</Link>
               </ul>
             </div>
           </div>

           <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="font-body text-slate-600 text-xs">© 2024 SoloSuccess Intel Academy. All systems operational.</p>
             <div className="flex gap-6 text-slate-500">
               <Globe className="w-5 h-5 hover:text-cyan-400 cursor-pointer transition-colors" />
             </div>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
