/**
 * Simplified Task Completion Validator Tool
 * Optimized for reliable LLM JSON generation
 */

import type { SimpleValidatorParams } from '../schemas/task-completion-validator-simple';
import { simpleValidatorOutputSchema } from '../schemas/task-completion-validator-simple';
import { FileAttachmentService } from '../services/file-attachment';
import { makeApiRequest } from '../services/scrape-client';
import { createSimpleError } from '../utils/errors';
import { extractJson } from '../utils/json-extractor';
import {
  SIMPLE_VALIDATION_SYSTEM_PROMPT,
  buildSimpleUserPrompt,
} from '../utils/prompt-templates-simple';

export interface ValidationOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

/**
 * Perform simplified Carmack-grade task completion validation
 */
export async function performSimpleTaskValidation(
  params: SimpleValidatorParams,
  options: ValidationOptions = {}
): Promise<{ content: string; structuredContent: object }> {
  const { sessionId, logger } = options;

  try {
    if (sessionId && logger) {
      await logger('info', `Starting task validation (attempt ${params.attempt_number})`, sessionId);
    }

    // Process file attachments if provided
    let filesContent = 'No files provided for analysis';
    if (params.full_file_content_files && params.full_file_content_files.length > 0) {
      const fileService = new FileAttachmentService();
      filesContent = await fileService.formatAttachments(params.full_file_content_files);
      
      if (sessionId && logger) {
        await logger('info', `Analyzed ${params.full_file_content_files.length} files`, sessionId);
      }
    }

    // Build the user prompt with proper optional handling
    const userPrompt = buildSimpleUserPrompt({
      original_request: params.original_request,
      claimed_percentage: params.claimed_percentage,
      completion_claim: params.completion_claim,
      working_features: params.working_features,
      ...(params.non_working_features && { non_working_features: params.non_working_features }),
      full_file_content_files: filesContent,
      ...(params.execution_proof && { execution_proof: params.execution_proof }),
      ...(params.error_logs && { error_logs: params.error_logs }),
      attempt_number: params.attempt_number,
    });

    if (sessionId && logger) {
      await logger('info', 'Sending validation request to LLM', sessionId);
    }

    // Make API request with JSON mode
    const response = await makeApiRequest({
      deep_research_question: userPrompt,
      system_prompt: SIMPLE_VALIDATION_SYSTEM_PROMPT,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      reasoning_effort: 'high',
      max_returned_urls: 0, // No web search needed for code validation
    });

    if (sessionId && logger) {
      await logger('info', 'Received validation response', sessionId);
    }

    // Extract and parse JSON
    const rawContent = response.choices?.[0]?.message?.content || '{}';
    const extractedJson = extractJson(rawContent);
    
    let parsedJson: any;
    try {
      parsedJson = JSON.parse(extractedJson);
    } catch (parseError) {
      if (sessionId && logger) {
        await logger('error', `JSON parse error: ${parseError}`, sessionId);
      }
      
      return {
        content: `Validation Error: LLM returned invalid JSON\n\nRaw response:\n${rawContent}`,
        structuredContent: {
          error: true,
          message: 'Invalid JSON response from LLM',
          raw_response: rawContent,
        },
      };
    }

    // Validate against schema
    const validationResult = simpleValidatorOutputSchema.safeParse(parsedJson);
    
    if (!validationResult.success) {
      if (sessionId && logger) {
        await logger('error', `Schema validation failed: ${validationResult.error.message}`, sessionId);
      }
      
      return {
        content: `Validation completed but schema mismatch detected:\n\n${JSON.stringify(parsedJson, null, 2)}\n\nValidation errors:\n${JSON.stringify(validationResult.error.errors, null, 2)}`,
        structuredContent: {
          error: true,
          message: 'Schema validation failed',
          validation_errors: validationResult.error.errors,
          partial_data: parsedJson,
        },
      };
    }

    const validatedOutput = validationResult.data;

    // Format human-readable content
    const humanReadable = formatSimpleValidationResult(validatedOutput);

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
function formatSimpleValidationResult(result: any): string {
  const {
    ship_it,
    severity,
    actual_percentage,
    claimed_percentage,
    trust_score,
    executive_summary,
    critical_issues,
    working_features_status,
    code_quality_analysis,
    missing_implementations,
    next_priority_fix,
    detailed_report,
    error_handling_score,
    logging_score,
    dry_compliance,
    solid_compliance,
    recommendation,
    estimated_hours_to_complete,
  } = result;

  const verdict = ship_it ? '✅ SHIP IT' : '❌ DO NOT SHIP';
  const trustPercent = (trust_score * 100).toFixed(0);

  return `# CARMACK-GRADE CODE VALIDATION REPORT

## 🎯 FINAL VERDICT: ${verdict}

**Severity**: ${severity}
**Actual Completion**: ${actual_percentage}% (Claimed: ${claimed_percentage}%)
**Trust Score**: ${trustPercent}% (Honesty: ${trust_score === 1.0 ? 'Perfect' : trust_score > 0.8 ? 'Good' : trust_score > 0.5 ? 'Questionable' : 'Poor'})
**Recommendation**: ${recommendation}
**Estimated Time to Complete**: ${estimated_hours_to_complete} hours

---

## 📋 EXECUTIVE SUMMARY

${executive_summary}

---

## 🚨 CRITICAL ISSUES

${critical_issues.length > 0 ? critical_issues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n') : 'No critical issues detected'}

---

## ✅ WORKING FEATURES ANALYSIS

${working_features_status}

---

## 🔍 CODE QUALITY ASSESSMENT

${code_quality_analysis}

**Carmack Metrics**:
- Error Handling: ${error_handling_score}% of I/O operations covered
- Logging/Observability: ${logging_score}% of critical points logged
- DRY Compliance: ${dry_compliance ? '✅ Pass' : '❌ Fail'}
- SOLID Compliance: ${solid_compliance ? '✅ Pass' : '❌ Fail'}

---

## 🚧 MISSING IMPLEMENTATIONS

${missing_implementations.length > 0 ? missing_implementations.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n') : 'All required features implemented'}

---

## 🔧 NEXT PRIORITY FIX

${next_priority_fix}

---

## 📊 DETAILED ANALYSIS

${detailed_report}

---

**Generated by Carmack-Grade Validator** | Attempt #${result.attempt_number || 1}
`;
}
