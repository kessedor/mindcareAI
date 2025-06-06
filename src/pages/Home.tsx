import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Shield, Clock, Users, Star, ArrowRight, Heart, MessageCircle, BookOpen } from 'lucide-react';
import Button from '../components/Button';

const Home: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Support',
      description: 'Get personalized mental health guidance with our advanced AI assistant.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your mental health data is encrypted and completely private.',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access support whenever you need it, day or night.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with others on similar journeys in a safe environment.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Healthcare Professional',
      content: 'MindCareAI has transformed how I approach mental wellness. The AI insights are remarkably accurate and helpful.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Student',
      content: 'The mood tracking feature helped me identify patterns I never noticed. It\'s like having a therapist in my pocket.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Working Professional',
      content: 'The journaling prompts and AI feedback have been incredible for my personal growth and stress management.',
      rating: 5,
    },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-16 pb-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-neutral-900 mb-6 animate-fade-in">
              Your Mental Health,{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Experience personalized mental health support with AI-powered insights, mood tracking, and professional guidance. 
              Take the first step towards better mental wellness today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Button size="lg" className="min-w-[200px]">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 hidden lg:block animate-float">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <div className="absolute top-32 right-10 hidden lg:block animate-float" style={{ animationDelay: '2s' }}>
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <MessageCircle className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="absolute bottom-20 left-20 hidden lg:block animate-float" style={{ animationDelay: '4s' }}>
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
              Comprehensive Mental Health Care
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with evidence-based therapeutic approaches
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 bg-white rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              See how MindCareAI is making a difference in people's mental health journeys
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div className="border-t border-neutral-200 pt-4">
                  <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Transform Your Mental Health?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of users who have already started their journey to better mental wellness with MindCareAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 min-w-[200px]">
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 min-w-[200px]">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;