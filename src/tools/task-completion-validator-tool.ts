import type { TaskCompletionValidatorParams } from '../schemas/task-completion-validator';
import { taskCompletionValidatorOutputSchema } from '../schemas/task-completion-validator';
import { FileAttachmentService } from '../services/file-attachment';
import { makeApiRequest } from '../services/scrape-client';
import { createSimpleError } from '../utils/errors';
import { parseJsonSafely } from '../utils/json-extractor';
import {
  TASK_VALIDATION_SYSTEM_PROMPT,
  buildUserPrompt,
} from '../utils/prompt-templates';

interface ValidationOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performTaskCompletionValidation(
  params: TaskCompletionValidatorParams,
  options: ValidationOptions = {}
): Promise<{ content: string; structuredContent: object }> {
  const { sessionId, logger } = options;

  try {
    // Progress logging
    if (sessionId && logger) {
      await logger(
        'info',
        `Starting Carmack-grade task validation (Attempt ${params.attempt_number || 1})...`,
        sessionId
      );
    }

    // Process file attachments if present
    let filesContent = 'NO FILES PROVIDED';
    if (params.full_file_content_files && params.full_file_content_files.length > 0) {
      if (sessionId && logger) {
        await logger(
          'info',
          `Reading ${params.full_file_content_files.length} file(s) for analysis...`,
          sessionId
        );
      }

      const fileService = new FileAttachmentService();
      filesContent = await fileService.formatAttachments(params.full_file_content_files);
    }

    // Format focus sections if present
    let focusSectionsContent = 'NO FOCUS SECTIONS';
    if (params.focus_sections && params.focus_sections.length > 0) {
      focusSectionsContent = params.focus_sections
        .map((section, idx) => {
          return `### Section ${idx + 1}: ${section.section_name}
**File:** ${section.file}
**Lines:** ${section.start_line}-${section.end_line}
**Description:** ${section.description}`;
        })
        .join('\n\n');
    }

    // Build user prompt with all variables
    const userPrompt = buildUserPrompt({
      original_request: params.original_request,
      claimed_percentage: params.claimed_percentage,
      completion_claim: params.completion_claim,
      working_features: params.working_features,
      ...(params.non_working_features && { non_working_features: params.non_working_features }),
      ...(params.implemented_vs_requested && { implemented_vs_requested: params.implemented_vs_requested }),
      ...(params.feature_to_file_mapping && { feature_to_file_mapping: params.feature_to_file_mapping }),
      ...(params.blocking_issues && { blocking_issues: params.blocking_issues }),
      ...(params.resolution_strategies && { resolution_strategies: params.resolution_strategies }),
      ...(params.workarounds && { workarounds: params.workarounds }),
      ...(params.execution_proof && { execution_proof: params.execution_proof }),
      ...(params.api_responses && { api_responses: params.api_responses }),
      ...(params.database_verification && { database_verification: params.database_verification }),
      ...(params.error_logs && { error_logs: params.error_logs }),
      full_file_content_files: filesContent,
      focus_sections: focusSectionsContent,
      attempt_number: params.attempt_number || 1,
    });

    if (sessionId && logger) {
      await logger(
        'info',
        'Performing forensic code analysis with Grok (JSON mode, temp=0.05)...',
        sessionId
      );
    }

    // Call API with JSON mode enabled
    const apiParams = {
      deep_research_question: userPrompt,
      system_prompt: TASK_VALIDATION_SYSTEM_PROMPT,
      reasoning_effort: 'high' as const,
      temperature: 0.05, // Very low for consistent validation
      response_format: { type: 'json_object' as const },
      max_returned_urls: 0, // No web search needed for validation
    };

    const response = await makeApiRequest(apiParams);

    // Extract and parse JSON response
    const rawContent = response.choices?.[0]?.message?.content || '{}';
    const parsedJson = parseJsonSafely(rawContent);

    if (!parsedJson) {
      throw new Error('Failed to parse JSON response from validation');
    }

    // Validate against schema
    let validatedOutput;
    try {
      validatedOutput = taskCompletionValidatorOutputSchema.parse(parsedJson);
    } catch (schemaError: any) {
      // If schema validation fails, return what we can with error details
      if (sessionId && logger) {
        await logger(
          'error',
          `Schema validation failed: ${schemaError.message}`,
          sessionId
        );
      }

      // Return partial data with validation errors
      return {
        content: `Validation completed but output schema mismatch:\n\n${JSON.stringify(parsedJson, null, 2)}\n\nSchema errors: ${schemaError.message}`,
        structuredContent: {
          error: true,
          message: 'Schema validation failed',
          validation_errors: schemaError.errors || [],
          partial_data: parsedJson,
        },
      };
    }

    // Success - format human-readable content
    const humanReadable = formatValidationResult(validatedOutput);

    if (sessionId && logger) {
      const verdict = validatedOutput.ship_it ? '✅ APPROVED' : '❌ REJECTED';
      await logger(
        'info',
        `Validation complete: ${verdict} | ${validatedOutput.actual_percentage}% actual (${validatedOutput.claimed_percentage}% claimed) | Trust: ${(validatedOutput.trust_score * 100).toFixed(0)}%`,
        sessionId
      );
    }

    return {
      content: humanReadable,
      structuredContent: validatedOutput,
    };
  } catch (error) {
    const simpleError = createSimpleError(error);

    if (sessionId && logger) {
      await logger('error', simpleError.message, sessionId);
    }

    return {
      content: `Validation Error: ${simpleError.message}`,
      structuredContent: {
        error: true,
        code: simpleError.code,
        message: simpleError.message,
      },
    };
  }
}

