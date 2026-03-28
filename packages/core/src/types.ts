// ============================================================
// Identifiers
// ============================================================

export type EntryId = string & { readonly __brand: 'EntryId' };

export type ScopePath = readonly string[];

// ============================================================
// Element State
// ============================================================

export interface ElementVisibility {
  /** Whether the element is in the viewport (IntersectionObserver) */
  inViewport: boolean;
  /** Whether the element is CSS-visible (not display:none, visibility:hidden, opacity:0) */
  cssVisible: boolean;
  /** Combined: in viewport AND css visible */
  visible: boolean;
}

export interface ElementState {
  visibility: ElementVisibility;
  /** aria-disabled or HTML disabled attribute */
  enabled: boolean;
  /** aria-busy or custom loading state */
  loading: boolean;
  /** Arbitrary developer-defined dynamic state */
  dynamicState: Record<string, unknown>;
}

// ============================================================
// Action Parameters (MCP-style)
// ============================================================

export interface LLMParamDefinition {
  type: 'string' | 'number' | 'boolean';
  description: string;
  enum?: (string | number | boolean)[];
  default?: string | number | boolean;
  required?: boolean;
}

export type LLMParamSchema = Record<string, LLMParamDefinition>;

// ============================================================
// Semantic Relationships
// ============================================================

export type RelationType = 'submits' | 'controls' | 'validates' | 'triggers';

export interface LLMRelation {
  type: RelationType;
  /** The EntryId of the related element */
  targetId: EntryId;
  /** Optional description of the relationship */
  description?: string;
}

// ============================================================
// Action Entry
// ============================================================

export interface LLMActionDescriptor {
  /** Human-readable name: "Submit Form", "Toggle Dark Mode" */
  name: string;
  /** What this action does, for the LLM: "Submits the contact form and sends an email" */
  description: string;
  /** Optional group of related actions: "navigation", "form-controls" */
  group?: string;
  /** Keyboard shortcut if applicable */
  shortcut?: string;
  /** Dynamic state descriptor */
  dynamicState?: Record<string, unknown>;
  /** MCP-style typed parameter definitions for this action */
  params?: LLMParamSchema;
  /** Semantic relationships to other entries */
  relations?: LLMRelation[];
}

export interface LLMActionEntry {
  id: EntryId;
  kind: 'action';
  descriptor: LLMActionDescriptor;
  /** CSS selector that uniquely identifies this element */
  selector: string;
  /** data-llm-id attribute value for reliable targeting */
  dataAttribute: string;
  /** Scope path from nested LLMScope components */
  scopePath: ScopePath;
  /** Current element state */
  state: ElementState;
  /** The element's tag name (button, a, div, etc.) */
  tagName: string;
  /** The element's role (from aria-role or implicit) */
  role: string | null;
  /** Timestamp of last state change */
  lastUpdated: number;
  /** Required capability to interact with this entry */
  permission?: LLMPermission;
}

// ============================================================
// Input Entry
// ============================================================

export type InputType =
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  | 'search' | 'date' | 'time' | 'datetime-local'
  | 'textarea' | 'select' | 'checkbox' | 'radio'
  | 'file' | 'range' | 'color';

export interface LLMInputValidation {
  required: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  /** Current validation message if invalid, null if valid */
  validationMessage: string | null;
  /** Whether the input currently satisfies all constraints */
  valid: boolean;
}

export interface LLMInputDescriptor {
  /** Human-readable name: "Email Address", "Search Query" */
  name: string;
  /** What this input is for: "The user's primary email for account recovery" */
  description: string;
  /** The type of input */
  inputType: InputType;
  /** Dynamic state */
  dynamicState?: Record<string, unknown>;
  /** Semantic relationships to other entries */
  relations?: LLMRelation[];
}

