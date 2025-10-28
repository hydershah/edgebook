import Link from 'next/link'
import { TrendingUp, Users, Brain, Shield, CheckCircle2, Target, Star, Lock, MessageSquare, LineChart, Zap, ArrowRight, Award } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Trusted by thousands of sports bettors</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Sports Betting<br />
              <span className="text-white/90">Made Social</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-white/80 max-w-3xl mx-auto leading-relaxed">
              Follow proven bettors, share your picks, and make smarter decisions with data-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/auth/signup" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg">
                Start Free Today
              </Link>
              <Link href="/feed" className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg border-2 border-white/30 hover:border-white/50 backdrop-blur-sm">
                Browse Picks
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-300" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-300" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-300" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need in one place
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Built for bettors who take their game seriously
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="text-white" size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Follow Top Bettors</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with proven winners and see their picks in real-time. Filter by sport, track record, and betting style.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <LineChart className="text-white" size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Performance</h3>
              <p className="text-gray-600 leading-relaxed">
                Every pick is verified and tracked. View detailed stats, ROI, units won, and historical performance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Star className="text-white" size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Share Your Picks</h3>
              <p className="text-gray-600 leading-relaxed">
                Build your reputation and monetize your expertise. Set confidence levels and offer premium picks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Brain className="text-white" size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant matchup analysis and betting recommendations. Ask questions and receive data-backed answers.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="text-white" size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Purchase premium picks with confidence. Powered by Stripe with transparent pricing and instant access.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="text-white" size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Driven</h3>
              <p className="text-gray-600 leading-relaxed">
                Engage with a community of serious bettors. Share strategies, discuss picks, and learn together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Start making smarter bets in three simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform -translate-y-1/2"></div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
              <div className="relative bg-white">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white font-bold text-3xl">1</span>
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-20 blur"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Account</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Sign up free in 30 seconds. No credit card needed. Start following top bettors instantly.
                  </p>
                </div>
              </div>

              <div className="relative bg-white">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white font-bold text-3xl">2</span>
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-20 blur"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Find Your Edge</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browse verified picks, follow proven winners, and get AI-powered insights on any matchup.
                  </p>
                </div>
              </div>

              <div className="relative bg-white">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white font-bold text-3xl">3</span>
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-20 blur"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Winning</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Make informed bets with data-backed picks. Track your progress and build your reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by winning bettors
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Join a community that's changing the game
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Finally found a platform where the track records are real. Following top performers has completely changed my approach to betting."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">MJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mike J.</div>
                  <div className="text-sm text-gray-500">Member since 2024</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The AI advisor is a game-changer. I use it to validate my research before placing any bet. Worth every penny."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">SK</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah K.</div>
                  <div className="text-sm text-gray-500">Pro Bettor</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Best betting community I've been part of. No BS, just solid picks and real data. My win rate has improved significantly."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">TC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Tom C.</div>
                  <div className="text-sm text-gray-500">Daily User</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why bettors choose EdgeBook
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              More than just a platform—it's your competitive advantage
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
              <div className="text-gray-600 font-medium">Verified Picks</div>
              <div className="text-sm text-gray-500 mt-1">Every record is tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600 font-medium">AI Advisor Access</div>
              <div className="text-sm text-gray-500 mt-1">Always available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15%</div>
              <div className="text-gray-600 font-medium">Platform Fee</div>
              <div className="text-sm text-gray-500 mt-1">Transparent pricing</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">$0</div>
              <div className="text-gray-600 font-medium">To Get Started</div>
              <div className="text-sm text-gray-500 mt-1">Free forever</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="text-primary" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">No Fake Records</h3>
                <p className="text-gray-600">Every pick is tracked and verified. See real performance—no cherry-picking allowed.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-primary" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Bank-Level Security</h3>
                <p className="text-gray-600">Your data and payments are protected with industry-leading encryption.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="text-primary" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Active Community</h3>
                <p className="text-gray-600">Connect with thousands of serious bettors who share strategies and insights.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="text-primary" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Smart Analytics</h3>
                <p className="text-gray-600">AI-powered insights help you make better decisions backed by data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary to-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to level up your betting?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join EdgeBook today and start following proven winners, sharing your picks, and making smarter bets.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/auth/signup" className="group w-full sm:w-auto bg-white text-primary hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg flex items-center justify-center">
              Get Started Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link href="/feed" className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg border-2 border-white/30 hover:border-white/50 backdrop-blur-sm">
              Browse Picks
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-green-300" />
              <span>Free account</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-green-300" />
              <span>No credit card needed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-green-300" />
              <span>Start in 30 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Gaming Footer */}
      <section className="py-8 bg-gray-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-400 text-sm mb-2">
            If you or someone you know has a gambling problem, please call 1-800-522-4700
          </p>
          <p className="text-gray-500 text-xs">
            You must be 18+ to use this platform. Please gamble responsibly. EdgeBook promotes responsible gaming.
          </p>
        </div>
      </section>
    </div>
  )
}
