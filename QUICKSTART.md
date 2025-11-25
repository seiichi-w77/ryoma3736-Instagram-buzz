# Instagram-buzz UI Components - Quick Start Guide

**Last Updated:** November 25, 2025
**Status:** Production Ready

## Get Started in 5 Minutes

### 1. Import Components

```tsx
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
} from '@/components';
```

### 2. Basic Layout

```tsx
export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={true} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title="Dashboard" showSearch />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          {/* Content goes here */}
        </main>
      </div>
    </div>
  );
}
```

### 3. Using Cards

```tsx
<CardGrid cols={3}>
  <Card hoverable>
    <CardHeader title="Stat 1" subtitle="Last 30 days" />
    <CardBody>
      <div className="text-3xl font-bold">1.2M</div>
    </CardBody>
  </Card>

  <Card hoverable>
    <CardHeader title="Stat 2" subtitle="Last 30 days" />
    <CardBody>
      <div className="text-3xl font-bold">8.5%</div>
    </CardBody>
  </Card>
</CardGrid>
```

### 4. Using Buttons

```tsx
<div className="flex gap-4">
  <Button>Primary Button</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="danger">Delete</Button>
  <Button isLoading>Loading...</Button>
  <Button fullWidth>Full Width</Button>
</div>
```

### 5. Using Forms

```tsx
<Card>
  <CardHeader title="Login Form" />
  <form onSubmit={handleSubmit}>
    <CardBody className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon="📧"
        error={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Your password"
        rightIcon="🔒"
        error={errors.password}
        required
      />

      <Textarea
        label="Comment"
        placeholder="Enter your message..."
        rows={4}
      />
    </CardBody>
    <CardFooter>
      <Button variant="tertiary">Cancel</Button>
      <Button type="submit">Submit</Button>
    </CardFooter>
  </form>
</Card>
```

### 6. Using Loading States

```tsx
import { LoadingSpinner, LoadingOverlay } from '@/components';

export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {/* Full screen overlay */}
      <LoadingOverlay isOpen={isLoading} text="Processing..." />

      {/* Inline spinner */}
      <LoadingSpinner
        size="md"
        variant="gradient"
        showText
        text="Loading data..."
      />
    </>
  );
}
```

---

## Component Reference

### Header
```tsx
<Header
  title="My App"              // Custom title
  showSearch={true}           // Show search bar
  className="custom-class"    // Custom styling
/>
```

### Sidebar
```tsx
<Sidebar
  items={[
    { id: 'home', label: 'Home', href: '/', icon: '🏠', active: true },
    { id: 'posts', label: 'Posts', href: '/posts', icon: '📸', badge: 5 },
  ]}
  isOpen={true}
  onToggle={(isOpen) => console.log(isOpen)}
/>
```

### Button
```tsx
<Button
  variant="primary"           // primary | secondary | tertiary | danger | success
  size="md"                   // sm | md | lg
  isLoading={false}           // Show loading spinner
  fullWidth={false}           // Full width button
  leftIcon="→"                // Left icon
  rightIcon="→"               // Right icon
  disabled={false}            // Disable button
>
  Click me
</Button>
```

### Card
```tsx
<Card
  variant="default"           // default | elevated | outlined
  hoverable={false}           // Add hover effect
>
  {/* Card content */}
</Card>

<CardHeader
  title="Title"               // Required
  subtitle="Subtitle"         // Optional
  rightContent={<Button/>}    // Optional
/>

<CardBody>
  {/* Your content */}
</CardBody>

<CardFooter>
  {/* Footer content */}
</CardFooter>

<CardGrid cols={3}>          // 1 | 2 | 3 | 4
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</CardGrid>
```

