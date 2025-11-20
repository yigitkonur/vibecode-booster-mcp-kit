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
    .describe(
      'COMPLETE PRD-FORMAT REQUIREMENTS in nested hierarchical structure. Include ALL features, acceptance criteria, functional requirements, non-functional requirements, and technical specifications. Format as numbered/bulleted list with sub-items. Example: "1. User Authentication: 1.1 Login with email/password (MUST have: email validation, password hashing, session management, rate limiting), 1.2 Logout (MUST have: session invalidation, cleanup), 1.3 Password reset (SHOULD have: email verification, token expiry). 2. Dashboard: 2.1 Display user stats..." Be specific about what MUST/SHOULD/COULD be implemented. This is parsed to extract total requirements and calculate actual completion percentage.'
    ),
  
  claimed_percentage: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'DEVELOPER\'S STATED COMPLETION PERCENTAGE (0-100). This is what YOU claim the project completion is. Be honest - this number is compared against actual implementation to calculate trust_score. Example: 85 means you believe the project is 85% complete. Inflating this number by >10% from reality will result in low trust scores and fraud detection. Used to measure honesty and professionalism of your self-assessment.'
    ),
  
  completion_claim: z
    .string()
    .min(1)
    .describe(
      'DETAILED EVIDENCE STATEMENT explaining your completion status with specific proof. Include: (1) What you implemented and where, (2) What tests you ran and results, (3) What\'s working vs what\'s not, (4) Any blockers encountered, (5) Evidence of testing (commands run, API calls made, database queries). Example: "Implemented user authentication in auth.ts lines 45-120 with bcrypt password hashing. Tested login endpoint - returns JWT token successfully (see execution_proof). Logout works and invalidates sessions. Password reset partially complete - email sending works but token expiry not implemented yet (known issue in error_logs)." Be specific with file locations and evidence references.'
    ),
  
  working_features: z
    .array(z.string())
    .describe(
      'ARRAY OF FEATURES YOU CLAIM ARE FULLY WORKING. Each feature will be forensically verified through code inspection and execution proof. Only list features that: (1) Have complete implementation (no stubs/TODOs), (2) Have proper error handling on all I/O operations, (3) Have been tested and proof exists in execution_proof or api_responses, (4) Have no unhandled errors in error_logs. Example: ["User login with JWT", "User logout with session cleanup", "Dashboard stats display", "Profile update with validation"]. FALSE CLAIMS (listing non-working features here) will severely impact trust_score and may trigger FRAUD_DETECTED severity.'
    ),
  
  non_working_features: z
    .array(z.string())
    .optional()
    .describe(
      'FEATURES YOU HONESTLY ADMIT ARE NOT WORKING OR INCOMPLETE. Listing features here demonstrates honesty and IMPROVES trust_score. Include: (1) Features with stub implementations, (2) Features with missing error handling, (3) Features that failed testing, (4) Features you haven\'t started yet. Example: ["Password reset token expiry", "Email verification", "Two-factor authentication", "Admin panel"]. Being transparent about incomplete work is valued over false completion claims.'
    ),
  
  full_file_content_files: z
    .array(z.object({
      path: z.string().describe('Absolute or relative file path to implementation file. Must exist on disk for validator to read and analyze. Example: "src/auth/login.ts" or "/Users/dev/project/api/users.js"'),
      description: z.string().optional().describe('Optional description of what this file contains or why it\'s important. Example: "Core authentication logic with JWT generation" or "Main API routes for user management"'),
    }))
    .optional()
    .describe(
      'ARRAY OF IMPLEMENTATION FILES TO ANALYZE. Validator will READ these actual files from disk and perform line-by-line code inspection. Each file is scanned for: stub functions (NotImplementedError, pass, TODO), missing error handling on I/O operations, logging coverage, DRY violations (code duplication), SOLID violations, cyclomatic complexity. Example: [{path: "src/auth.ts", description: "Authentication logic"}, {path: "src/api/users.ts", description: "User CRUD endpoints"}, {path: "tests/auth.test.ts", description: "Auth unit tests"}]. Files must exist and contain real code - empty files or non-existent paths will trigger FRAUD_DETECTED. Validator reads actual file content to verify claims.'
    ),
  
  execution_proof: z
    .string()
    .optional()
    .describe(
      'COMMAND EXECUTION OUTPUTS AND RESULTS proving features actually work. Include: (1) Terminal commands you ran with full output, (2) Exit codes and success/failure indicators, (3) Test suite results, (4) Build/compilation outputs, (5) Server startup logs. Format as multi-line string with clear command/output separation. Example: "$ npm test\\n✓ User login test passed\\n✓ JWT generation test passed\\n✗ Password reset test failed\\n\\n$ curl -X POST /api/login\\n{status: 200, token: \\"eyJ...\\"} \\n\\n$ node server.js\\nServer started on port 3000\\nDatabase connected". This evidence is cross-referenced with working_features to verify claims. Missing execution proof for claimed working features reduces trust_score.'
    ),
  
  error_logs: z
    .string()
    .optional()
    .describe(
      'ERROR LOGS AND STACK TRACES captured during development and testing. Include ALL errors encountered, even if you think they\'re fixed. Format as multi-line string with timestamps and full stack traces. Example: "2024-11-20 10:30:15 ERROR: Unhandled promise rejection\\n  at login.ts:67\\n  TypeError: Cannot read property \'email\' of undefined\\n\\n2024-11-20 11:15:22 WARN: Database connection timeout\\n  at db.ts:45\\n  Error: connect ETIMEDOUT". Unhandled errors in logs while claiming features work will trigger FALSE_CLAIM detection. Hiding errors destroys trust_score. Being transparent about errors shows professionalism and helps validator identify what needs fixing.'
    ),
  
  attempt_number: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe(
      'ITERATION NUMBER for tracking validation attempts and improvement over time. First submission = 1, second = 2, etc. Validator uses this to adjust tone and urgency: Attempts 1-2 get helpful guidance, Attempts 3-4 get stern warnings, Attempts 5+ get final ultimatums. Also used in behavioral_analysis to assess patterns like "premature stopping" or "iterative improvement". Increment this each time you resubmit after fixing issues from previous validation.'
    ),
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
