import { loggingClient } from './loggingClient';

// Event categories
export type EventCategory = 
  | 'auth' 
  | 'extraction' 
  | 'report' 
  | 'step' 
  | 'image' 
  | 'autosave' 
  | 'pdf' 
  | 'error';

// Event types
export type EventType =
  // Auth events
  | 'login_success'
  | 'login_failure'
  | 'logout'
  // Data extraction events
  | 'extraction_started'
  | 'extraction_success'
  | 'extraction_failed'
  // Report creation events
  | 'report_creation_started'
  | 'report_creation_in_progress'
  | 'report_creation_completed'
  // Step navigation events
  | 'step_entered'
  | 'step_verified'
  | 'step_skipped'
  | 'step_completed'
  // Image events
  | 'image_uploaded'
  | 'image_deleted'
  // Auto-save events
  | 'autosave_triggered'
  | 'autosave_success'
  | 'autosave_failed'
  // PDF events
  | 'pdf_generation_started'
  | 'pdf_generation_success'
  | 'pdf_upload_success'
  | 'pdf_generation_failed'
  | 'pdf_preview_opened'
  | 'pdf_downloaded'
  // Library events
  | 'library_client_selected'
  | 'library_date_selected'
  | 'report_opened_for_editing'
  // Error events
  | 'frontend_error'
  | 'backend_error';

export interface LogEvent {
  username: string;
  event_type: EventType | string; // Allow dynamic event types like step_1_entered
  event_category: EventCategory;
  event_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  report_id?: string;
  step_number?: number;
  section_name?: string;
  error_code?: string;
  error_message?: string;
  stack_trace?: string;
}

