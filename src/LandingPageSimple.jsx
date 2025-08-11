import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from './components/LoginForm';
import { 
  TrendingUp, 
  Brain, 
  Shield, 
  Zap, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPageSimple = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');

  const handleOpenLogin = (mode = 'login') => {
    setLoginMode(mode);
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {showLogin && <LoginForm mode={loginMode} onClose={handleCloseLogin} />}
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            FinanceAI ⚡
          </span>
          <div className="flex gap-4">
            <button
              onClick={() => handleOpenLogin('login')}
              className="text-white/80 hover:text-white px-4 py-2"
            >
              Login
            </button>
            <button
              onClick={() => handleOpenLogin('signup')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-full font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="text-center text-white max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-8"
          >
            Your AI-Powered{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Financial Future
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
          >
            Harness the power of advanced AI to make smarter financial decisions, 
            optimize your investments, and achieve your financial goals faster than ever before.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => handleOpenLogin('signup')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-white/80">
              Everything you need for smart financial management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Brain className="w-12 h-12" />, title: "AI Financial Advisor", desc: "Get personalized financial advice powered by advanced AI" },
              { icon: <TrendingUp className="w-12 h-12" />, title: "Smart Analytics", desc: "Real-time insights and portfolio optimization" },
              { icon: <Shield className="w-12 h-12" />, title: "Bank-Level Security", desc: "Your data is protected with enterprise-grade security" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center"
              >
                <div className="text-cyan-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-500 to-purple-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users transforming their financial future with AI
          </p>
          <button
            onClick={() => handleOpenLogin('signup')}
            className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPageSimple;
