import type { Page } from '@playwright/test';
import type { LLMBridgeAction, ExecutionResult } from '@ui-llm/core';
import { UI_LLM_DATA_ATTRIBUTE, UI_LLM_WINDOW_KEY } from '@ui-llm/core';

export class ActionExecutionError extends Error {
  constructor(
    message: string,
    public readonly action: LLMBridgeAction,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'ActionExecutionError';
  }
}

export class ActionExecutor {
  constructor(private page: Page) {}

  /** Attempt bridge-level execution via window.__ui_llm__.execute() */
  async executeBridge(action: LLMBridgeAction): Promise<ExecutionResult | null> {
    const result = await this.page.evaluate(
      ({ key, entryId, operation, value, params }: {
        key: string;
        entryId: string;
        operation: string;
        value?: string;
        params?: Record<string, string | number | boolean>;
      }) => {
        const bridge = (window as any)[key];
        if (!bridge?.execute) return null;
        return bridge.execute(entryId, { operation, value, params });
      },
      {
        key: UI_LLM_WINDOW_KEY,
        entryId: action.entryId,
        operation: action.operation,
        value: action.value,
        params: action.params,
      },
    );

    return result as ExecutionResult | null;
  }

  async execute(action: LLMBridgeAction): Promise<ExecutionResult | undefined> {
    // For 'invoke' operations, always use bridge execution
    if (action.operation === 'invoke') {
      const result = await this.executeBridge(action);
      if (!result || result.status === 'error') {
        throw new ActionExecutionError(
          `Bridge invoke failed: ${result?.error ?? 'No execute callback registered for this entry'}\n` +
          `Action: invoke on "${action.entryId}"\n` +
          `LLM reasoning: ${action.reasoning}`,
          action,
        );
      }
      return result;
    }

    // Try bridge execution first for all operations
    const bridgeResult = await this.executeBridge(action);
    if (bridgeResult && bridgeResult.status !== 'error') {
      return bridgeResult;
    }

    // Fallback to DOM-based execution
    const selector = `[${UI_LLM_DATA_ATTRIBUTE}="${action.entryId}"]`;
    const locator = this.page.locator(selector);

    try {
      await locator.waitFor({ state: 'visible', timeout: 5_000 });
    } catch (err) {
      throw new ActionExecutionError(
        `Element not found or not visible: ${selector}\n` +
        `Action: ${action.operation} on "${action.entryId}"\n` +
        `LLM reasoning: ${action.reasoning}`,
        action,
        err as Error,
      );
    }

    try {
      switch (action.operation) {
        case 'click':
          await locator.click();
          break;
        case 'fill':
          if (action.value === undefined) throw new Error('fill requires a value');
          await locator.fill(action.value);
          break;
        case 'select':
          if (action.value === undefined) throw new Error('select requires a value');
          await locator.selectOption(action.value);
          break;
        case 'check':
          await locator.check();
          break;
        case 'uncheck':
          await locator.uncheck();
          break;
        case 'hover':
          await locator.hover();
          break;
        case 'focus':
          await locator.focus();
          break;
        default:
          throw new Error(`Unknown operation: ${action.operation}`);
      }
    } catch (err) {
      if (err instanceof ActionExecutionError) throw err;
      throw new ActionExecutionError(
        `Failed to execute ${action.operation} on ${selector}\n` +
        `LLM reasoning: ${action.reasoning}\n` +
        `Error: ${(err as Error).message}`,
        action,
        err as Error,
      );
    }

    // Allow time for React state to settle
    await this.page.waitForTimeout(100);
    return undefined;
  }
}