export interface LLMInputEntry {
  id: EntryId;
  kind: 'input';
  descriptor: LLMInputDescriptor;
  selector: string;
  dataAttribute: string;
  scopePath: ScopePath;
  state: ElementState;
  tagName: string;
  role: string | null;
  lastUpdated: number;
  /** Current value of the input */
  currentValue: string | boolean | number | string[];
  /** Placeholder text */
  placeholder: string | null;
  /** For selects: available options */
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Validation state */
  validation: LLMInputValidation;
  /** Required capability to interact with this entry */
  permission?: LLMPermission;
}

// ============================================================
// Registry Entry (union)
// ============================================================

export type LLMEntry = LLMActionEntry | LLMInputEntry;

// ============================================================
// Scope
// ============================================================

export interface LLMScopeDescriptor {
  /** Human-readable name: "Navigation Bar", "Settings Panel" */
  name: string;
  /** What this section contains/does */
  description?: string;
}

export interface LLMScopeNode {
  descriptor: LLMScopeDescriptor;
  /** Full path including ancestors */
  path: ScopePath;
  /** Entry IDs directly within this scope */
  entries: EntryId[];
  /** Child scopes */
  children: LLMScopeNode[];
}

// ============================================================
// Capabilities / Permissions
// ============================================================

export interface LLMCapabilities {
  /** Can read manifest / inspect element state */
  read: boolean;
  /** Can execute actions via bridge */
  execute: boolean;
  /** Can use route navigation */
  navigate: boolean;
  /** Can fill input values */
  fillInputs: boolean;
  /** Can access destructive / dangerous actions */
  dangerZone: boolean;
}

export type LLMPermission = 'read' | 'execute' | 'navigate' | 'fillInputs' | 'dangerZone';

// ============================================================
// Routes
// ============================================================

export interface LLMRoute {
  /** URL path pattern (e.g., '/settings', '/users/:id') */
  path: string;
  /** Human-readable name */
  name: string;
  /** Description for LLM */
  description: string;
  /** URL parameters if any */
  params?: Record<string, LLMParamDefinition>;
}

export interface LLMCurrentRoute {
  path: string;
  name: string;
  /** Resolved route parameters */
  params?: Record<string, string>;
}

// ============================================================
// Bidirectional Execution
// ============================================================

export type ExecutionStatus = 'success' | 'error' | 'pending';

export interface ExecutionResult {
  status: ExecutionStatus;
  /** Human-readable message about what happened */
  message?: string;
  /** Entry IDs of elements whose state changed as a result */
  changes?: EntryId[];
  /** Side effects description (for LLM understanding) */
  sideEffects?: string[];
  /** Error details if status === 'error' */
  error?: string;
}

export type ExecuteOperation = LLMBridgeAction['operation'] | 'invoke';

export interface ExecuteRequest {
  operation: ExecuteOperation;
  value?: string;
  /** Parameters for parameterized actions */
  params?: Record<string, string | number | boolean>;
}

/** Callback registered by components to handle programmatic execution */
export type OnExecuteCallback = (
  request: ExecuteRequest
) => ExecutionResult | Promise<ExecutionResult>;

// ============================================================
// Event Subscriptions
// ============================================================

export type LLMEntryEventType = 'stateChange' | 'valueChange' | 'visibilityChange' | 'removed';

export interface LLMEntryEvent {
  entryId: EntryId;
  type: LLMEntryEventType;
  timestamp: number;
  /** Previous state snapshot (partial) */
  previous?: Partial<ElementState>;
  /** New state snapshot (partial) */
  current?: Partial<ElementState>;
  /** New value (for valueChange on inputs) */
  value?: unknown;
}

export type LLMEntryEventCallback = (event: LLMEntryEvent) => void;

// ============================================================
// Manifest (the JSON exposed to Playwright)
// ============================================================

