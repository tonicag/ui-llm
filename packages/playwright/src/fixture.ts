import { test as base, type Locator } from '@playwright/test';
import type { UILLMManifest, LLMBridgeConfig, LLMBridgeAction, ExecutionResult } from '@ui-llm/core';
import { UI_LLM_DATA_ATTRIBUTE } from '@ui-llm/core';
import { LLMBridge } from './llm-bridge';
import { ManifestReader } from './manifest-reader';
import { ActionExecutor, ActionExecutionError } from './executor';

export interface LLMTestHelper {
  /**
   * Execute a natural-language instruction against the page.
   * Retries once on failure with error context appended.
   */
  do: (instruction: string) => Promise<void>;

  /**
   * Assert a condition using natural language.
   */
  expect: (assertion: string) => Promise<void>;

  /**
   * Assert a condition using natural language. Logs a warning instead of failing.
   */
  expectSoft: (assertion: string) => Promise<boolean>;

  /**
   * Get the current manifest from the page.
   */
  getManifest: () => Promise<UILLMManifest>;

  /**
   * Find an entry by natural language description.
   * Returns the Playwright locator for it.
   */
  find: (description: string) => Promise<Locator>;

  /**
   * Execute multiple natural-language instructions in sequence.
   */
  sequence: (instructions: string[]) => Promise<void>;

  /**
   * Navigate to a declared route by name.
   *
   * @example
   * await llm.navigate('Settings');
   * await llm.navigate('User Profile', { id: '123' });
   */
  navigate: (routeName: string, params?: Record<string, string>) => Promise<void>;

  /**
   * Execute an action via bridge with params (direct invocation).
   *
   * @example
   * await llm.invoke('Dark Mode Toggle', { enabled: true });
   */
  invoke: (description: string, params?: Record<string, unknown>) => Promise<ExecutionResult>;

  /**
   * Check if ui-llm is supported on the current page.
   */
  detectSupport: () => Promise<{ supported: boolean; version?: string }>;
}

export interface LLMFixtureConfig {
  llmConfig: LLMBridgeConfig;
}

function formatManifestSummary(manifest: UILLMManifest): string {
  const entries = manifest.entries.map(e => {
    const vis = e.state.visibility.visible ? 'visible' : 'hidden';
    const en = e.state.enabled ? 'enabled' : 'disabled';
    const scope = e.scopePath.length > 0 ? ` [${e.scopePath.join(' > ')}]` : '';
    return `  - ${e.descriptor.name} (${e.kind}, ${vis}, ${en})${scope}`;
  });
  return `Page: ${manifest.pageTitle} (${manifest.pageUrl})\n` +
    `Actions: ${manifest.summary.totalActions} (${manifest.summary.visibleActions} visible, ${manifest.summary.enabledActions} enabled)\n` +
    `Inputs: ${manifest.summary.totalInputs} (${manifest.summary.visibleInputs} visible)\n` +
    `Entries:\n${entries.join('\n')}`;
}

