import { Instagram, TrendingUp, Users, Heart, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';

export default function HomePage() {
  const features = [
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your posts performance with detailed metrics and insights',
      color: 'text-instagram-primary',
    },
    {
      icon: TrendingUp,
      title: 'Growth Tracking',
      description: 'Monitor follower growth and engagement trends over time',
      color: 'text-instagram-secondary',
    },
    {
      icon: Users,
      title: 'Audience Insights',
      description: 'Understand your audience demographics and behavior patterns',
      color: 'text-instagram-blue',
    },
    {
      icon: Heart,
      title: 'Engagement Analysis',
      description: 'Analyze likes, comments, and shares to optimize your content',
      color: 'text-instagram-tertiary',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="h-8 w-8 text-instagram-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-instagram-primary via-instagram-secondary to-instagram-blue bg-clip-text text-transparent">
                Instagram Buzz
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Sign In
              </button>
              <button className="rounded-lg bg-gradient-to-r from-instagram-primary to-instagram-secondary px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all">
                Get Started
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-instagram-blue/10 via-instagram-purple/10 to-instagram-primary/10">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Supercharge Your
              <span className="block bg-gradient-to-r from-instagram-primary via-instagram-secondary to-instagram-blue bg-clip-text text-transparent">
                Instagram Growth
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Get powerful analytics and insights to grow your Instagram presence.
              Track performance, understand your audience, and optimize your content strategy.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button className="rounded-lg bg-gradient-to-r from-instagram-primary to-instagram-secondary px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all">
                Start Free Trial
              </button>
              <button className="rounded-lg border-2 border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 hover:border-gray-400 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools to analyze and grow your Instagram account
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className={clsx('inline-flex rounded-lg p-3 bg-gray-50', feature.color)}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-instagram-primary via-instagram-secondary to-instagram-blue">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to Grow Your Instagram?
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Join thousands of creators and brands using Instagram Buzz
            </p>
            <button className="mt-8 rounded-lg bg-white px-8 py-3 text-base font-semibold text-instagram-primary shadow-lg hover:shadow-xl transition-all">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="h-6 w-6 text-instagram-primary" />
              <span className="text-lg font-semibold text-white">
                Instagram Buzz
              </span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 Instagram Buzz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
