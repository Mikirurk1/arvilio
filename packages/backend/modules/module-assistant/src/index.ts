export { AssistantModule } from './assistant.module';
export { AssistantService } from './application/assistant.service';
export { LlmSettingsService } from './application/llm-settings.service';
export {
  testLlmConnection,
  type LlmTestResult,
  type LlmTestTarget,
} from './application/llm-connection-test';
export type {
  AssistantChatInput,
  AssistantSseEvent,
  ChatHistoryItem,
} from './application/assistant.service';
export {
  detectRefusal,
  refusalMessage,
  ACADEMIC_REFUSAL_MESSAGE,
} from './domain/academic-refusal';
export {
  ROLE_NAV_ALLOWLIST,
  isNavAllowedForRole,
  rolePolicyPrompt,
  type AssistantRole,
} from './domain/role-policy';
export {
  retrieveHelpChunks,
  visibleChunks,
  roleToAudience,
} from './infrastructure/corpus/retrieve-help';
export { ASSISTANT_CORPUS } from './infrastructure/corpus/assistant-corpus';
