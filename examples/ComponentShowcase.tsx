/**
 * Component Showcase Example
 *
 * This file demonstrates how to use all the Instagram-buzz UI components
 * together in a realistic application scenario.
 */

'use client';

import React, { useState } from 'react';
import {
  Header,
  Sidebar,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardGrid,
  Input,
  Textarea,
  LoadingSpinner,
  LoadingOverlay,
} from '@/components';

/**
 * Example dashboard component showcasing all UI components
 */
export default function ComponentShowcase() {
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    comment: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = {
      email: !formData.email ? 'Email is required' : '',
      password: formData.password.length < 8 ? 'Password must be 8+ characters' : '',
    };

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Loading Overlay */}
      <LoadingOverlay isOpen={isLoading} text="Processing your request..." />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        items={[
          {
            id: 'overview',
            label: 'Overview',
            href: '/',
            icon: '📊',
            active: true,
          },
          {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/dashboard',
            icon: '📈',
          },
          {
            id: 'posts',
            label: 'Posts',
            href: '/posts',
            icon: '📸',
            badge: 12,
          },
          {
            id: 'analytics',
            label: 'Analytics',
            href: '/analytics',
            icon: '📉',
          },
          {
            id: 'audience',
            label: 'Audience',
            href: '/audience',
            icon: '👥',
          },
          {
            id: 'reports',
            label: 'Reports',
            href: '/reports',
            icon: '📋',
          },
          {
            id: 'settings',
            label: 'Settings',
            href: '/settings',
            icon: '⚙️',
          },
        ]}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title="Instagram Buzz" showSearch={true} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <div className="space-y-8">
            {/* Section 1: Button Examples */}
            <Card variant="elevated">
              <CardHeader
                title="Button Components"
                subtitle="Different variants and sizes"
              />
              <CardBody>
                <div className="flex flex-wrap gap-4">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="tertiary">Tertiary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="danger">Delete</Button>
                  <Button disabled>Disabled</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button fullWidth>Full Width Button</Button>
                  <Button isLoading>Loading...</Button>
                  <Button leftIcon="→">With Left Icon</Button>
                  <Button rightIcon="→">With Right Icon</Button>
                </div>
              </CardBody>
            </Card>

            {/* Section 2: Stats Cards Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Engagement Metrics
              </h2>
              <CardGrid cols={4}>
                {[
                  { label: 'Followers', value: '1.2M', trend: '+12.5%' },
                  { label: 'Engagement', value: '8.5%', trend: '+2.1%' },
                  { label: 'Reach', value: '4.8M', trend: '-1.3%' },
                  { label: 'Impressions', value: '12.3M', trend: '+8.7%' },
                ].map((stat) => (
                  <Card key={stat.label} hoverable>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </p>
                      <p className="text-green-600 text-sm font-medium mt-1">
                        {stat.trend}
                      </p>
                    </div>
                  </Card>
                ))}
              </CardGrid>
            </div>

            {/* Section 3: Input Form Example */}
            <Card>
              <CardHeader
                title="User Form Example"
                subtitle="Demonstrates input components with validation"
              />
              <form onSubmit={handleSubmit}>
                <CardBody className="space-y-6">
                  <Input
                    label="Email Address"
                    type="email"
                    inputSize="md"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    error={errors.email}
                    leftIcon="📧"
                    helperText="We'll never share your email address"
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    inputSize="md"
                    placeholder="Enter secure password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    error={errors.password}
                    rightIcon="🔒"
                    helperText="Minimum 8 characters required"
                    required
                  />

                  <Textarea
                    label="Comment"
                    placeholder="Write your message here..."
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    helperText="Max 500 characters"
                    rows={4}
                  />
                </CardBody>

                <CardFooter>
                  <Button variant="tertiary">Cancel</Button>
                  <Button type="submit" isLoading={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Section 4: Loading States */}
            <Card>
              <CardHeader
                title="Loading Components"
                subtitle="Spinners and skeleton loaders"
              />
              <CardBody>
                <div className="flex gap-8 items-start justify-between">
                  <div className="text-center">
                    <h4 className="font-bold mb-4">Default Spinner</h4>
                    <LoadingSpinner size="md" showText text="Loading..." />
                  </div>

                  <div className="text-center">
                    <h4 className="font-bold mb-4">Gradient Spinner</h4>
                    <LoadingSpinner
                      size="md"
                      variant="gradient"
                      showText
                      text="Processing..."
                    />
                  </div>

                  <div className="text-center">
                    <h4 className="font-bold mb-4">Pulse Spinner</h4>
                    <LoadingSpinner
                      size="md"
                      variant="pulse"
                      showText
                      text="Syncing..."
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Section 5: Text Variants */}
            <Card variant="outlined">
              <CardHeader
                title="Input Size Variants"
                subtitle="Demonstrate different input sizes"
              />
              <CardBody className="space-y-4">
                <Input
                  label="Small Input"
                  inputSize="sm"
                  placeholder="Small size"
                />
                <Input
                  label="Medium Input"
                  inputSize="md"
                  placeholder="Medium size (default)"
                />
                <Input
                  label="Large Input"
                  inputSize="lg"
                  placeholder="Large size"
                />
              </CardBody>
            </Card>

            {/* Section 6: Button States */}
            <Card>
              <CardHeader title="Button States" />
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Normal
                    </p>
                    <Button>Click me</Button>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Disabled
                    </p>
                    <Button disabled>Disabled Button</Button>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Loading
                    </p>
                    <Button isLoading>Loading</Button>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Full Width
                    </p>
                    <Button fullWidth>Full Width Button</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