export const test = base.extend<{ llm: LLMTestHelper } & LLMFixtureConfig>({
  llmConfig: [
    {
      provider: 'openrouter',
      model: 'anthropic/claude-sonnet-4-20250514',
      temperature: 0,
      timeout: 30_000,
      verbose: false,
    },
    { option: true },
  ],

  llm: async ({ page, llmConfig }, use) => {
    const bridge = new LLMBridge(llmConfig);
    const reader = new ManifestReader(page);
    const executor = new ActionExecutor(page);
    const history: LLMBridgeAction[] = [];

    const log = (...args: unknown[]) => {
      if (llmConfig.verbose) console.log('[ui-llm]', ...args);
    };

    const executeAction = async (instruction: string, retryCount = 0): Promise<void> => {
      await page.waitForLoadState('domcontentloaded');
      const manifest = await reader.read();
      const actions = await bridge.resolveAction({ manifest, instruction, history });
      const actionList = Array.isArray(actions) ? actions : [actions];

      for (const action of actionList) {
        log(`Executing: ${action.operation} on ${action.entryId} — ${action.reasoning}`);
        try {
          await executor.execute(action);
          history.push(action);
        } catch (err) {
          if (retryCount > 0) {
            const manifest2 = await reader.read();
            throw new Error(
              `ui-llm action failed after retry.\n\n` +
              `Instruction: "${instruction}"\n\n` +
              `Failed action: ${action.operation} on ${action.entryId}\n` +
              `LLM reasoning: ${action.reasoning}\n` +
              `Error: ${(err as Error).message}\n\n` +
              `Current manifest state:\n${formatManifestSummary(manifest2)}`
            );
          }

          log(`Action failed, retrying with error context...`);
          const errorContext = err instanceof ActionExecutionError
            ? `The previous attempt failed: ${err.message}`
            : `The previous attempt failed: ${(err as Error).message}`;

          await executeAction(
            `${instruction}\n\nIMPORTANT CONTEXT: ${errorContext}. Please choose a different element or approach.`,
            retryCount + 1,
          );
          return;
        }
      }
    };

    const helper: LLMTestHelper = {
      do: async (instruction: string) => {
        await executeAction(instruction);
      },

      expect: async (assertion: string) => {
        await page.waitForLoadState('domcontentloaded');
        const manifest = await reader.read();

        log(`Evaluating assertion: "${assertion}"`);
        const result = await bridge.resolveAssertion(manifest, assertion);
        log(`Assertion result: ${result.passed ? 'PASS' : 'FAIL'} — ${result.reasoning}`);

        if (!result.passed) {
          throw new Error(
            `ui-llm assertion failed: "${assertion}"\n\n` +
            `Reasoning: ${result.reasoning}\n` +
            `Relevant entries: ${result.relevantEntries.join(', ')}\n\n` +
            `Current manifest state:\n${formatManifestSummary(manifest)}`
          );
        }
      },

      expectSoft: async (assertion: string) => {
        await page.waitForLoadState('domcontentloaded');
        const manifest = await reader.read();

        log(`Evaluating soft assertion: "${assertion}"`);
        const result = await bridge.resolveAssertion(manifest, assertion);

        if (!result.passed) {
          console.warn(
            `[ui-llm] Soft assertion warning: "${assertion}"\n` +
            `Reasoning: ${result.reasoning}`
          );
        }

        return result.passed;
      },

      getManifest: async () => {
        return reader.read();
      },

      find: async (description: string) => {
        const manifest = await reader.read();
        const action = await bridge.resolveAction({
          manifest,
          instruction: `Find the element: ${description}`,
          history: [],
        });
        const resolved = Array.isArray(action) ? action[0] : action;
        const entry = manifest.entries.find(e => e.id === resolved.entryId);
        if (!entry) {
          throw new Error(
            `Could not find element matching: "${description}"\n\n` +
            `LLM chose entryId "${resolved.entryId}" but it doesn't exist in the manifest.\n` +
            `Available entries:\n${manifest.entries.map(e => `  - ${e.id}: ${e.descriptor.name}`).join('\n')}`
          );
        }
        return page.locator(`[${UI_LLM_DATA_ATTRIBUTE}="${entry.dataAttribute}"]`);
      },

      sequence: async (instructions: string[]) => {
        for (const instruction of instructions) {
          await helper.do(instruction);
        }
      },

      navigate: async (routeName: string, params?: Record<string, string>) => {
        const manifest = await reader.read();
        const route = manifest.routes?.find(r => r.name === routeName);
        if (!route) {
          const available = manifest.routes?.map(r => r.name).join(', ') ?? 'none';
          throw new Error(
            `Route "${routeName}" not found. Available routes: ${available}`
          );
        }
        let path = route.path;
        if (params) {
          for (const [key, value] of Object.entries(params)) {
            path = path.replace(`:${key}`, value);
          }
        }
        const baseUrl = new URL(manifest.pageUrl).origin;
        await page.goto(`${baseUrl}${path}`);
      },

      invoke: async (description: string, params?: Record<string, unknown>) => {
        const manifest = await reader.read();
        const action = await bridge.resolveAction({
          manifest,
          instruction: `Find the element: ${description}. Use the invoke operation with the provided params.`,
          history,
        });
        const resolved = Array.isArray(action) ? action[0] : action;
        resolved.operation = 'invoke';
        if (params) resolved.params = params as Record<string, string | number | boolean>;

        log(`Invoking: ${resolved.entryId} with params:`, params);
        const result = await executor.execute(resolved);
        if (result) return result;
        return { status: 'success' as const };
      },

      detectSupport: () => reader.detectSupport(),
    };

    await use(helper);
  },
});

export { expect } from '@playwright/test';