export interface UILLMManifest {
  /** Schema version for forward compatibility */
  version: '1.0.0';
  /** ISO timestamp of when the manifest was generated */
  generatedAt: string;
  /** Page URL at time of generation */
  pageUrl: string;
  /** Page title */
  pageTitle: string;
  /** Flat list of all entries for direct lookup */
  entries: LLMEntry[];
  /** Hierarchical scope tree */
  scopeTree: LLMScopeNode[];
  /** Summary stats for quick LLM orientation */
  summary: {
    totalActions: number;
    totalInputs: number;
    visibleActions: number;
    visibleInputs: number;
    enabledActions: number;
    scopes: number;
    /** Declared capabilities for this page */
    capabilities?: LLMCapabilities;
  };
  /** Available routes in the application */
  routes?: LLMRoute[];
  /** Currently active route */
  currentRoute?: LLMCurrentRoute;
}

// ============================================================
// Window augmentation
// ============================================================

export interface UILLMWindowBridge {
  getManifest: () => UILLMManifest;
  getEntry: (id: EntryId) => LLMEntry | undefined;
  findEntries: (query: { name?: string; scope?: string; kind?: 'action' | 'input' }) => LLMEntry[];
  version: string;
  /** Execute an action programmatically via the component's onExecute callback */
  execute?: (entryId: EntryId, request: ExecuteRequest) => Promise<ExecutionResult>;
  /** Subscribe to entry state change events */
  subscribe?: (target: EntryId | '*', callback: LLMEntryEventCallback) => () => void;
}

declare global {
  interface Window {
    __ui_llm__?: UILLMWindowBridge;
  }
}

// ============================================================
// Discovery
// ============================================================

export interface UILLMDiscoveryMeta {
  version: string;
  capabilities?: LLMCapabilities;
}

/** Shape of /.well-known/ui-llm.json */
export interface UILLMWellKnown {
  version: string;
  /** List of paths/pages that support ui-llm */
  pages?: Array<{ path: string; description?: string }>;
  capabilities?: LLMCapabilities;
}

// ============================================================
// LLM Bridge Types (used by @ui-llm/playwright)
// ============================================================

export interface LLMBridgeRequest {
  manifest: UILLMManifest;
  instruction: string;
  /** Previous actions in this test for context continuity */
  history: LLMBridgeAction[];
}

export interface LLMBridgeAction {
  /** The entry ID to act upon */
  entryId: EntryId;
  /** What Playwright operation to perform */
  operation: 'click' | 'fill' | 'select' | 'check' | 'uncheck' | 'hover' | 'focus' | 'invoke';
  /** Value for fill/select operations */
  value?: string;
  /** The LLM's reasoning for choosing this action */
  reasoning: string;
  /** Parameters for invoke operations */
  params?: Record<string, string | number | boolean>;
}

export interface LLMBridgeAssertionResult {
  /** Whether the assertion passed */
  passed: boolean;
  /** The LLM's explanation */
  reasoning: string;
  /** Which entries were relevant to the assertion */
  relevantEntries: EntryId[];
}

export type LLMBridgeCustomProvider = (
  request: LLMBridgeRequest
) => Promise<LLMBridgeAction | LLMBridgeAction[]>;

export type LLMBridgeCustomAssertionProvider = (
  manifest: UILLMManifest,
  assertion: string
) => Promise<LLMBridgeAssertionResult>;

export interface LLMBridgeConfig {
  /** LLM provider */
  provider: 'openrouter' | LLMBridgeCustomProvider;
  /** API key (or read from OPENROUTER_API_KEY env) */
  apiKey?: string;
  /** Model to use (e.g., 'anthropic/claude-sonnet-4-20250514') */
  model?: string;
  /** Max tokens for response */
  maxTokens?: number;
  /** Temperature (lower = more deterministic, recommended: 0) */
  temperature?: number;
  /** Timeout per LLM call in ms */
  timeout?: number;
  /** Whether to log LLM reasoning to test output */
  verbose?: boolean;
  /** Custom assertion provider */
  assertionProvider?: LLMBridgeCustomAssertionProvider;
}
