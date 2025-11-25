# Instagram-buzz UI Components

## Overview

A comprehensive set of reusable React components built with TypeScript, Tailwind CSS, and Instagram-branded theming. All components follow modern React patterns with proper typing and accessibility support.

## Layout Components

### Header

Main navigation header component with logo, search, and user menu.

```tsx
import { Header } from '@/components';

export default function App() {
  return (
    <Header
      title="Instagram Buzz"
      showSearch={true}
    />
  );
}
```

**Props:**
- `title?: string` - Header title (default: "Instagram Buzz")
- `showSearch?: boolean` - Show search bar (default: false)
- `className?: string` - Additional CSS classes

**Features:**
- Sticky positioning
- Instagram gradient branding
- Notification button
- User profile button
- Responsive navigation

---

### Sidebar

Collapsible navigation sidebar with menu items and badges.

```tsx
import { Sidebar } from '@/components';

const items = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊', active: true },
  { id: 'posts', label: 'Posts', href: '/posts', icon: '📸', badge: 12 },
];

export default function App() {
  return (
    <Sidebar
      items={items}
      isOpen={true}
      onToggle={(isOpen) => console.log(isOpen)}
    />
  );
}
```

**Props:**
- `items?: NavItem[]` - Navigation items
- `isOpen?: boolean` - Initial sidebar state (default: true)
- `onToggle?: (isOpen: boolean) => void` - Toggle callback
- `className?: string` - Additional CSS classes

**NavItem Interface:**
```tsx
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  active?: boolean;
}
```

**Features:**
- Collapsible/expandable toggle
- Badge support for notifications
- Active item highlighting
- Tooltips in collapsed state
- Responsive (hidden on mobile by default)

---

## UI Components

### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components';

export default function App() {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger" size="lg">Delete</Button>
      <Button isLoading>Processing...</Button>
      <Button fullWidth>Full Width</Button>
      <Button leftIcon="→" rightIcon="←">With Icons</Button>
    </div>
  );
}
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success'` (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` (default: 'md')
- `isLoading?: boolean` (default: false)
- `fullWidth?: boolean` (default: false)
- `leftIcon?: React.ReactNode` - Left side icon
- `rightIcon?: React.ReactNode` - Right side icon
- `disabled?: boolean` - Disable button
- `className?: string` - Additional CSS classes

**Features:**
- Instagram gradient primary variant
- Color-coded danger and success states
- Loading spinner animation
- Focus ring styling
- Full width support
- Icon placement

---

### Card

Container component for content sections with multiple variants.

```tsx
import { Card, CardHeader, CardBody, CardFooter, CardGrid } from '@/components';
import { Button } from '@/components';

export default function Dashboard() {
  return (
    <CardGrid cols={3}>
      <Card hoverable>
        <CardHeader
          title="Engagement Stats"
          subtitle="Last 30 days"
          rightContent={<Button size="sm">View</Button>}
        />
        <CardBody>
          <div>Your content here</div>
        </CardBody>
        <CardFooter>
          <span>Footer content</span>
        </CardFooter>
      </Card>
    </CardGrid>
  );
}
```

**Card Props:**
- `variant?: 'default' | 'elevated' | 'outlined'` (default: 'default')
- `hoverable?: boolean` - Add hover effect (default: false)
- `className?: string` - Additional CSS classes

**CardHeader Props:**
- `title?: string` - Header title
- `subtitle?: string` - Header subtitle
- `rightContent?: React.ReactNode` - Right side content
- `className?: string` - Additional CSS classes

**CardBody Props:**
- `className?: string` - Additional CSS classes

**CardFooter Props:**
- `className?: string` - Additional CSS classes

**CardGrid Props:**
- `cols?: 1 | 2 | 3 | 4` - Column count (default: 3)
- `className?: string` - Additional CSS classes

**Features:**
- Multiple style variants
- Hover effects
- Header/body/footer composition
- Responsive grid layout
- Card shadows and borders

---

### Input

Text input component with label, error, and icon support.

```tsx
import { Input, Textarea } from '@/components';

export default function Form() {
  return (
    <div className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon="📧"
        helperText="We'll never share your email"
      />

      <Input
        label="Password"
        type="password"
        error="Password must be at least 8 characters"
        required
      />

      <Input
        label="Search"
        type="search"
        inputSize="lg"
        placeholder="Search posts..."
        rightIcon="🔍"
      />

      <Textarea
        label="Comment"
        placeholder="Write your comment..."
        rows={5}
        helperText="Max 500 characters"
      />
    </div>
  );
}
```

**Input Props:**
- `type?: InputType` - Input type (default: 'text')
- `inputSize?: 'sm' | 'md' | 'lg'` (default: 'md')
- `label?: string` - Input label
- `helperText?: string` - Helper text below input
- `error?: string` - Error message
- `leftIcon?: React.ReactNode` - Left side icon
- `rightIcon?: React.ReactNode` - Right side icon
- `disabled?: boolean` - Disable input
- `required?: boolean` - Mark as required
- `className?: string` - Additional CSS classes

**Textarea Props:**
- `label?: string` - Textarea label
- `helperText?: string` - Helper text
- `error?: string` - Error message
- `rows?: number` - Number of rows (default: 4)
- `disabled?: boolean` - Disable textarea
- `required?: boolean` - Mark as required
- `className?: string` - Additional CSS classes

