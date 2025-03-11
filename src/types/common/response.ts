// types/common/response.ts
/**
 * Base response type for all actions
 * This provides a consistent interface for all action responses
 */
export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}
