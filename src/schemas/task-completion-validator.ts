/**
 * Task completion validation schema - Carmack-grade code validation
 * Based on Latitude prompt structure adapted for Grok/OpenRouter
 */

import { z } from 'zod';

// ============================================================================
// INPUT SCHEMA
// ============================================================================

export const taskCompletionValidatorParamsShape = {
  // REQUIRED FIELDS
  original_request: z
    .string()
    .min(1)
    .describe('Complete PRD-format requirements in nested hierarchical structure'),
  
  claimed_percentage: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Developer\'s stated completion percentage'),
  
  completion_claim: z
    .string()
    .min(1)
    .describe('Detailed evidence statement from developer explaining completion status'),
  
  working_features: z
    .array(z.string())
    .describe('Array of features claimed as working'),
  
  // OPTIONAL FIELDS
  non_working_features: z
    .array(z.string())
    .optional()
    .describe('Array of features admitted as non-working'),
  
  implemented_vs_requested: z
    .string()
    .optional()
    .describe('Line-by-line status of EVERY requirement (COMPLETE/PARTIAL/NOT_STARTED)'),
  
  feature_to_file_mapping: z
    .string()
    .optional()
    .describe('Exact file locations of implementations'),
  
  blocking_issues: z
    .string()
    .optional()
    .describe('Technical challenges encountered during development'),
  
  resolution_strategies: z
    .string()
    .optional()
    .describe('How problems were solved'),
  
  workarounds: z
    .string()
    .optional()
    .describe('Temporary solutions implemented'),
  
  execution_proof: z
    .string()
    .optional()
    .describe('Command outputs demonstrating functionality'),
  
  api_responses: z
    .string()
    .optional()
    .describe('API call results as evidence'),
  
  database_verification: z
    .string()
    .optional()
    .describe('Database queries proving data operations'),
  
  error_logs: z
    .string()
    .optional()
    .describe('Error messages captured during testing'),
  
  full_file_content_files: z
    .array(
      z.object({
        path: z.string().describe('File path to analyze'),
        start_line: z.number().int().positive().optional().describe('Start line (1-indexed)'),
        end_line: z.number().int().positive().optional().describe('End line (1-indexed)'),
        description: z.string().optional().describe('What to focus on in this file'),
      })
    )
    .optional()
    .describe('Array of file paths to read and analyze'),
  
  focus_sections: z
    .array(
      z.object({
        section_name: z.string().describe('Name of critical code section'),
        file: z.string().describe('File path'),
        start_line: z.number().int().positive().describe('Start line'),
        end_line: z.number().int().positive().describe('End line'),
        description: z.string().describe('What makes this section important'),
      })
    )
    .optional()
    .describe('Critical code sections for deep analysis'),
  
  attempt_number: z
    .number()
    .int()
    .positive()
    .optional()
    .default(1)
    .describe('Current validation attempt number'),
};

export const taskCompletionValidatorParamsSchema = z.object(taskCompletionValidatorParamsShape);
export type TaskCompletionValidatorParams = z.infer<typeof taskCompletionValidatorParamsSchema>;

// ============================================================================
// OUTPUT SCHEMA
// ============================================================================

const SeverityEnum = z.enum([
  'COMPLETE',
  'COSMETIC_INCOMPLETE',
  'MINOR_INCOMPLETE',
  'MODERATE_INCOMPLETE',
  'MAJOR_INCOMPLETE',
  'CRITICAL_INCOMPLETE',
  'ABANDONED',
  'FRAUD_DETECTED',
]);

const RequirementValidationSchema = z.object({
  requirement_id: z.string().describe('Unique identifier (REQ-001, etc.)'),
  requirement_text: z.string().describe('Exact requirement from PRD'),
  priority: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT']).optional(),
  implementation_status: z.enum(['COMPLETE', 'PARTIAL', 'NOT_STARTED', 'IN_PROGRESS']),
  percentage_complete: z.number().int().min(0).max(100),
  location: z.string().optional().describe('File path and lines where implemented'),
  working_proof: z.string().optional().describe('Evidence from execution proof'),
  issues: z.array(z.string()).optional().describe('Problems with implementation'),
});

const WorkingFeaturesValidatedSchema = z.object({
  claimed_working: z.array(z.string()).describe('Features claimed as working'),
  actually_working: z.array(z.string()).describe('Features verified as working'),
  false_claims: z.array(z.string()).describe('Features claimed but don\'t work'),
  verification_details: z.record(
    z.object({
      status: z.enum(['VERIFIED', 'PARTIALLY_VERIFIED', 'FALSE_CLAIM']),
      evidence: z.string().describe('Proof validating/invalidating claim'),
      issues: z.string().optional(),
    })
  ).optional(),
});

