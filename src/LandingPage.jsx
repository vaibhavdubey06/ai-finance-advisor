import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import LoginForm from './components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Brain, 
  Shield, 
  Zap, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  PieChart,
  BarChart3,
  Calculator,
  Target
} from 'lucide-react';
import { Button } from "./components/Button";
import { Card, CardContent } from "./components/Card";
import heroImage from "./assets/hero.jpg";
import dashboardImage from "./assets/dashboard.jpg";

// Statistics Component
const StatsSection = () => {
  const stats = [
    { number: "50K+", label: "Active Users", icon: <Users className="w-8 h-8" /> },
    { number: "$2B+", label: "Assets Managed", icon: <TrendingUp className="w-8 h-8" /> },
    { number: "99.9%", label: "Uptime", icon: <Shield className="w-8 h-8" /> },
    { number: "24/7", label: "AI Support", icon: <Brain className="w-8 h-8" /> }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-white/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4 text-cyan-500">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Manager',
    content: 'This AI financial advisor has completely transformed how I manage my investments. The insights are incredibly accurate and actionable.',
    rating: 5,
    avatar: '👩‍💼'
  },
  {
    name: 'David Rodriguez',
    role: 'Small Business Owner',
    content: 'Finally, a financial solution that understands my business needs. The AI recommendations have helped optimize my cash flow by 40%.',
    rating: 5,
    avatar: '👨‍💼'
  },
  {
    name: 'Emily Johnson',
    role: 'Freelancer',
    content: 'The personalized financial planning has been a game-changer. I\'ve saved more in 6 months than I did in the previous 2 years.',
    rating: 5,
    avatar: '👩‍💻'
  }
];

