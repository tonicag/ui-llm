import type {
  EntryId,
  LLMEntry,
  LLMActionEntry,
  LLMInputEntry,
  UILLMManifest,
  LLMScopeNode,
  ScopePath,
  OnExecuteCallback,
  ExecuteRequest,
  ExecutionResult,
  LLMEntryEvent,
  LLMEntryEventCallback,
  LLMRoute,
  LLMCurrentRoute,
  LLMCapabilities,
} from '@seam-ui/core';

export class LLMRegistry {
  private entries = new Map<EntryId, LLMEntry>();
  private listeners = new Set<() => void>();
  private dirty = true;
  private cachedManifest: UILLMManifest | null = null;
  private notificationScheduled = false;
  private _enableWarnings = true;

  // Protocol: Bidirectional execution
  private executeCallbacks = new Map<EntryId, OnExecuteCallback>();

  // Protocol: Event subscriptions
  private entryListeners = new Map<EntryId | '*', Set<LLMEntryEventCallback>>();

  // Protocol: Routes
  private routes: LLMRoute[] = [];
  private currentRoute: LLMCurrentRoute | undefined;

  // Protocol: Capabilities
  private capabilities: LLMCapabilities | undefined;

  set enableWarnings(value: boolean) {
    this._enableWarnings = value;
  }

  register(entry: LLMEntry): () => void {
    if (this._enableWarnings) {
      this.validateEntry(entry);
    }
    this.entries.set(entry.id, entry);
    this.markDirty();
    return () => {
      this.entries.delete(entry.id);
      this.executeCallbacks.delete(entry.id);
      this.markDirty();
      this.emitEntryEvent({
        entryId: entry.id,
        type: 'removed',
        timestamp: Date.now(),
      });
    };
  }

  private validateEntry(entry: LLMEntry): void {
    if (!entry.descriptor.description) {
      console.warn(
        `[seam-ui] Entry "${entry.descriptor.name}" (${entry.id}) has no description. ` +
        `LLMs rely on descriptions to understand what elements do.`
      );
    }

    const scopeKey = entry.scopePath.join('/');
    for (const existing of this.entries.values()) {
      if (
        existing.descriptor.name === entry.descriptor.name &&
        existing.scopePath.join('/') === scopeKey &&
        existing.id !== entry.id
      ) {
        console.warn(
          `[seam-ui] Duplicate name "${entry.descriptor.name}" in scope [${scopeKey || 'root'}]. ` +
          `This can confuse LLMs when resolving actions. ` +
          `Consider using unique names or different scopes.`
        );
        break;
      }
    }

    if (entry.kind === 'input' && entry.currentValue === undefined) {
      console.warn(
        `[seam-ui] Input "${entry.descriptor.name}" (${entry.id}) has no value. ` +
        `Pass a \`value\` prop to useLLMInput for accurate state tracking.`
      );
    }
  }

  // ============================================================
  // State Updates
  // ============================================================

  updateState(id: EntryId, patch: Partial<LLMEntry['state']>): void {
    const entry = this.entries.get(id);
    if (entry) {
      const previous = { ...entry.state };
      entry.state = { ...entry.state, ...patch };
      entry.lastUpdated = Date.now();
      this.markDirty();
      this.emitEntryEvent({
        entryId: id,
        type: 'stateChange',
        timestamp: entry.lastUpdated,
        previous,
        current: entry.state,
      });
    }
  }

  updateValue(id: EntryId, value: LLMInputEntry['currentValue']): void {
    const entry = this.entries.get(id);
    if (entry && entry.kind === 'input') {
      entry.currentValue = value;
      entry.lastUpdated = Date.now();
      this.markDirty();
      this.emitEntryEvent({
        entryId: id,
        type: 'valueChange',
        timestamp: entry.lastUpdated,
        value,
      });
    }
  }

