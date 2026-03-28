import type {
  UILLMManifest,
  LLMBridgeConfig,
  LLMBridgeRequest,
  LLMBridgeAction,
  LLMBridgeAssertionResult,
} from '@ui-llm/core';
import { filterManifestForLLM } from './manifest-filter';

export class LLMBridge {
  constructor(private config: LLMBridgeConfig) {}

  async resolveAction(request: LLMBridgeRequest): Promise<LLMBridgeAction | LLMBridgeAction[]> {
    if (typeof this.config.provider === 'function') {
      return this.config.provider(request);
    }

    const systemPrompt = this.buildActionSystemPrompt();
    const userPrompt = this.buildActionUserPrompt(request);

    const response = await this.callLLM(systemPrompt, userPrompt);

    if (this.config.verbose) {
      console.log('[ui-llm] LLM action response:', response);
    }

    return this.parseActionResponse(response);
  }

  async resolveAssertion(
    manifest: UILLMManifest,
    assertion: string
  ): Promise<LLMBridgeAssertionResult> {
    if (this.config.assertionProvider) {
      return this.config.assertionProvider(manifest, assertion);
    }

    const systemPrompt = this.buildAssertionSystemPrompt();
    const userPrompt = this.buildAssertionUserPrompt(manifest, assertion);

    const response = await this.callLLM(systemPrompt, userPrompt);

    if (this.config.verbose) {
      console.log('[ui-llm] LLM assertion response:', response);
    }

    return this.parseAssertionResponse(response);
  }

  private buildActionSystemPrompt(): string {
    return `You are a UI automation assistant. You receive a manifest of UI elements with their current state, and a natural-language instruction. Your job is to determine which element(s) to interact with and what operation to perform.

RULES:
- Only interact with elements that are visible and enabled
- Use the scopePath to disambiguate elements with similar names
- For fill operations, extract the value from the instruction
- Return valid JSON matching the schema exactly
- If the instruction is ambiguous, pick the most likely match based on name, description, and scope
- For multi-step instructions (e.g., "fill in the form"), return an array of actions
- If no matching element is found, return an error action with reasoning explaining why
- If an action has "params" defined, you may use the "invoke" operation and provide params instead of multi-step UI interactions. This calls the component's native handler directly.
- Check "relations" to understand cause-and-effect between elements (e.g., a button with "submits" relation controls specific form inputs)
- Check "permission" to ensure you have the right capability for the action. Do not interact with "dangerZone" actions unless explicitly instructed.
- Check "routes" to know available navigation paths if the user asks to navigate
- Check "capabilities" to know what operations are allowed on this page

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "entryId": "string",
  "operation": "click" | "fill" | "select" | "check" | "uncheck" | "hover" | "focus" | "invoke",
  "value": "string (only for fill/select)",
  "params": { "key": "value (only for invoke)" },
  "reasoning": "string"
}

Or for multiple actions: [{ ... }, { ... }]`;
  }

  private buildActionUserPrompt(request: LLMBridgeRequest): string {
    const slim = filterManifestForLLM(request.manifest, {
      visibleOnly: true,
      enabledOnly: true,
    });

    return `## Current UI Manifest
${JSON.stringify(slim, null, 2)}

## Previous Actions in this Test
${request.history.length > 0 ? JSON.stringify(request.history, null, 2) : 'None'}

## Instruction
${request.instruction}`;
  }

  private buildAssertionSystemPrompt(): string {
    return `You are a UI test assertion evaluator. You receive a manifest of UI elements with their current state, and a natural-language assertion to evaluate.

Evaluate whether the assertion is TRUE or FALSE based on the manifest data.

Check:
- visibility (visible field)
- enabled/disabled (enabled field)
- loading (loading field)
- dynamic state (dynamicState)
- input values (currentValue) and validation state
- scope hierarchy (scopePath)
- semantic relations between entries (relations field)
- route information (routes, currentRoute)
- capabilities and permissions

Respond with ONLY valid JSON:
{
  "passed": true | false,
  "reasoning": "string explaining why",
  "relevantEntries": ["entry_id_1", "entry_id_2"]
}`;
  }

  private buildAssertionUserPrompt(manifest: UILLMManifest, assertion: string): string {
    const slim = filterManifestForLLM(manifest);

    return `## Current UI Manifest
${JSON.stringify(slim, null, 2)}

## Assertion to Evaluate
${assertion}`;
  }

  private async callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
    if (typeof this.config.provider !== 'string') {
      throw new Error('Custom provider should be handled before callLLM');
    }

    return this.callOpenRouter(systemPrompt, userPrompt);
  }

  private async callOpenRouter(system: string, user: string): Promise<string> {
    const apiKey = this.config.apiKey ?? process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not set. Set it in env or pass apiKey in config.');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model ?? 'anthropic/claude-sonnet-4-20250514',
        max_tokens: this.config.maxTokens ?? 1024,
        temperature: this.config.temperature ?? 0,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(this.config.timeout ?? 30_000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseActionResponse(raw: string): LLMBridgeAction | LLMBridgeAction[] {
    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) return JSON.parse(match[1].trim());
      throw new Error(`Failed to parse LLM action response: ${raw.slice(0, 500)}`);
    }
  }

  private parseAssertionResponse(raw: string): LLMBridgeAssertionResult {
    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) return JSON.parse(match[1].trim());
      throw new Error(`Failed to parse LLM assertion response: ${raw.slice(0, 500)}`);
    }
  }
}