**Input Types:**
`'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date'`

**Features:**
- Label and required indicator support
- Error state styling
- Helper text
- Icon support (left/right)
- Multiple input types
- Size variants
- Red error borders
- Accessible form elements

---

### LoadingSpinner

Animated loading indicator with multiple variants.

```tsx
import { LoadingSpinner, LoadingOverlay, Skeleton } from '@/components';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {/* Inline Spinner */}
      <LoadingSpinner
        size="md"
        variant="gradient"
        showText
        text="Loading data..."
      />

      {/* Full Screen Overlay */}
      <LoadingOverlay
        isOpen={isLoading}
        text="Processing..."
      />

      {/* Skeleton Loaders */}
      <Skeleton width="100%" height="20px" />
      <Skeleton lines={3} />
      <Skeleton width={40} height={40} circle />
    </div>
  );
}
```

**LoadingSpinner Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` (default: 'md')
- `variant?: 'default' | 'gradient' | 'pulse'` (default: 'default')
- `showText?: boolean` - Show loading text (default: false)
- `text?: string` - Loading text (default: 'Loading...')
- `className?: string` - Additional CSS classes

**LoadingOverlay Props:**
- `isOpen?: boolean` - Show overlay (default: false)
- `text?: string` - Loading text (default: 'Loading...')
- `className?: string` - Additional CSS classes

**Skeleton Props:**
- `width?: string | number` - Skeleton width (default: '100%')
- `height?: string | number` - Skeleton height (default: '1rem')
- `circle?: boolean` - Circular skeleton (default: false)
- `lines?: number` - Number of lines for text skeleton
- `className?: string` - Additional CSS classes

**Features:**
- Multiple animation variants
- Various size options
- Gradient Instagram theming
- Full-screen overlay support
- Skeleton loaders for content placeholders
- Pulsing animation
- Accessibility support

---

## Theming

### Instagram Color Palette

The components use Instagram's official color gradient:

```css
instagram-primary: #E4405F
instagram-secondary: #833AB4
instagram-tertiary: #F77737
instagram-blue: #405DE6
instagram-purple: #5851DB
```

### Custom Tailwind Configuration

The project includes custom Tailwind configuration in `tailwind.config.js`:

```js
colors: {
  instagram: {
    primary: '#E4405F',
    secondary: '#833AB4',
    tertiary: '#F77737',
    blue: '#405DE6',
    purple: '#5851DB',
  },
},
boxShadow: {
  card: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  'card-hover': '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
}
```

---

## Accessibility

All components follow Web Content Accessibility Guidelines (WCAG):

- Proper semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader friendly

---

## Component Examples

### Complete Form Example

```tsx
import { Card, CardHeader, CardBody, CardFooter, Input, Button } from '@/components';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation and submission logic
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader title="Login" />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
        </CardBody>
        <CardFooter>
          <Button variant="tertiary">Cancel</Button>
          <Button type="submit" fullWidth>Login</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

### Dashboard Layout Example

```tsx
import { Header, Sidebar, Card, CardGrid, Button } from '@/components';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header showSearch />
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          <CardGrid cols={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} hoverable>
                <div className="text-center">
                  <h3 className="font-bold">Stat {i}</h3>
                  <p className="text-2xl">1.2M</p>
                </div>
              </Card>
            ))}
          </CardGrid>
        </main>
      </div>
    </div>
  );
}
```

---

## Installation & Usage

### Import Components

```tsx
// Individual imports
import { Button } from '@/components';
import { Input, Textarea } from '@/components';

// Or bulk import
import {
  Header,
  Sidebar,
  Button,
  Card,
  Input,
  LoadingSpinner
} from '@/components';
```

### TypeScript Support

All components are fully typed with TypeScript. Props interfaces are exported for custom type definitions:

```tsx
import type { ButtonProps, CardProps, InputProps } from '@/components';

const customButton: ButtonProps = {
  variant: 'primary',
  size: 'lg',
};
```

---

## Testing

Components include comprehensive unit tests using Vitest and React Testing Library:

```bash
npm test
```

Test files are located in `/tests/components/`:
- `Button.test.tsx` - 10+ test cases
- `Card.test.tsx` - 15+ test cases
- `Input.test.tsx` - 20+ test cases
- `LoadingSpinner.test.tsx` - 25+ test cases

---

## Responsive Design

All components are mobile-first and fully responsive:

- **Mobile**: Single column, stacked layout
- **Tablet**: 2 columns (sm breakpoint)
- **Desktop**: 3-4 columns (lg breakpoint)

Tailwind's responsive prefixes are used throughout (sm:, md:, lg:, xl:)

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance

- Optimized with React.forwardRef
- Memoization for expensive components
- Minimal re-renders
- CSS-in-JS with Tailwind (no runtime overhead)
- Tree-shakeable exports

---

## Contributing

When adding new components:

1. Follow the existing file structure
2. Add TypeScript interfaces for all props
3. Include JSDoc comments
4. Create comprehensive unit tests
5. Update this documentation
6. Test accessibility
7. Verify responsive design

---

## License

MIT