/**
 * Format validation output for human readability
 */
function formatValidationResult(result: any): string {
  const { ship_it, severity, actual_percentage, claimed_percentage, trust_score } = result;

  let output = '# 🔬 CARMACK-GRADE CODE VALIDATION REPORT\n\n';

  // Verdict section
  output += '## 🎯 FINAL VERDICT\n\n';
  output += ship_it
    ? '✅ **SHIP IT** - Code meets Mars Rover standards\n'
    : '❌ **REJECT** - Critical issues must be fixed\n';
  output += `**Severity:** ${severity}\n`;
  output += `**Actual Completion:** ${actual_percentage}%\n`;
  output += `**Claimed Completion:** ${claimed_percentage}%\n`;
  output += `**Trust Score:** ${(trust_score * 100).toFixed(0)}% (${trust_score >= 0.8 ? 'Honest' : 'Exaggerated'})\n\n`;

  // Working features validation
  output += '## ✅ FEATURE VALIDATION\n\n';
  output += `**Claimed Working:** ${result.working_features_validated.claimed_working.length}\n`;
  output += `**Actually Working:** ${result.working_features_validated.actually_working.length}\n`;
  output += `**False Claims:** ${result.working_features_validated.false_claims.length}\n\n`;

  if (result.working_features_validated.false_claims.length > 0) {
    output += '**❌ Features Falsely Claimed:**\n';
    for (const feature of result.working_features_validated.false_claims) {
      output += `- ${feature}\n`;
    }
    output += '\n';
  }

  // Code inspection summary
  output += '## 🔍 CODE INSPECTION SUMMARY\n\n';
  output += `**Files Analyzed:** ${result.code_inspection.files_analyzed}\n`;
  output += `**Total Lines:** ${result.code_inspection.total_lines_analyzed.toLocaleString()}\n`;
  output += `**Stub Functions:** ${result.code_inspection.stub_functions.length}\n`;
  output += `**Missing Error Handling:** ${result.code_inspection.missing_error_handling.length}\n\n`;

  // Critical failures
  if (result.critical_failures.length > 0) {
    output += `## 🚨 CRITICAL FAILURES (${result.critical_failures.length})\n\n`;
    for (const failure of result.critical_failures.slice(0, 5)) {
      output += `### ${failure.failure_id}: ${failure.issue}\n`;
      output += `**Severity:** ${failure.severity}\n`;
      output += `**Location:** ${failure.location}\n`;
      if (failure.root_cause) {
        output += `**Root Cause:** ${failure.root_cause}\n`;
      }
      output += '\n';
    }
    if (result.critical_failures.length > 5) {
      output += `*...and ${result.critical_failures.length - 5} more failures. See structured output for full list.*\n\n`;
    }
  }

  // Next fix priority
  output += '## 🔧 #1 PRIORITY FIX\n\n';
  output += `**What:** ${result.next_fix.what}\n`;
  output += `**Where:** ${result.next_fix.where}\n`;
  output += `**Why Critical:** ${result.next_fix.why_most_critical}\n`;
  if (result.next_fix.estimated_time) {
    output += `**Time Estimate:** ${result.next_fix.estimated_time}\n`;
  }
  output += '\n';

  // Quality metrics
  output += '## 📊 QUALITY METRICS\n\n';
  output += `**Code Quality:** ${result.quality_verdict.code_quality}\n`;
  output += `**Error Handling:** ${result.quality_verdict.error_handling}\n`;
  output += `**Logging:** ${result.quality_verdict.logging_observability}\n\n`;

  // Behavioral analysis
  output += '## 🧠 BEHAVIORAL ANALYSIS\n\n';
  output += `**Recommendation:** ${result.behavioral_analysis.recommendation}\n`;
  output += `**Patterns Detected:** ${result.behavioral_analysis.patterns_detected.join(', ')}\n\n`;

  // Deception patterns if any
  if (result.deception_patterns.length > 0) {
    output += '## ⚠️ DECEPTION PATTERNS\n\n';
    output += result.deception_patterns.map((p: string) => `- ${p}`).join('\n');
    output += '\n\n';
  }

  // Technical debt
  output += '## 💸 TECHNICAL DEBT\n\n';
  output += `**Risk Level:** ${result.technical_debt.risk_level}\n`;
  output += `**Total Hours to Fix:** ${result.technical_debt.total_hours_to_fix}\n\n`;

  // Detailed report
  output += '## 📝 DETAILED ANALYSIS\n\n';
  output += result.detailed_report;
  output += '\n\n---\n\n';
  output += '*For complete data including all fixes and recommendations, see structured JSON output.*\n';

  return output;
}
