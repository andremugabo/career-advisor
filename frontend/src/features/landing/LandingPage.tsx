import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components';
import { Brain, CheckCircle2, Star, ChevronDown, Mail, Phone, MapPin, Search } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/dashboard');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (token) {
      setIsAuthenticated(true);
      if (role === 'Admin') setDashboardPath('/admin/dashboard');
      else if (role === 'Advisor') setDashboardPath('/students');
      else setDashboardPath('/dashboard');
    }
  }, []);

  const faqs = [
    {
      q: "What services do you offer?",
      a: "We offer a range of services including career assessment, resume writing, interview preparation, and personalized career coaching tailored to your individual needs."
    },
    {
      q: "How can I schedule an appointment?",
      a: "You can schedule an appointment by registering an account and booking a session directly through our student portal."
    },
    {
      q: "Do you offer online coaching?",
      a: "Yes! All of our career assessments and coaching sessions are available fully online."
    },
    {
      q: "How much does the program cost?",
      a: "We provide tiered guidance plans based on your academic level. Basic assessments are free for registered university students."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F1F1] font-inter text-slate-700 selection:bg-[#19A7CE] selection:text-white">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#146C94]">
            <Brain className="w-8 h-8 text-[#19A7CE]" />
            <span className="text-2xl font-bold font-outfit tracking-tight">Emmerence</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="text-[#146C94]">HOME</a>
            <a href="#services" className="hover:text-[#19A7CE] transition-colors">SERVICES</a>
            <a href="#resources" className="hover:text-[#19A7CE] transition-colors">RESOURCES</a>
            <a href="#about" className="hover:text-[#19A7CE] transition-colors">ABOUT US</a>
            <a href="#contact" className="hover:text-[#19A7CE] transition-colors">CONTACT US</a>
          </nav>
          
          <div>
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 rounded-md shadow-md">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 rounded-md shadow-md">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section className="relative bg-[#AFD3E2]/20 overflow-hidden border-b border-[#AFD3E2]/30 pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Abstract decorative circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full opacity-40 blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#19A7CE]/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-[#146C94] font-semibold tracking-wider text-sm uppercase bg-white/50 px-4 py-2 rounded-full border border-[#19A7CE]/20 backdrop-blur-sm">
            <Search className="w-4 h-4 text-[#19A7CE]" />
            Your Future Starts Here
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold font-outfit text-[#146C94] mb-6 max-w-4xl leading-tight">
            Guidance for Success
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            Unlock your potential with our comprehensive career counseling services. We use advanced AI to align your academic skills with real-world opportunities.
          </p>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button className="bg-[#19A7CE] hover:bg-[#146C94] text-white px-10 py-4 text-lg rounded-md shadow-xl shadow-[#19A7CE]/20">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button className="bg-[#19A7CE] hover:bg-[#146C94] text-white px-10 py-4 text-lg rounded-md shadow-xl shadow-[#19A7CE]/20">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 3. Alternating Feature 1 */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold font-outfit text-[#146C94] mb-6 leading-tight">
              Unlock Your Full Potential with Career Counseling
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              Our career counseling platform is dedicated to helping individuals discover their true potential and achieve their professional goals. Our mission is providing comprehensive guidance and resources to support your career development journey.
            </p>
            <div className="flex gap-4">
              <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 rounded-md shadow-md">Learn More</Button>
              {isAuthenticated ? (
                <Link to={dashboardPath}>
                  <Button variant="secondary" className="border-none text-[#19A7CE] hover:bg-[#AFD3E2]/10 px-8 rounded-md">View Dashboard</Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="secondary" className="border-none text-[#19A7CE] hover:bg-[#AFD3E2]/10 px-8 rounded-md">Sign Up</Button>
                </Link>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#AFD3E2]/20 translate-x-4 translate-y-4 rounded-xl -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" 
              alt="Hand writing POSSIBLE on chalkboard" 
              className="rounded-xl shadow-2xl object-cover h-[400px] w-full"
            />
          </div>
        </div>
      </section>

      {/* 4. Alternating Feature 2 */}
      <section className="py-24 bg-[#F8F1F1]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-[#19A7CE]/10 -translate-x-4 -translate-y-4 rounded-xl -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop" 
              alt="Career assessment analytics" 
              className="rounded-xl shadow-2xl object-cover h-[400px] w-full"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold font-outfit text-[#146C94] mb-6 leading-tight">
              Discover Your True Potential with Our Career Assessment and Resume Writing Services
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              A clear career strategy needs solid data. We offer comprehensive career tests to help you discover your optimal path and build a compelling professional identity.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-6 h-6 text-[#19A7CE]" /> Career Assessment
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-6 h-6 text-[#19A7CE]" /> Resume Writing
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-6 h-6 text-[#19A7CE]" /> Interview Preparation
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Insights / Blog */}
      <section id="resources" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-outfit text-[#146C94] mb-4">Discover Career Insights Today</h2>
            <p className="text-slate-600 text-lg">Stay updated with our latest career advice and industry insights</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop" alt="Coaching" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="text-xs font-bold text-[#146C94] bg-[#AFD3E2]/30 px-2 py-1 rounded">Coaching</span>
                  <span className="text-xs text-slate-400 py-1">10 min read</span>
                </div>
                <h3 className="text-xl font-bold text-[#146C94] mb-3 leading-snug">Unlock Your Potential with Career Coaching</h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-2">Discover the benefits of career coaching and how it can accelerate your success.</p>
                <a href="#" className="text-[#19A7CE] font-semibold text-sm hover:text-[#146C94] flex items-center gap-1">Read More &rarr;</a>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop" alt="Resume" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="text-xs font-bold text-[#146C94] bg-[#AFD3E2]/30 px-2 py-1 rounded">Tips</span>
                  <span className="text-xs text-slate-400 py-1">5 min read</span>
                </div>
                <h3 className="text-xl font-bold text-[#146C94] mb-3 leading-snug">Crafting the Perfect Resume</h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-2">Learn how to write a resume that highlights your skills and stands out to employers.</p>
                <a href="#" className="text-[#19A7CE] font-semibold text-sm hover:text-[#146C94] flex items-center gap-1">Read More &rarr;</a>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop" alt="Interview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="text-xs font-bold text-[#146C94] bg-[#AFD3E2]/30 px-2 py-1 rounded">Interview</span>
                  <span className="text-xs text-slate-400 py-1">8 min read</span>
                </div>
                <h3 className="text-xl font-bold text-[#146C94] mb-3 leading-snug">Mastering the Job Interview</h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-2">Best practices and tips to help you succeed in your next job interview.</p>
                <a href="#" className="text-[#19A7CE] font-semibold text-sm hover:text-[#146C94] flex items-center gap-1">Read More &rarr;</a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="secondary" className="border border-[#146C94] text-[#146C94] hover:bg-[#146C94] hover:text-white px-8 transition-colors rounded-md">View All</Button>
          </div>
        </div>
      </section>

      {/* 6. Happy Clients (Testimonials) */}
      <section className="py-24 bg-[#F8F1F1]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-bold font-outfit text-[#146C94] mb-4">Happy Clients</h2>
            <p className="text-slate-600 text-lg">Read what our clients have to say about us</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium text-lg mb-8 italic">"Their career counseling services helped me find my dream job."</p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?img=32" alt="Client" className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-[#146C94]">Alice Lee</h4>
                  <p className="text-xs text-slate-500">Marketing Manager, ABC Company</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium text-lg mb-8 italic">"I highly recommend their career coaching program."</p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?img=11" alt="Client" className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-[#146C94]">David Smith</h4>
                  <p className="text-xs text-slate-500">Software Engineer, Tech Inc.</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 font-medium text-lg mb-8 italic">"Their resume writing services helped me land multiple job offers."</p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?img=47" alt="Client" className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-[#146C94]">Sarah Johnson</h4>
                  <p className="text-xs text-slate-500">Sales Representative, Global Corp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="bg-[#AFD3E2] py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-[#146C94] mb-2 max-w-xl">
              Unlock Your Career Potential Today
            </h2>
            <p className="text-[#146C94]/80">Discover the path to your dream career with our comprehensive career counseling services.</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Button className="bg-[#146C94] hover:bg-slate-800 text-white px-8 rounded-md shadow-md border-none">Book</Button>
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button className="bg-white hover:bg-slate-100 text-[#146C94] px-8 rounded-md shadow-md border-none">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button className="bg-white hover:bg-slate-100 text-[#146C94] px-8 rounded-md shadow-md border-none">Sign Up</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 8. FAQs Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[1fr_2fr] gap-16">
          <div>
            <h2 className="text-4xl font-bold font-outfit text-[#146C94] mb-6">FAQs</h2>
            <p className="text-slate-600 mb-8">Find answers to common questions about our career counseling services.</p>
            <Button className="bg-[#19A7CE] hover:bg-[#146C94] text-white px-8 rounded-md shadow-md border-none">Contact</Button>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-[#146C94] pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#19A7CE] transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="p-6 pt-0 text-slate-600 border-t border-slate-100 mt-2 bg-slate-50">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter Section */}
      <section className="bg-[#AFD3E2]/50 py-16 border-y border-[#AFD3E2]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-start gap-4">
          <h2 className="text-3xl font-bold font-outfit text-[#146C94]">Join Our Newsletter for Updates</h2>
          <p className="text-[#146C94]/80 mb-2">Stay informed with the latest career tips and industry insights.</p>
          
          <div className="flex w-full max-w-md gap-2">
            <input 
              type="email" 
              placeholder="Your email here" 
              className="flex-1 px-4 py-3 rounded-md border border-white focus:outline-none focus:border-[#19A7CE] focus:ring-1 focus:ring-[#19A7CE]"
            />
            <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-6 rounded-md shadow-md border-none shrink-0">Subscribe</Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">By subscribing, you agree to our Privacy Policy and Terms of Service.</p>
        </div>
      </section>

      {/* 10. Contact Info Pre-Footer */}
      <section className="py-16 bg-[#F8F1F1] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <Mail className="w-8 h-8 text-[#146C94] shrink-0" />
            <div>
              <h4 className="font-bold text-[#146C94] mb-1">Email</h4>
              <p className="text-sm text-slate-500 mb-2">Reach out to us via email for any inquiries.</p>
              <a href="mailto:hello@emmerence.com" className="text-[#19A7CE] text-sm font-semibold hover:underline">hello@emmerence.com</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <Phone className="w-8 h-8 text-[#146C94] shrink-0" />
            <div>
              <h4 className="font-bold text-[#146C94] mb-1">Phone</h4>
              <p className="text-sm text-slate-500 mb-2">Call us directly to speak with a representative.</p>
              <a href="tel:+250123456789" className="text-[#19A7CE] text-sm font-semibold hover:underline">+250 (123) 456-789</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <MapPin className="w-8 h-8 text-[#146C94] shrink-0" />
            <div>
              <h4 className="font-bold text-[#146C94] mb-1">Office</h4>
              <p className="text-sm text-slate-500 mb-2">Visit our headquarters for in-person consultations.</p>
              <p className="text-[#19A7CE] text-sm font-semibold">Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-[#F8F1F1] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 flex flex-col gap-6">
              <div className="flex items-center gap-2 text-[#146C94]">
                <Brain className="w-8 h-8 text-[#19A7CE]" />
                <span className="text-2xl font-bold font-outfit tracking-tight">Emmerence</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">Empowering the next generation of professionals through AI-driven career guidance and insights.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-[#146C94] mb-4">Services</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-[#19A7CE]">Career Assessment</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Resume Writing</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Interview Preparation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[#146C94] mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-[#19A7CE]">Guides</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Workshops</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Templates</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#146C94] mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-[#19A7CE]">About Us</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Our Team</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Careers</a></li>
                <li><a href="#" className="hover:text-[#19A7CE]">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; 2026 Emmerence AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#19A7CE]">Privacy Policy</a>
              <a href="#" className="hover:text-[#19A7CE]">Terms of Service</a>
              <a href="#" className="hover:text-[#19A7CE]">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