const CodeInspectionSchema = z.object({
  files_analyzed: z.number().int().min(0),
  total_lines_analyzed: z.number().int().min(0),
  files_exist: z.boolean().describe('Whether all files exist'),
  stub_functions: z.array(
    z.object({
      location: z.string().describe('File:line'),
      function_name: z.string(),
      stub_type: z.enum(['NOT_IMPLEMENTED', 'PASS_ONLY', 'TODO_RETURN', 'MOCK_DATA']),
    })
  ),
  missing_error_handling: z.array(
    z.object({
      location: z.string(),
      operation: z.string().describe('Type of I/O operation'),
      severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    })
  ),
  todos_found: z.array(
    z.object({
      location: z.string(),
      comment: z.string(),
      in_critical_path: z.boolean(),
    })
  ).optional(),
  dry_violations: z.array(
    z.object({
      pattern: z.string().describe('Duplicated code pattern'),
      locations: z.array(z.string()),
      lines_duplicated: z.number().int(),
    })
  ).optional(),
  solid_violations: z.array(
    z.object({
      principle: z.enum([
        'SINGLE_RESPONSIBILITY',
        'OPEN_CLOSED',
        'LISKOV_SUBSTITUTION',
        'INTERFACE_SEGREGATION',
        'DEPENDENCY_INVERSION',
      ]),
      location: z.string(),
      description: z.string(),
    })
  ).optional(),
  code_quality_metrics: z.object({
    error_handling_coverage: z.number().min(0).max(100).optional(),
    logging_coverage: z.number().min(0).max(100).optional(),
    code_duplication_percentage: z.number().min(0).max(100).optional(),
  }).optional(),
});

const ExecutionValidationSchema = z.object({
  total_commands_run: z.number().int().min(0),
  successful_commands: z.number().int().min(0),
  failed_commands: z.number().int().min(0),
  command_analysis: z.array(
    z.object({
      command: z.string(),
      success: z.boolean(),
      proves: z.string().optional(),
      errors: z.array(z.string()).optional(),
    })
  ).optional(),
  api_endpoints_tested: z.number().int().min(0).optional(),
  api_endpoints_working: z.number().int().min(0).optional(),
  unhandled_errors: z.array(z.string()),
});

const FocusSectionAnalysisSchema = z.object({
  section_name: z.string(),
  file: z.string(),
  lines: z.string().optional(),
  description: z.string().optional(),
  verdict: z.enum(['EXCELLENT', 'GOOD', 'ACCEPTABLE', 'NEEDS_WORK', 'POOR', 'UNACCEPTABLE']),
  carmack_compliance: z.object({
    error_handling: z.boolean(),
    logging: z.boolean(),
    recovery_strategy: z.boolean(),
    performance: z.enum(['OPTIMAL', 'GOOD', 'ACCEPTABLE', 'POOR']).optional(),
  }).optional(),
  issues_found: z.array(
    z.object({
      line: z.number().int().optional(),
      issue: z.string(),
      severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    })
  ).optional(),
  required_fix: z.string().optional().describe('Complete corrected code'),
});

