# seam-ui

**The missing semantic layer between UI and AI.**

seam-ui is a protocol and React library that adds MCP-like annotations to your components so LLMs can understand what your UI does, what state it's in, and how to interact with it. Write Playwright tests in plain English.

```ts
import { test } from '@seam-ui/playwright';

test('user can update settings', async ({ page, llm }) => {
  await page.goto('http://localhost:3000');

  await llm.do('click Settings in the navbar');
  await llm.do('type "Alice" into the display name field');
  await llm.do('toggle dark mode on');
  await llm.do('click save settings');

  await llm.expect('the display name contains "Alice"');
  await llm.expect('dark mode is on');
});
```

## Packages

| Package | Description |
|---|---|
| [`@seam-ui/core`](./packages/core) | Protocol types, JSON Schema, constants |
| [`@seam-ui/react`](./packages/react) | React hooks, provider, registry, DevPanel |
| [`@seam-ui/playwright`](./packages/playwright) | Playwright fixture for natural language testing |
| [`@seam-ui/example`](./packages/example) | Demo app showcasing all features |
| [`@seam-ui/landing`](./packages/landing) | Project landing page |

## Quick Start

### Install

```bash
pnpm add @seam-ui/react @seam-ui/core

# For testing:
pnpm add -D @seam-ui/playwright @playwright/test
```

### 1. Wrap your app

```tsx
import { LLMProvider, LLMScope } from '@seam-ui/react';

function App() {
  return (
    <LLMProvider enabled>
      <LLMScope name="Navigation">
        <NavBar />
      </LLMScope>
      <LLMScope name="Main Content">
        <YourApp />
      </LLMScope>
    </LLMProvider>
  );
}
```

### 2. Annotate components

```tsx
import { useLLMAction, useLLMInput } from '@seam-ui/react';

function SearchBar() {
  const [query, setQuery] = useState('');

  const { ref: inputRef } = useLLMInput({
    name: 'Search',
    description: 'Search products by name or category',
    inputType: 'search',
    value: query,
  });

  const { ref: btnRef } = useLLMAction({
    name: 'Submit Search',
    description: 'Search for products matching the query',
    enabled: query.length > 0,
  });

  return (
    <form>
      <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} />
      <button ref={btnRef}>Search</button>
    </form>
  );
}
```

### 3. Write tests in English

```ts
import { test, expect } from '@seam-ui/playwright';

test.use({
  llmConfig: {
    provider: 'openrouter',
    model: 'anthropic/claude-sonnet-4-20250514',
  },
});

test('search for products', async ({ page, llm }) => {
  await page.goto('http://localhost:3000');

  await llm.do('type "headphones" into the search field');
  await llm.do('click submit search');
  await llm.expect('search results are visible');

  // Mix with regular Playwright when needed
  await expect(page.locator('.results')).toContainText('headphones');
});
```

### Multi-step instructions

You can pack multiple actions into a single `do()` call, or use `sequence()` for flows that change the page between steps:

```ts
// Multi-step: LLM resolves all actions at once (best for 2-3 related actions)
await llm.do('fill in name "Eve", email "eve@test.com", role "Engineer", then submit');

// Sequence: re-reads the manifest between each step (best for 4+ steps or page changes)
await llm.sequence([
  'open the search overlay',
  'search for "Settings"',
  'click the Settings result',
  'change display name to "Bob" and email to "bob@test.com"',
  'click save settings',
]);

await llm.expect('the display name is "Bob"');

// Mix freely — batch related fills, separate page-changing steps
await llm.do('go to the dashboard and set the time range to 90 days');
await llm.expect('the 90 day range is selected');
```

## Features

### Hook-based annotation

```tsx
// Actions (buttons, links, toggles)
const { ref } = useLLMAction({
  name: 'Save Settings',
  description: 'Save all changes to user preferences',
  enabled: formIsValid,
  loading: isSaving,
});

// Inputs (text, email, select, checkbox, etc.)
const { ref } = useLLMInput({
  name: 'Email Address',
  description: 'Primary email for account recovery',
  inputType: 'email',
  value: email,
});
```

### Typed action parameters

Define MCP-style parameters on actions. LLMs can invoke them directly without DOM simulation.

```tsx
const { ref } = useLLMAction({
  name: 'Set Theme',
  description: 'Change the app color theme',
  params: {
    theme: {
      type: 'string',
      enum: ['light', 'dark', 'system'],
      required: true,
      description: 'The theme to apply',
    },
  },
  onExecute: async (req) => {
    setTheme(req.params.theme);
    return { status: 'success', message: `Theme set to ${req.params.theme}` };
  },
});

// In tests:
await llm.invoke('Set Theme', { theme: 'dark' });
```

### Semantic relationships

Declare cause-and-effect between elements.

