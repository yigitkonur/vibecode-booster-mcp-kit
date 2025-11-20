/**
 * Simplified Task Completion Validator Schema
 * Optimized for reliable LLM JSON generation while maintaining Carmack principles
 */

import { z } from 'zod';

// ============================================================================
// INPUT SCHEMA (Same as before)
// ============================================================================

export const simpleValidatorParamsShape = {
  original_request: z
    .string()
    .min(1)
    .describe('Complete PRD-format requirements'),
  
  claimed_percentage: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Developer stated completion %'),
  
  completion_claim: z
    .string()
    .min(1)
    .describe('Detailed evidence statement'),
  
  working_features: z
    .array(z.string())
    .describe('Features claimed as working'),
  
  non_working_features: z
    .array(z.string())
    .optional()
    .describe('Features admitted as broken'),
  
  full_file_content_files: z
    .array(z.object({
      path: z.string(),
      description: z.string().optional(),
    }))
    .optional()
    .describe('Files to analyze'),
  
  execution_proof: z
    .string()
    .optional()
    .describe('Command outputs and execution evidence'),
  
  error_logs: z
    .string()
    .optional()
    .describe('Error logs captured during testing'),
  
  attempt_number: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe('Iteration number for tracking improvements'),
};

export const simpleValidatorParamsSchema = z.object(simpleValidatorParamsShape);

export type SimpleValidatorParams = z.infer<typeof simpleValidatorParamsSchema>;

// ============================================================================
// OUTPUT SCHEMA (Simplified for LLM reliability)
// ============================================================================

export const simpleValidatorOutputShape = {
  // Core verdict
  ship_it: z
    .boolean()
    .describe('TRUE only if production-ready per Carmack standards'),
  
  actual_percentage: z
    .number()
    .min(0)
    .max(100)
    .describe('Calculated completion based on evidence'),
  
  claimed_percentage: z
    .number()
    .min(0)
    .max(100)
    .describe('What developer claimed'),
  
  trust_score: z
    .number()
    .min(0)
    .max(1)
    .describe('Honesty metric: 1.0=perfect honesty, 0.0=fraud'),
  
  severity: z
    .enum([
      'COMPLETE',
      'COSMETIC_INCOMPLETE',
      'MINOR_INCOMPLETE',
      'MODERATE_INCOMPLETE',
      'MAJOR_INCOMPLETE',
      'CRITICAL_INCOMPLETE',
      'ABANDONED',
      'FRAUD_DETECTED',
    ])
    .describe('Overall completion severity'),
  
  // Summary analysis (free-form text, no strict structure)
  executive_summary: z
    .string()
    .min(100)
    .describe('Brief overview of validation results'),
  
  critical_issues: z
    .array(z.string())
    .describe('List of blocking issues that prevent shipping'),
  
  working_features_status: z
    .string()
    .describe('Analysis of claimed vs actual working features'),
  
  code_quality_analysis: z
    .string()
    .describe('Error handling, logging, DRY/SOLID compliance analysis'),
  
  missing_implementations: z
    .array(z.string())
    .describe('Required features not yet implemented'),
  
  next_priority_fix: z
    .string()
    .min(200)
    .describe('The #1 most critical fix needed with complete solution'),
  
  detailed_report: z
    .string()
    .min(1000)
    .describe('Comprehensive narrative analysis of all findings'),
  
  // Carmack metrics
  error_handling_score: z
    .number()
    .min(0)
    .max(100)
    .describe('% of I/O operations with proper error handling'),
  
  logging_score: z
    .number()
    .min(0)
    .max(100)
    .describe('% of critical points with logging'),
  
  dry_compliance: z
    .boolean()
    .describe('No significant code duplication detected'),
  
  solid_compliance: z
    .boolean()
    .describe('Follows SOLID principles'),
  
  // Recommendations
  recommendation: z
    .enum(['SHIP_IT', 'MINOR_FIXES_NEEDED', 'MAJOR_REWORK_REQUIRED', 'START_OVER'])
    .describe('Final recommendation'),
  
  estimated_hours_to_complete: z
    .number()
    .min(0)
    .describe('Hours of work remaining to reach production quality'),
};

export const simpleValidatorOutputSchema = z.object(simpleValidatorOutputShape);

export type SimpleValidatorOutput = z.infer<typeof simpleValidatorOutputSchema>;
