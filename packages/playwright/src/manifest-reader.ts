import type { Page } from '@playwright/test';
import type { UILLMManifest, LLMEntryEvent } from '@ui-llm/core';
import { UI_LLM_WINDOW_KEY, UI_LLM_META_NAME } from '@ui-llm/core';

export class ManifestReader {
  constructor(private page: Page) {}

  /** Check if the page declares ui-llm support via meta tag */
  async detectSupport(): Promise<{ supported: boolean; version?: string }> {
    try {
      const version = await this.page.evaluate((metaName: string) => {
        const meta = document.querySelector(`meta[name="${metaName}"]`);
        return meta?.getAttribute('content') ?? null;
      }, UI_LLM_META_NAME);

      return { supported: version !== null, version: version ?? undefined };
    } catch {
      return { supported: false };
    }
  }

  async read(): Promise<UILLMManifest> {
    await this.page.waitForFunction(
      (key: string) => (window as any)[key] !== undefined,
      UI_LLM_WINDOW_KEY,
      { timeout: 10_000 }
    );

    const manifest = await this.page.evaluate((key: string) => {
      const bridge = (window as any)[key];
      return bridge.getManifest();
    }, UI_LLM_WINDOW_KEY);

    if (!manifest) {
      throw new Error(
        'ui-llm manifest is empty. Ensure <LLMProvider> is mounted and components are registered.'
      );
    }

    return manifest as UILLMManifest;
  }

  /** Subscribe to entry state change events from the page */
  async subscribeToEvents(
    target: string,
    callback: (event: LLMEntryEvent) => void,
  ): Promise<() => Promise<void>> {
    const callbackName = `__ui_llm_event_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await this.page.exposeFunction(callbackName, callback);

    await this.page.evaluate(
      ({ key, target, callbackName }: { key: string; target: string; callbackName: string }) => {
        const bridge = (window as any)[key];
        if (bridge?.subscribe) {
          bridge.subscribe(target, (event: any) => {
            (window as any)[callbackName](event);
          });
        }
      },
      { key: UI_LLM_WINDOW_KEY, target, callbackName },
    );

    return async () => {
      // Cleanup is handled by page closure
    };
  }
}