  updateDescriptor(id: EntryId, descriptor: Partial<LLMEntry['descriptor']>): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.descriptor = { ...entry.descriptor, ...descriptor } as LLMEntry['descriptor'];
      entry.lastUpdated = Date.now();
      this.markDirty();
    }
  }

  // ============================================================
  // Bidirectional Execution
  // ============================================================

  registerExecuteCallback(id: EntryId, callback: OnExecuteCallback): () => void {
    this.executeCallbacks.set(id, callback);
    return () => this.executeCallbacks.delete(id);
  }

  async execute(id: EntryId, request: ExecuteRequest): Promise<ExecutionResult> {
    const callback = this.executeCallbacks.get(id);
    if (!callback) {
      return { status: 'error', error: `No execute callback registered for entry ${id}` };
    }
    try {
      const result = await callback(request);
      this.emitEntryEvent({
        entryId: id,
        type: 'stateChange',
        timestamp: Date.now(),
      });
      return result;
    } catch (err) {
      return { status: 'error', error: (err as Error).message };
    }
  }

  hasExecuteCallback(id: EntryId): boolean {
    return this.executeCallbacks.has(id);
  }

  // ============================================================
  // Routes
  // ============================================================

  setRoutes(routes: LLMRoute[]): void {
    this.routes = routes;
    this.markDirty();
  }

  setCurrentRoute(route: LLMCurrentRoute | undefined): void {
    this.currentRoute = route;
    this.markDirty();
  }

  // ============================================================
  // Capabilities
  // ============================================================

  setCapabilities(capabilities: LLMCapabilities | undefined): void {
    this.capabilities = capabilities;
    this.markDirty();
  }

  // ============================================================
  // Event Subscriptions
  // ============================================================

  subscribeToEntry(
    target: EntryId | '*',
    callback: LLMEntryEventCallback,
  ): () => void {
    let set = this.entryListeners.get(target);
    if (!set) {
      set = new Set();
      this.entryListeners.set(target, set);
    }
    set.add(callback);
    return () => {
      set!.delete(callback);
      if (set!.size === 0) this.entryListeners.delete(target);
    };
  }

  private emitEntryEvent(event: LLMEntryEvent): void {
    const specific = this.entryListeners.get(event.entryId);
    if (specific) specific.forEach(cb => cb(event));
    const wildcard = this.entryListeners.get('*');
    if (wildcard) wildcard.forEach(cb => cb(event));
  }

  // ============================================================
  // Manifest
  // ============================================================

  getManifest(): UILLMManifest {
    if (!this.dirty && this.cachedManifest) return this.cachedManifest;

    const entries = Array.from(this.entries.values());
    const scopeTree = this.buildScopeTree(entries);
    const actions = entries.filter((e): e is LLMActionEntry => e.kind === 'action');
    const inputs = entries.filter((e): e is LLMInputEntry => e.kind === 'input');

    this.cachedManifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      pageTitle: typeof document !== 'undefined' ? document.title : '',
      entries,
      scopeTree,
      summary: {
        totalActions: actions.length,
        totalInputs: inputs.length,
        visibleActions: actions.filter(a => a.state.visibility.visible).length,
        visibleInputs: inputs.filter(i => i.state.visibility.visible).length,
        enabledActions: actions.filter(a => a.state.enabled).length,
        scopes: scopeTree.length,
        capabilities: this.capabilities,
      },
      routes: this.routes.length > 0 ? this.routes : undefined,
      currentRoute: this.currentRoute,
    };

    this.dirty = false;
    return this.cachedManifest;
  }

  getEntry(id: EntryId): LLMEntry | undefined {
    return this.entries.get(id);
  }

  findEntries(query: { name?: string; scope?: string; kind?: 'action' | 'input' }): LLMEntry[] {
    return Array.from(this.entries.values()).filter(entry => {
      if (query.kind && entry.kind !== query.kind) return false;
      if (query.name && entry.descriptor.name !== query.name) return false;
      if (query.scope && !entry.scopePath.includes(query.scope)) return false;
      return true;
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get size(): number {
    return this.entries.size;
  }

  private markDirty(): void {
    this.dirty = true;
    this.cachedManifest = null;

    if (!this.notificationScheduled) {
      this.notificationScheduled = true;
      queueMicrotask(() => {
        this.notificationScheduled = false;
        this.listeners.forEach(fn => fn());
      });
    }
  }

  private buildScopeTree(entries: LLMEntry[]): LLMScopeNode[] {
    const rootNodes: LLMScopeNode[] = [];
    const nodeMap = new Map<string, LLMScopeNode>();

    for (const entry of entries) {
      const { scopePath } = entry;

      if (scopePath.length === 0) {
        let rootNode = nodeMap.get('__root__');
        if (!rootNode) {
          rootNode = {
            descriptor: { name: 'Root' },
            path: [],
            entries: [],
            children: [],
          };
          nodeMap.set('__root__', rootNode);
          rootNodes.push(rootNode);
        }
        rootNode.entries.push(entry.id);
        continue;
      }

      for (let depth = 0; depth < scopePath.length; depth++) {
        const pathKey = scopePath.slice(0, depth + 1).join('/');
        const parentKey = depth > 0 ? scopePath.slice(0, depth).join('/') : null;

        if (!nodeMap.has(pathKey)) {
          const node: LLMScopeNode = {
            descriptor: { name: scopePath[depth] },
            path: scopePath.slice(0, depth + 1),
            entries: [],
            children: [],
          };
          nodeMap.set(pathKey, node);

          if (parentKey) {
            nodeMap.get(parentKey)!.children.push(node);
          } else {
            rootNodes.push(node);
          }
        }
      }

      const leafKey = scopePath.join('/');
      nodeMap.get(leafKey)!.entries.push(entry.id);
    }

    return rootNodes;
  }
}