### Input
```tsx
<Input
  type="email"                // text | email | password | number | etc
  label="Email"               // Label above input
  placeholder="Email"         // Placeholder text
  inputSize="md"              // sm | md | lg
  error="Required field"      // Error message
  helperText="Helper text"    // Helper text below
  leftIcon="📧"               // Left side icon
  rightIcon="✓"               // Right side icon
  required                    // Required indicator
  disabled                    // Disable input
  value={value}               // Controlled input
  onChange={(e) => {}}        // Change handler
/>

<Textarea
  label="Comment"             // Label
  placeholder="Your message"  // Placeholder
  rows={4}                    // Number of rows
  error="Too long"            // Error message
  helperText="Max 500 chars"  // Helper text
  required                    // Required indicator
/>
```

### LoadingSpinner
```tsx
<LoadingSpinner
  size="md"                   // sm | md | lg | xl
  variant="gradient"          // default | gradient | pulse
  showText={true}             // Show loading text
  text="Loading..."           // Custom text
/>

<LoadingOverlay
  isOpen={true}               // Show overlay
  text="Processing..."        // Custom text
/>

<Skeleton
  width="100%"                // Width (string or number)
  height={20}                 // Height (string or number)
  circle={false}              // Circular skeleton
  lines={3}                   // Multiple lines
/>
```

---

## Styling with Tailwind

All components support custom Tailwind classes:

```tsx
<Button className="border-4 border-purple-500">Custom Styled</Button>

<Card className="bg-yellow-50 border-yellow-200">
  Custom Card
</Card>

<Input className="text-lg font-bold" />
```

---

## Instagram Color Theme

Use Instagram colors in your custom styling:

```tsx
<div className="bg-gradient-to-r from-instagram-primary via-instagram-secondary to-instagram-tertiary text-white p-4">
  Instagram Gradient
</div>
```

Available colors:
- `instagram-primary`: #E4405F (Red)
- `instagram-secondary`: #833AB4 (Purple)
- `instagram-tertiary`: #F77737 (Orange)
- `instagram-blue`: #405DE6
- `instagram-purple`: #5851DB

---

## Complete Example

See the full example in `/examples/ComponentShowcase.tsx`

```bash
# View the showcase
cat /Users/satoryouma/dev/miyabi_0.15_20251125/ryoma3736/Instagram-buzz/examples/ComponentShowcase.tsx
```

---

## Documentation

- **COMPONENTS.md** - Comprehensive API documentation
- **IMPLEMENTATION_SUMMARY.md** - Project overview
- **UI_COMPONENTS_CHECKLIST.md** - Quality checklist

---

## TypeScript Support

All components are fully typed:

```tsx
import type { ButtonProps, CardProps, InputProps } from '@/components';

const buttonProps: ButtonProps = {
  variant: 'primary',
  size: 'lg',
};
```

---

## Testing

Run tests with:

```bash
npm test
```

Tests are located in `/tests/components/`

---

## Next Steps

1. Check out `/examples/ComponentShowcase.tsx` for a complete demo
2. Read `COMPONENTS.md` for detailed API documentation
3. Use components in your application
4. Customize with Tailwind classes as needed

---

## Common Patterns

### Form with Validation

```tsx
const [errors, setErrors] = useState({});

const handleSubmit = (e) => {
  e.preventDefault();
  // Validate
  // Submit
};

<form onSubmit={handleSubmit}>
  <Input
    label="Email"
    error={errors.email}
    value={formData.email}
    onChange={(e) => setFormData({...formData, email: e.target.value})}
  />
  <Button type="submit">Submit</Button>
</form>
```

### Loading State

```tsx
const [loading, setLoading] = useState(false);

const handleClick = async () => {
  setLoading(true);
  try {
    await someAsyncTask();
  } finally {
    setLoading(false);
  }
};

<Button isLoading={loading} onClick={handleClick}>
  {loading ? 'Loading...' : 'Click me'}
</Button>
```

### Responsive Grid

```tsx
<CardGrid cols={3}>
  {items.map(item => (
    <Card key={item.id} hoverable>
      <CardHeader title={item.title} />
      <CardBody>{item.content}</CardBody>
    </Card>
  ))}
</CardGrid>
```

---

**Happy coding with Instagram-buzz UI Components!**
