import type {
  UILLMManifest,
  LLMEntry,
  LLMActionEntry,
  LLMInputEntry,
  LLMCapabilities,
  LLMRelation,
} from '@seam-ui/core';

interface FilterOptions {
  /** Only include visible entries */
  visibleOnly?: boolean;
  /** Only include enabled entries */
  enabledOnly?: boolean;
}

interface SlimRelation {
  type: string;
  targetId: string;
  description?: string;
}

interface SlimActionEntry {
  id: string;
  kind: 'action';
  name: string;
  description: string;
  group?: string;
  scopePath: readonly string[];
  visible: boolean;
  enabled: boolean;
  loading: boolean;
  dynamicState: Record<string, unknown>;
  shortcut?: string;
  params?: Record<string, { type: string; description: string; enum?: unknown[]; required?: boolean }>;
  relations?: SlimRelation[];
  permission?: string;
}

interface SlimInputEntry {
  id: string;
  kind: 'input';
  name: string;
  description: string;
  inputType: string;
  scopePath: readonly string[];
  visible: boolean;
  enabled: boolean;
  loading: boolean;
  currentValue: string | boolean | number | string[];
  placeholder: string | null;
  options?: Array<{ value: string; label: string }>;
  validation: {
    required: boolean;
    valid: boolean;
    validationMessage: string | null;
  };
  dynamicState: Record<string, unknown>;
  relations?: SlimRelation[];
  permission?: string;
}

type SlimEntry = SlimActionEntry | SlimInputEntry;

export interface SlimManifest {
  version: string;
  pageUrl: string;
  pageTitle: string;
  entries: SlimEntry[];
  summary: UILLMManifest['summary'];
  routes?: Array<{ path: string; name: string; description: string }>;
  currentRoute?: { path: string; name: string };
  capabilities?: LLMCapabilities;
}

function slimRelations(relations?: LLMRelation[]): SlimRelation[] | undefined {
  if (!relations || relations.length === 0) return undefined;
  return relations.map(r => ({
    type: r.type,
    targetId: r.targetId,
    description: r.description,
  }));
}

function slimAction(entry: LLMActionEntry): SlimActionEntry {
  return {
    id: entry.id,
    kind: 'action',
    name: entry.descriptor.name,
    description: entry.descriptor.description,
    group: entry.descriptor.group,
    scopePath: entry.scopePath,
    visible: entry.state.visibility.visible,
    enabled: entry.state.enabled,
    loading: entry.state.loading,
    dynamicState: entry.state.dynamicState,
    shortcut: entry.descriptor.shortcut,
    params: entry.descriptor.params ? Object.fromEntries(
      Object.entries(entry.descriptor.params).map(([k, v]) => [k, {
        type: v.type,
        description: v.description,
        enum: v.enum,
        required: v.required,
      }])
    ) : undefined,
    relations: slimRelations(entry.descriptor.relations),
    permission: entry.permission,
  };
}

function slimInput(entry: LLMInputEntry): SlimInputEntry {
  return {
    id: entry.id,
    kind: 'input',
    name: entry.descriptor.name,
    description: entry.descriptor.description,
    inputType: entry.descriptor.inputType,
    scopePath: entry.scopePath,
    visible: entry.state.visibility.visible,
    enabled: entry.state.enabled,
    loading: entry.state.loading,
    currentValue: entry.currentValue,
    placeholder: entry.placeholder,
    options: entry.options?.map(o => ({ value: o.value, label: o.label })),
    validation: {
      required: entry.validation.required,
      valid: entry.validation.valid,
      validationMessage: entry.validation.validationMessage,
    },
    dynamicState: entry.state.dynamicState,
    relations: slimRelations(entry.descriptor.relations),
    permission: entry.permission,
  };
}

/**
 * Create a slim version of the manifest optimized for LLM consumption.
 * Strips internal fields (selectors, data attributes, timestamps, tag names, roles)
 * and flattens nested structures to reduce token usage.
 */
export function filterManifestForLLM(
  manifest: UILLMManifest,
  options: FilterOptions = {},
): SlimManifest {
  const { visibleOnly = false, enabledOnly = false } = options;

  let entries: LLMEntry[] = [...manifest.entries];

  if (visibleOnly) {
    entries = entries.filter(e => e.state.visibility.visible);
  }
  if (enabledOnly) {
    entries = entries.filter(e => e.state.enabled);
  }

  const slimEntries: SlimEntry[] = entries.map(e =>
    e.kind === 'action' ? slimAction(e) : slimInput(e as LLMInputEntry)
  );

  return {
    version: manifest.version,
    pageUrl: manifest.pageUrl,
    pageTitle: manifest.pageTitle,
    entries: slimEntries,
    summary: manifest.summary,
    routes: manifest.routes?.map(r => ({
      path: r.path,
      name: r.name,
      description: r.description,
    })),
    currentRoute: manifest.currentRoute
      ? { path: manifest.currentRoute.path, name: manifest.currentRoute.name }
      : undefined,
    capabilities: manifest.summary.capabilities,
  };
}