```tsx
const { entryId: nameId } = useLLMInput({ name: 'Name', ... });
const { entryId: emailId } = useLLMInput({ name: 'Email', ... });

const { ref: submitRef } = useLLMAction({
  name: 'Save Contact',
  description: 'Save the contact form',
  relations: [
    { type: 'submits', targetId: nameId },
    { type: 'submits', targetId: emailId },
  ],
});
```

Relation types: `submits`, `controls`, `validates`, `triggers`.

### Scope hierarchy

Group elements by page section. Helps LLMs disambiguate similar elements.

```tsx
<LLMScope name="Navigation">
  <NavBar />
</LLMScope>
<LLMScope name="Settings Page">
  <LLMScope name="Profile Section">
    {/* inputs here */}
  </LLMScope>
  <LLMScope name="Danger Zone">
    {/* delete button here */}
  </LLMScope>
</LLMScope>
```

### Route awareness

Declare your app's routes so LLMs know what pages exist.

```tsx
<LLMProvider
  routes={[
    { path: '/', name: 'Home', description: 'Landing page' },
    { path: '/settings', name: 'Settings', description: 'User preferences' },
  ]}
  currentRoute={{ path: '/settings', name: 'Settings' }}
>
```

```ts
// In tests:
await llm.navigate('Settings');
```

### Permissions & capabilities

Tag dangerous actions and declare what consumers can do.

```tsx
// Tag an action
const { ref } = useLLMAction({
  name: 'Delete Account',
  description: 'Permanently delete the account',
  permission: 'dangerZone',
});

// Declare page capabilities
<LLMProvider capabilities={{
  read: true,
  execute: true,
  navigate: true,
  fillInputs: true,
  dangerZone: false, // LLM won't touch danger-zone actions
}}>
```

### Bidirectional execution

Actions can be invoked programmatically via the window bridge. No Playwright needed.

```ts
// From browser console or any agent:
const result = await window.__seam__.execute(entryId, {
  operation: 'invoke',
  params: { enabled: true },
});
// { status: 'success', message: 'Dark mode enabled' }
```

### Event subscriptions

Subscribe to real-time state changes.

```ts
window.__seam__.subscribe('*', (event) => {
  console.log(event.type, event.entryId);
  // 'stateChange' | 'valueChange' | 'visibilityChange' | 'removed'
});
```

### DevPanel

Drop-in debug panel for development.

```tsx
import { LLMDevPanel } from '@seam-ui/react';

// Add anywhere inside LLMProvider
<LLMDevPanel />
```

Shows live entries, state, scope tree, and highlights elements on hover.

### Discovery

LLMProvider auto-injects `<meta name="seam-ui" content="1.0.0">` for agent discovery.

```ts
// In Playwright:
const { supported, version } = await llm.detectSupport();
```

## Playwright API

| Method | Description |
|---|---|
| `llm.do(instruction)` | Execute a natural language instruction |
| `llm.expect(assertion)` | Assert a condition in natural language |
| `llm.expectSoft(assertion)` | Soft assertion (warns, doesn't fail) |
| `llm.find(description)` | Find element, returns Playwright `Locator` |
| `llm.sequence(instructions)` | Execute multiple instructions in order |
| `llm.invoke(name, params)` | Invoke an action directly with parameters |
| `llm.navigate(routeName)` | Navigate to a declared route |
| `llm.getManifest()` | Get the raw manifest |
| `llm.detectSupport()` | Check if page supports seam-ui |

### Configuration

```ts
test.use({
  llmConfig: {
    provider: 'openrouter',           // or a custom function
    model: 'anthropic/claude-sonnet-4-20250514',
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature: 0,                   // deterministic
    timeout: 30_000,                  // per LLM call
    verbose: true,                    // log reasoning
  },
});
```

## Development

```bash
# Clone and install
git clone https://github.com/your-username/seam-ui.git
cd seam-ui
pnpm install

# Build all packages
pnpm build

# Run the example app
pnpm --filter @seam-ui/example dev

# Run the landing page
pnpm --filter @seam-ui/landing dev

# Run e2e tests (requires OPENROUTER_API_KEY)
cp .env.example .env  # add your key
pnpm test:e2e
```

## Protocol

seam-ui is protocol-first. The manifest schema is defined as a [JSON Schema](./packages/core/schema/manifest.schema.json) that any framework can implement. The React package is one implementation — Vue, Svelte, and vanilla JS implementations can follow the same spec.

The manifest is exposed at `window.__seam__` and includes:

- **Entries**: actions and inputs with name, description, state, visibility, params, relations, permissions
- **Scope tree**: hierarchical grouping of elements
- **Routes**: declared app navigation paths
- **Capabilities**: what consumers are allowed to do
- **Summary**: counts and stats for quick orientation

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for instructions on publishing to npm.

## License

MIT
