import type { LLMCapabilities } from './types';

export const SEAM_VERSION = '0.1.0';
export const SEAM_WINDOW_KEY = '__seam__' as const;
export const SEAM_DATA_ATTRIBUTE = 'data-seam-id';
export const SEAM_SCOPE_ATTRIBUTE = 'data-seam-scope';

export const SEAM_META_NAME = 'seam-ui' as const;
export const SEAM_PROTOCOL_VERSION = '1.0.0' as const;
export const SEAM_WELL_KNOWN_PATH = '/.well-known/seam-ui.json' as const;

export const SEAM_DEFAULT_CAPABILITIES: LLMCapabilities = {
  read: true,
  execute: true,
  navigate: true,
  fillInputs: true,
  dangerZone: false,
};