const features = [
  {
    icon: <PieChart className="w-12 h-12 text-cyan-500" />,
    title: 'Smart Portfolio Analysis',
    description: 'AI-powered analysis of your investment portfolio with real-time optimization suggestions and risk assessment.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: <Brain className="w-12 h-12 text-purple-500" />,
    title: 'Intelligent Financial Advisor',
    description: 'Get personalized financial advice from our advanced AI that learns from your spending patterns and goals.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: <Target className="w-12 h-12 text-green-500" />,
    title: 'Goal-Based Planning',
    description: 'Set and track financial goals with AI-powered recommendations for retirement, home buying, and more.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: <Shield className="w-12 h-12 text-orange-500" />,
    title: 'Bank-Level Security',
    description: 'Your financial data is protected with enterprise-grade encryption and security protocols.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: <Zap className="w-12 h-12 text-yellow-500" />,
    title: 'Real-Time Insights',
    description: 'Get instant notifications and insights about market changes that affect your investments.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: <Calculator className="w-12 h-12 text-indigo-500" />,
    title: 'Automated Calculations',
    description: 'Complex financial calculations made simple with automated tax planning and expense tracking.',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handler to open login/signup modal
  const handleOpenLogin = (mode = 'login') => {
    setLoginMode(mode);
    setShowLogin(true);
  };

  // Handler to close modal
  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Login/Signup Modal */}
      {showLogin && <LoginForm mode={loginMode} onClose={handleCloseLogin} />}
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
          >
            FinanceAI ⚡
          </motion.span>
          <div className="hidden md:flex gap-8 items-center">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              href="#" 
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              href="#features" 
              className="text-white/80 hover:text-white transition-colors"
            >
              Features
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenLogin('login')}
              className="text-white/80 hover:text-white transition-colors"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenLogin('signup')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </motion.button>
          </div>
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className="block w-full h-0.5 bg-white"></span>
              <span className="block w-full h-0.5 bg-white"></span>
              <span className="block w-full h-0.5 bg-white"></span>
            </div>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/50 backdrop-blur-md border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#" className="block text-white/80 hover:text-white">Home</a>
              <a href="#features" className="block text-white/80 hover:text-white">Features</a>
              <a href="#pricing" className="block text-white/80 hover:text-white">Pricing</a>
              <button 
                onClick={() => { setIsMenuOpen(false); handleOpenLogin('login'); }}
                className="block text-white/80 hover:text-white"
              >
                Login
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); handleOpenLogin('signup'); }}
                className="block w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-full font-medium text-left"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section with CSS Animations */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
        </div>
        
        {/* CSS-based animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-8"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your AI-Powered{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Financial Future
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/80 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Harness the power of advanced AI to make smarter financial decisions, optimize your investments, and achieve your financial goals faster than ever before.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenLogin('signup')}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                Watch Demo
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-4 text-sm text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>14-day free trial</span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10">
              <motion.img 
                src={heroImage} 
                alt="AI Financial Dashboard" 
                className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl border border-white/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Floating Cards */}
              <motion.div
                className="absolute -top-4 -left-4 bg-gradient-to-r from-green-400 to-cyan-400 p-4 rounded-xl shadow-xl text-white"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-6 h-6 mb-2" />
                <div className="text-sm font-bold">+24.5%</div>
                <div className="text-xs opacity-80">Portfolio Growth</div>
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -right-4 bg-gradient-to-r from-purple-400 to-pink-400 p-4 rounded-xl shadow-xl text-white"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Brain className="w-6 h-6 mb-2" />
                <div className="text-sm font-bold">AI Insights</div>
                <div className="text-xs opacity-80">Real-time Analysis</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Powerful AI-Driven{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience the future of financial management with our cutting-edge AI technology
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full hover:bg-white/20 transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Interactive Dashboard Showcase */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Experience Financial{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              See how our AI transforms complex financial data into actionable insights
            </p>
          </motion.div>
          
          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Real-time Analytics Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <BarChart3 className="w-12 h-12 text-cyan-400" />
                  <div className="text-right">
                    <div className="text-sm text-cyan-300">Live Analytics</div>
                    <motion.div 
                      className="text-2xl font-bold text-white"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      $47,329
                    </motion.div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Portfolio Tracking</h3>
                <p className="text-white/70 mb-4">Monitor your investments with live updates and instant notifications</p>
                
                {/* Mini chart simulation */}
                <div className="flex items-end gap-1 h-16">
                  {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                    <motion.div
                      key={i}
                      className="bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t flex-1"
                      style={{ height: `${height}%` }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI Insights Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-400/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Brain className="w-12 h-12 text-purple-400" />
                  <motion.div 
                    className="w-3 h-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Insights</h3>
                <p className="text-white/70 mb-6">Get personalized recommendations based on your financial goals</p>
                
                {/* AI recommendation simulation */}
                <div className="space-y-3">
                  <motion.div 
                    className="bg-white/10 rounded-lg p-3 border-l-4 border-green-400"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-sm text-green-300 font-medium">💡 Recommendation</div>
                    <div className="text-white text-sm">Consider increasing your emergency fund by 15%</div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 rounded-lg p-3 border-l-4 border-blue-400"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="text-sm text-blue-300 font-medium">📊 Analysis</div>
                    <div className="text-white text-sm">Your diversification score improved by 23%</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Security & Performance Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-400/30 rounded-2xl p-8 relative overflow-hidden md:col-span-2 lg:col-span-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Shield className="w-12 h-12 text-green-400" />
                  <div className="text-right">
                    <div className="text-sm text-green-300">Security Score</div>
                    <div className="text-2xl font-bold text-white">99.9%</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
                <p className="text-white/70 mb-6">Bank-level encryption with advanced fraud protection</p>
                
                {/* Security features */}
                <div className="space-y-2">
                  {[
                    { label: "256-bit Encryption", status: "active" },
                    { label: "Multi-factor Auth", status: "active" },
                    { label: "Fraud Detection", status: "monitoring" }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center justify-between text-sm"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <span className="text-white/80">{feature.label}</span>
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className={`w-2 h-2 rounded-full ${feature.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                        <span className="text-green-300 text-xs">{feature.status === 'active' ? 'Active' : 'Monitoring'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { label: "Processing Speed", value: "< 100ms", icon: "⚡" },
              { label: "Accuracy Rate", value: "99.8%", icon: "🎯" },
              { label: "Data Points", value: "50M+", icon: "📊" },
              { label: "Uptime", value: "99.99%", icon: "🔄" }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-white/60 text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-xl text-white/80">
              See what our users say about their financial transformation
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8"
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 mb-6 text-lg italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-white/60">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already taken control of their finances with our AI-powered platform.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenLogin('signup')}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              Start Your Free Trial Today
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                FinanceAI ⚡
              </div>
              <p className="text-white/70 mb-4">
                Your intelligent financial companion powered by cutting-edge AI technology.
              </p>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center cursor-pointer">
                  <span>📱</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center cursor-pointer">
                  <span>💼</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center cursor-pointer">
                  <span>🐦</span>
                </motion.div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><motion.a whileHover={{ x: 5 }} href="#features" className="hover:text-cyan-400 transition-colors">Features</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Security</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">API</motion.a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">About</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Blog</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Careers</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Contact</motion.a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-white/70">
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Documentation</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Help Center</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Privacy</motion.a></li>
                <li><motion.a whileHover={{ x: 5 }} href="#" className="hover:text-cyan-400 transition-colors">Terms</motion.a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/60">
            <p>&copy; {new Date().getFullYear()} FinanceAI. All rights reserved. Built with ❤️ and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 