const CriticalFailureSchema = z.object({
  failure_id: z.string().describe('Unique ID (FAIL-001, etc.)'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  issue: z.string().describe('What\'s wrong'),
  impact: z.string().optional().describe('Production consequences'),
  location: z.string().describe('Exact file:lines'),
  current_code: z.string().optional().describe('Problematic code'),
  root_cause: z.string().optional().describe('Why this is wrong'),
  required_fix: z.string().min(500).describe('Complete corrected implementation (500+ chars)'),
  test_commands: z.array(z.string()).optional(),
});

const TechnicalDebtSchema = z.object({
  from_workarounds: z.array(
    z.object({
      description: z.string(),
      location: z.string().optional(),
      proper_solution: z.string().optional(),
      estimated_hours: z.number().optional(),
    })
  ).optional(),
  from_shortcuts: z.array(
    z.object({
      description: z.string(),
      impact: z.string().optional(),
      fix_complexity: z.enum(['TRIVIAL', 'SIMPLE', 'MODERATE', 'COMPLEX']).optional(),
    })
  ).optional(),
  total_hours_to_fix: z.number().min(0),
  risk_level: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL']),
});

const DeceptionPatternsEnum = z.enum([
  'FAKE_FILES',
  'EMPTY_FILES',
  'STUB_CODE',
  'FAKE_TESTS',
  'NO_IMPLEMENTATION',
  'TODO_RIDDLED',
  'NO_ERROR_HANDLING',
  'MISMATCHED_CLAIMS',
  'COPY_PASTE_CODE',
  'BOILERPLATE_ONLY',
  'INFLATED_NUMBERS',
  'HIDDEN_FAILURES',
  'FALSE_WORKING_CLAIMS',
  'EXECUTION_CONTRADICTS_CLAIMS',
]);

const MissingItemsSchema = z.object({
  critical: z.array(
    z.object({
      item: z.string(),
      location: z.string().optional(),
      estimated_hours: z.number().optional(),
      blocks_production: z.boolean().optional(),
    })
  ),
  important: z.array(
    z.object({
      item: z.string(),
      location: z.string().optional(),
      estimated_hours: z.number().optional(),
    })
  ),
  minor: z.array(z.string()),
});

const NextFixSchema = z.object({
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  what: z.string().describe('Specific fix needed'),
  where: z.string().describe('Exact file:lines'),
  why_most_critical: z.string().describe('Why this is #1 priority'),
  current_code: z.string().optional(),
  complete_fix_code: z.string().min(500).max(5000).describe('Ready-to-paste solution (500+ chars)'),
  verification_steps: z.array(z.string()).optional(),
  estimated_time: z.string().optional(),
});

const QualityVerdictSchema = z.object({
  code_quality: z.enum(['PRODUCTION_READY', 'ACCEPTABLE', 'NEEDS_WORK', 'POOR', 'UNACCEPTABLE']),
  error_handling: z.enum(['ROBUST', 'STANDARD', 'BASIC', 'WEAK', 'NONE']),
  logging_observability: z.enum(['COMPREHENSIVE', 'GOOD', 'BASIC', 'INSUFFICIENT', 'MISSING']),
  test_quality: z.enum(['COMPREHENSIVE', 'GOOD', 'BASIC', 'INSUFFICIENT', 'FAKE_OR_MISSING']).optional(),
  documentation: z.enum(['COMPLETE', 'ADEQUATE', 'MINIMAL', 'INSUFFICIENT', 'MISSING']).optional(),
  security: z.enum(['HARDENED', 'GOOD', 'BASIC', 'VULNERABLE', 'CRITICAL_ISSUES']).optional(),
  performance: z.enum(['OPTIMIZED', 'GOOD', 'ACCEPTABLE', 'POOR', 'UNACCEPTABLE']).optional(),
  maintainability: z.enum(['EXCELLENT', 'GOOD', 'ACCEPTABLE', 'POOR', 'UNMAINTAINABLE']).optional(),
});

const BehavioralAnalysisSchema = z.object({
  patterns_detected: z.array(
    z.enum([
      'PREMATURE_STOPPING',
      'SCOPE_AVOIDANCE',
      'VAGUE_LANGUAGE',
      'FALSE_COMPLETION',
      'TEST_AVOIDANCE',
      'ERROR_IGNORING',
      'PARTIAL_AS_COMPLETE',
      'PLANNING_PARALYSIS',
      'IMPLEMENTATION_RUSH',
      'DOCUMENTATION_SKIP',
      'OVERCONFIDENCE',
      'UNDERESTIMATION',
    ])
  ),
  iteration_number: z.number().int().min(1),
  estimated_effort_invested: z.enum(['MINIMAL', 'LOW', 'MODERATE', 'SUBSTANTIAL', 'HIGH']).optional(),
  estimated_remaining_effort: z.string().optional(),
  developer_skill_assessment: z.enum(['EXPERT', 'SENIOR', 'MID_LEVEL', 'JUNIOR', 'BEGINNER']).optional(),
  recommendation: z.enum(['APPROVE', 'CONTINUE_IMMEDIATELY', 'MAJOR_REWORK_NEEDED', 'START_OVER', 'GET_HELP']),
});

export const taskCompletionValidatorOutputShape = {
  ship_it: z.boolean().describe('THE ULTIMATE DECISION - true only if meets Carmack Mars Rover standards'),
  severity: SeverityEnum,
  actual_percentage: z.number().int().min(0).max(100).describe('Calculated reality from code analysis'),
  claimed_percentage: z.number().int().min(0).max(100).describe('Developer stated percentage'),
  trust_score: z.number().min(0).max(1).describe('Honesty metric (0.0-1.0)'),
  
  requirement_validation: z.array(RequirementValidationSchema),
  working_features_validated: WorkingFeaturesValidatedSchema,
  code_inspection: CodeInspectionSchema,
  execution_validation: ExecutionValidationSchema,
  focus_sections_analysis: z.array(FocusSectionAnalysisSchema).optional(),
  critical_failures: z.array(CriticalFailureSchema).max(20),
  technical_debt: TechnicalDebtSchema,
  deception_patterns: z.array(DeceptionPatternsEnum),
  missing_items: MissingItemsSchema,
  next_fix: NextFixSchema,
  quality_verdict: QualityVerdictSchema,
  behavioral_analysis: BehavioralAnalysisSchema,
  detailed_report: z.string().min(5000).max(20000).describe('Comprehensive narrative (5000+ chars)'),
};

export const taskCompletionValidatorOutputSchema = z.object(taskCompletionValidatorOutputShape);
export type TaskCompletionValidatorOutput = z.infer<typeof taskCompletionValidatorOutputSchema>;