class LoggingService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async log(event: LogEvent): Promise<void> {
    try {
      // Skip logging if client is not configured
      if (!loggingClient) {
        console.warn('Logging client not configured. Skipping log.');
        return;
      }

      const logEntry = {
        ...event,
        session_id: event.session_id || this.sessionId,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      };

      const { error } = await loggingClient
        .from('user_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Failed to log event:', error);
      }
    } catch (error) {
      console.error('Logging error:', error);
    }
  }

  // Auth events
  async logLoginSuccess(username: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'login_success',
      event_category: 'auth',
      event_details: details,
    });
  }

  async logLoginFailure(username: string, errorMessage: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'login_failure',
      event_category: 'auth',
      error_message: errorMessage,
      event_details: details,
    });
  }

  async logLogout(username: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'logout',
      event_category: 'auth',
      event_details: details,
    });
  }

  // Data extraction events
  async logExtractionStarted(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'extraction_started',
      event_category: 'extraction',
      report_id: reportId,
      event_details: details,
    });
  }

  async logExtractionSuccess(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'extraction_success',
      event_category: 'extraction',
      report_id: reportId,
      event_details: details,
    });
  }

  async logExtractionFailed(username: string, reportId: string, errorMessage: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'extraction_failed',
      event_category: 'extraction',
      report_id: reportId,
      error_message: errorMessage,
      event_details: details,
    });
  }

  // Report creation events
  async logReportCreationStarted(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'report_creation_started',
      event_category: 'report',
      report_id: reportId,
      event_details: details,
    });
  }

  async logReportCreationInProgress(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'report_creation_in_progress',
      event_category: 'report',
      report_id: reportId,
      event_details: details,
    });
  }

  async logReportCreationCompleted(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'report_creation_completed',
      event_category: 'report',
      report_id: reportId,
      event_details: details,
    });
  }

  // Step navigation events
  async logStepEntered(username: string, reportId: string, stepNumber: number, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: `step_${stepNumber}_entered`,
      event_category: 'step',
      report_id: reportId,
      step_number: stepNumber,
      event_details: details,
    });
  }

  async logStepVerified(username: string, reportId: string, stepNumber: number, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: `step_${stepNumber}_verified`,
      event_category: 'step',
      report_id: reportId,
      step_number: stepNumber,
      event_details: details,
    });
  }

  async logStepSkipped(username: string, reportId: string, stepNumber: number, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: `step_${stepNumber}_skipped`,
      event_category: 'step',
      report_id: reportId,
      step_number: stepNumber,
      event_details: details,
    });
  }

  async logStepCompleted(username: string, reportId: string, stepNumber: number, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: `step_${stepNumber}_completed`,
      event_category: 'step',
      report_id: reportId,
      step_number: stepNumber,
      event_details: details,
    });
  }

  // Image events
  async logImageUploaded(
    username: string,
    reportId: string,
    stepNumber: number,
    sectionName: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'image_uploaded',
      event_category: 'image',
      report_id: reportId,
      step_number: stepNumber,
      section_name: sectionName,
      event_details: details,
    });
  }

  async logImageDeleted(
    username: string,
    reportId: string,
    stepNumber: number,
    sectionName: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'image_deleted',
      event_category: 'image',
      report_id: reportId,
      step_number: stepNumber,
      section_name: sectionName,
      event_details: details,
    });
  }

  // Auto-save events
  async logAutosaveTriggered(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'autosave_triggered',
      event_category: 'autosave',
      report_id: reportId,
      event_details: details,
    });
  }

  async logAutosaveSuccess(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'autosave_success',
      event_category: 'autosave',
      report_id: reportId,
      event_details: details,
    });
  }

  async logAutosaveFailed(username: string, reportId: string, errorMessage: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'autosave_failed',
      event_category: 'autosave',
      report_id: reportId,
      error_message: errorMessage,
      event_details: details,
    });
  }

  // PDF events
  async logPdfGenerationStarted(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'pdf_generation_started',
      event_category: 'pdf',
      report_id: reportId,
      event_details: details,
    });
  }

  async logPdfGenerationSuccess(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'pdf_generation_success',
      event_category: 'pdf',
      report_id: reportId,
      event_details: details,
    });
  }

  async logPdfUploadSuccess(username: string, reportId: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'pdf_upload_success',
      event_category: 'pdf',
      report_id: reportId,
      event_details: details,
    });
  }

  async logPdfGenerationFailed(username: string, reportId: string, errorMessage: string, details?: Record<string, any>) {
    await this.log({
      username,
      event_type: 'pdf_generation_failed',
      event_category: 'pdf',
      report_id: reportId,
      error_message: errorMessage,
      event_details: details,
    });
  }

  // Error events
  async logFrontendError(
    username: string,
    errorCode: string,
    errorMessage: string,
    stackTrace?: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'frontend_error',
      event_category: 'error',
      error_code: errorCode,
      error_message: errorMessage,
      stack_trace: stackTrace,
      event_details: details,
    });
  }

  async logBackendError(
    username: string,
    errorCode: string,
    errorMessage: string,
    stackTrace?: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'backend_error',
      event_category: 'error',
      error_code: errorCode,
      error_message: errorMessage,
      stack_trace: stackTrace,
      event_details: details,
    });
  }

  // ============================================
  // Library Events
  // ============================================

  async logLibraryClientSelected(
    username: string,
    clientName: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'library_client_selected',
      event_category: 'report',
      report_id: clientName,
      event_details: details,
    });
  }

  async logLibraryDateSelected(
    username: string,
    clientName: string,
    date: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'library_date_selected',
      event_category: 'report',
      report_id: clientName,
      event_details: { ...details, date },
    });
  }

  async logReportOpenedForEditing(
    username: string,
    reportId: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'report_opened_for_editing',
      event_category: 'report',
      report_id: reportId,
      event_details: details,
    });
  }

  async logPdfPreviewOpened(
    username: string,
    fileName: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'pdf_preview_opened',
      event_category: 'pdf',
      report_id: fileName,
      event_details: details,
    });
  }

  async logPdfDownloaded(
    username: string,
    fileName: string,
    details?: Record<string, any>
  ) {
    await this.log({
      username,
      event_type: 'pdf_downloaded',
      event_category: 'pdf',
      report_id: fileName,
      event_details: details,
    });
  }

  // Utility method for custom events
  async logCustomEvent(event: LogEvent) {
    await this.log(event);
  }

  // Get new session ID (call this on login)
  resetSession() {
    this.sessionId = this.generateSessionId();
  }

  getCurrentSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
export const logger = new LoggingService();
