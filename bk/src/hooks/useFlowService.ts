import { useState, useCallback } from 'react';
import { Flow, FlowGroup, FlowStep, FormField, QueryChainAction, AdvanceFlowPayload, FlowState, FormFieldOption } from '../types/flow';
import { useQueryManager } from './useQueryManager';

// Sample flows matching Angular implementation
const MOCK_FLOWS: Flow[] = [
  {
    id: 'user-onboarding',
    name: 'User Onboarding',
    description: 'A simple flow to onboard a new user.',
    // Flow-level custom info configuration
    customInfo: {
      enabled: true,
      objectives: [
        'Create a secure user account with verified credentials',
        'Establish user preferences and profile settings',
        'Complete identity verification and access setup'
      ],
      keyPoints: [
        'All personal information is encrypted and stored securely',
        'Email verification is required before account activation',
        'Strong password policies are enforced for security'
      ],
      tags: ['onboarding', 'security', 'user-management', 'setup'],
      difficulty: 'easy',
      estimatedDuration: '5-7 minutes',
      prerequisites: [
        'Valid email address that you have access to',
        'Personal identification documents for verification'
      ]
    },
    steps: [
      {
        id: 'personal-info',
        name: 'Personal Information',
        description: 'Please enter your personal details.',
        // Enhanced step-level custom info
        customInfo: {
          helpText: 'This information will be used to create your user account and profile. All fields marked with an asterisk (*) are required.',
          estimatedTime: '2-3 minutes',
          requirements: [
            'Legal name as it appears on official documents',
            'Active email address that you check regularly'
          ],
          tips: [
            'Use a professional email address if this is for work',
            'Double-check your email address for accuracy'
          ],
          enabled: true,
          objectives: [
            'Collect accurate personal identification information',
            'Verify contact details for account setup',
            'Establish user identity for security purposes'
          ],
          keyPoints: [
            'Name should match official identification documents',
            'Email will be used for account verification and communication',
            'Information cannot be changed easily after account creation'
          ],
          examples: [
            'Full Name: John Michael Smith (as it appears on ID)',
            'Email: john.smith@company.com or john.smith@gmail.com'
          ],
          bestPractices: [
            'Use your legal name for official accounts',
            'Provide a professional email address for business accounts',
            'Ensure email address is actively monitored'
          ],
          commonMistakes: [
            'Using nicknames instead of legal names',
            'Providing inactive or temporary email addresses',
            'Typos in email addresses that prevent verification'
          ],
          tags: ['identity', 'verification', 'contact-info'],
          difficulty: 'easy',
          prerequisites: ['Valid identification document', 'Access to email account']
        },
        formFields: [
          { 
            key: 'name', 
            label: 'Full Name', 
            type: 'text', 
            required: true,
            placeholder: 'Enter your full name',
            helpText: 'Please enter your first and last name as they appear on official documents.',
            purpose: 'To establish your legal identity in our system and ensure accurate account records.',
            examples: ['John Michael Smith', 'María Elena González-Rodríguez', '李小明'],
            formatting: 'First name, middle name (optional), last name',
            validationRules: ['Minimum 2 characters', 'Letters, spaces, hyphens, and apostrophes only']
          },
          { 
            key: 'email', 
            label: 'Email Address', 
            type: 'email', 
            required: true,
            placeholder: 'you@example.com',
            helpText: 'We\'ll use this email for account notifications and password recovery.',
            purpose: 'Primary communication channel for account management, security notifications, and password recovery.',
            examples: ['john.smith@company.com', 'maria.gonzalez@universidad.edu', 'user@gmail.com'],
            formatting: 'standard@email.format',
            validationRules: ['Valid email format required', 'Must be accessible for verification']
          },
        ],
      },
      {
        id: 'password-setup',
        name: 'Password Setup',
        description: 'Choose a secure password.',
        // Enhanced security-focused custom info
        customInfo: {
          helpText: 'A strong password is essential for protecting your account. Follow the guidelines below to create a secure password.',
          estimatedTime: '1-2 minutes',
          requirements: [
            'Minimum 8 characters in length',
            'At least one uppercase letter',
            'At least one lowercase letter',
            'At least one number'
          ],
          tips: [
            'Avoid using personal information like birthdays or names',
            'Consider using a passphrase with multiple words',
            'Use a password manager to generate and store complex passwords'
          ],
          warnings: [
            'Never share your password with anyone',
            'Avoid using the same password for multiple accounts'
          ],
          enabled: true,
          objectives: [
            'Create a strong, secure password that protects your account',
            'Establish secure authentication credentials',
            'Learn best practices for password security'
          ],
          keyPoints: [
            'Password strength directly impacts account security',
            'Complex passwords are harder for attackers to guess or crack',
            'Password managers can help generate and store secure passwords'
          ],
          examples: [
            'Strong password: MyDog$Loves2Play!',
            'Passphrase: Coffee-Morning-Sunshine-2024',
            'Generated: Kx9#mP2$vL8@nQ5!'
          ],
          bestPractices: [
            'Use a unique password for each account',
            'Enable two-factor authentication when available',
            'Update passwords regularly (every 90 days for sensitive accounts)',
            'Never write passwords down in plain text'
          ],
          commonMistakes: [
            'Using personal information (birthdate, pet names, addresses)',
            'Reusing passwords across multiple accounts',
            'Choosing passwords that are too short or simple',
            'Sharing passwords via email or unsecure channels'
          ],
          tags: ['security', 'authentication', 'password', 'protection'],
          difficulty: 'medium',
          prerequisites: ['Understanding of password security principles']
        },
        formFields: [
          { 
            key: 'password', 
            label: 'Password', 
            type: 'password', 
            required: true,
            placeholder: 'Enter a strong password',
            helpText: 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers.',
            purpose: 'Secure authentication credential to protect your account from unauthorized access.',
            examples: ['MySecure$Pass123', 'Coffee&Sunshine2024!'],
            formatting: 'Mix of uppercase, lowercase, numbers, and symbols',
            validationRules: [
              'Minimum 8 characters',
              'At least 1 uppercase letter',
              'At least 1 lowercase letter', 
              'At least 1 number',
              'Recommended: At least 1 special character'
            ]
          },
        ],
      },
      {
        id: 'confirmation',
        name: 'Confirmation',
        description: 'You are all set! Your account has been created.',
        customInfo: {
          enabled: true,
          objectives: [
            'Confirm successful account creation',
            'Provide next steps for account activation',
            'Offer support resources for new users'
          ],
          keyPoints: [
            'Account setup is complete but may require email verification',
            'All entered information has been securely stored',
            'You can now access your new account features'
          ],
          bestPractices: [
            'Check your email for verification link',
            'Bookmark the login page for easy access',
            'Set up additional security features like 2FA'
          ],
          tags: ['completion', 'verification', 'next-steps'],
          difficulty: 'easy'
        },
        formFields: [],
      },
    ],
    availableInCertificates: true,
  },
  {
    id: 'leave-request',
    name: 'Leave Request',
    description: 'Submit a request for time off.',
    locked: true,
    // Flow-level configuration for HR workflows
    customInfo: {
      enabled: true,
      objectives: [
        'Submit a formal request for time off from work',
        'Ensure proper documentation for HR records',
        'Maintain workflow continuity during absence'
      ],
      keyPoints: [
        'Requests must be submitted with adequate advance notice',
        'All fields should be completed accurately for faster approval',
        'Manager approval is required before leave can be taken'
      ],
      bestPractices: [
        'Submit requests at least 2 weeks in advance for vacation',
        'Provide detailed plans for work coverage during absence',
        'Include emergency contact information if extended leave'
      ],
      tags: ['hr', 'time-off', 'workflow', 'approval'],
      difficulty: 'medium',
      estimatedDuration: '8-12 minutes',
      prerequisites: [
        'Check company leave policy before submitting',
        'Verify available vacation/sick days in your balance',
        'Coordinate with team members for work coverage'
      ]
    },
    steps: [
      {
        id: 'request-details',
        name: 'Request Details',
        description: 'Provide details for your leave request.',
        customInfo: {
          enabled: true,
          objectives: [
            'Specify exact dates and times for your leave',
            'Calculate total leave duration accurately',
            'Ensure dates don\'t conflict with critical business periods'
          ],
          keyPoints: [
            'Start and end times should include specific hours',
            'Consider time zones if working across multiple locations',
            'Partial day leaves should specify exact hours'
          ],
          examples: [
            'Vacation Leave: Dec 20, 2024 5:00 PM to Jan 2, 2025 9:00 AM',
            'Sick Leave: March 15, 2024 8:00 AM to March 16, 2024 5:00 PM',
            'Personal Day: April 10, 2024 9:00 AM to April 10, 2024 5:00 PM'
          ],
          bestPractices: [
            'Choose start/end times that align with business hours',
            'Consider Friday/Monday combinations for extended weekends',
            'Avoid scheduling leave during critical project deadlines'
          ],
          commonMistakes: [
            'Not specifying exact times for partial days',
            'Overlapping with company blackout periods',
            'Insufficient advance notice for vacation requests'
          ],
          tags: ['scheduling', 'dates', 'time-management'],
          difficulty: 'easy',
          prerequisites: ['Access to company calendar', 'Knowledge of blackout periods']
        },
        formFields: [
          { 
            key: 'startDateTime', 
            label: 'Start Date & Time', 
            type: 'datetime-local', 
            required: true,
            helpText: 'Select the date and time when your leave will begin.',
            purpose: 'Defines the exact start of your leave period for payroll and attendance tracking.',
            examples: ['2024-12-20T17:00 (Dec 20, 2024 at 5:00 PM)', '2024-03-15T08:00 (Mar 15, 2024 at 8:00 AM)'],
            validationRules: ['Must be a future date', 'Should align with work schedule', 'Consider advance notice requirements']
          },
          { 
            key: 'endDateTime', 
            label: 'End Date & Time', 
            type: 'datetime-local', 
            required: true,
            helpText: 'Select the date and time when you plan to return to work.',
            purpose: 'Defines when you will return to work for scheduling and planning purposes.',
            examples: ['2025-01-02T09:00 (Jan 2, 2025 at 9:00 AM)', '2024-03-16T17:00 (Mar 16, 2024 at 5:00 PM)'],
            validationRules: ['Must be after start date', 'Should align with work schedule', 'Consider business hours']
          },
        ]
      },
      {
        id: 'reason',
        name: 'Reason for Leave',
        description: 'Briefly explain the reason for your absence.',
        customInfo: {
          enabled: true,
          objectives: [
            'Provide context for the leave request',
            'Help HR categorize the type of leave',
            'Ensure appropriate documentation for different leave types'
          ],
          keyPoints: [
            'Different leave types may have different approval processes',
            'Some reasons may require additional documentation',
            'Being specific helps with faster approval'
          ],
          examples: [
            'Vacation: Family vacation to celebrate anniversary',
            'Medical: Scheduled surgery and recovery time',
            'Personal: Moving to new apartment, need time for arrangements',
            'Family: Caring for sick family member'
          ],
          bestPractices: [
            'Be honest and specific about the reason',
            'Mention if supporting documentation is available',
            'Indicate urgency level if applicable'
          ],
          commonMistakes: [
            'Being too vague ("personal reasons")',
            'Not mentioning if medical documentation is needed',
            'Submitting emergency requests without proper context'
          ],
          tags: ['documentation', 'categorization', 'approval'],
          difficulty: 'easy'
        },
        formFields: [
          { 
            key: 'reason', 
            label: 'Reason', 
            type: 'textarea', 
            required: false,
            placeholder: 'Please provide a brief explanation for your leave request...',
            helpText: 'Optional: Provide additional context or details about your leave request.',
            purpose: 'Helps HR categorize the leave type and determine if additional documentation is needed.',
            examples: [
              'Vacation: Two-week family vacation to visit relatives overseas',
              'Medical: Scheduled knee surgery with 4-6 weeks recovery time',
              'Personal: Moving to new home, need time for packing and setup'
            ],
            validationRules: ['Keep it professional and concise', 'Mention if documentation is available']
          },
        ]
      },
      {
        id: 'summary',
        name: 'Summary',
        description: 'Please review your leave request before submitting.',
        customInfo: {
          enabled: true,
          objectives: [
            'Review all details before final submission',
            'Understand the approval process and timeline',
            'Confirm all information is accurate and complete'
          ],
          keyPoints: [
            'Once submitted, the request goes to your manager for approval',
            'You will receive email notifications about status changes',
            'Approved requests are automatically added to the company calendar'
          ],
          bestPractices: [
            'Double-check all dates and times for accuracy',
            'Ensure you have made arrangements for work coverage',
            'Follow up if no response within expected timeframe'
          ],
          tags: ['review', 'submission', 'approval-process'],
          difficulty: 'easy'
        },
        formFields: []
      }
    ],
    availableInCertificates: false,
  },
  {
    id: 'student-enrollment',
    name: 'Student Enrollment & Course Assignment',
    description: 'Enroll a student and automatically assign them a default course.',
    // Technical flow with advanced data dependencies
    customInfo: {
      enabled: true,
      objectives: [
        'Complete student registration in the academic system',
        'Establish appropriate academic program pathway',
        'Automatically assign relevant default courses',
        'Generate student ID and access credentials'
      ],
      keyPoints: [
        'This flow integrates with multiple backend systems (Student DB, Course Catalog, Enrollment System)',
        'Cascading selections ensure data consistency across related fields',
        'Final step executes a query chain to complete registration and course assignment'
      ],
      bestPractices: [
        'Verify student eligibility before starting enrollment process',
        'Ensure accurate selection of academic program components',
        'Confirm course availability for the selected program level'
      ],
      tags: ['enrollment', 'academic', 'automation', 'database-integration', 'complex-workflow'],
      difficulty: 'hard',
      estimatedDuration: '10-15 minutes',
      prerequisites: [
        'Student admission approval and documentation',
        'Access to student information systems',
        'Knowledge of academic program structures',
        'Verification of course availability and prerequisites'
      ]
    },
    steps: [
      {
        id: 'program-selection',
        name: 'Program Selection',
        description: 'Choose the faculty, career, and level for the student.',
        // Technical step with cascading data dependencies
        customInfo: {
          helpText: 'Select the appropriate academic program details. These selections will determine the available courses and requirements for the student.',
          estimatedTime: '3-5 minutes',
          requirements: [
            'Verify the student meets admission requirements for the selected program',
            'Confirm availability in the chosen faculty and career path'
          ],
          tips: [
            'Faculty selection affects available career options',
            'Career selection determines available academic levels',
            'Contact admissions office if unsure about program requirements'
          ],
          enabled: true,
          objectives: [
            'Select appropriate academic faculty for student enrollment',
            'Choose career path that aligns with student goals',
            'Determine correct academic level for course placement'
          ],
          keyPoints: [
            'Selections are hierarchical - Faculty → Career → Level',
            'Each selection dynamically loads options for the next field',
            'Choices determine available courses and graduation requirements'
          ],
          examples: [
            'Engineering → Computer Science → Bachelor Level',
            'Business → Marketing → Master Level',
            'Medicine → General Medicine → Residency Level'
          ],
          bestPractices: [
            'Start with the faculty that best matches student interests',
            'Consider career growth and industry demand',
            'Verify prerequisite completion for selected level'
          ],
          commonMistakes: [
            'Selecting programs without checking prerequisite requirements',
            'Choosing levels that don\'t match student academic background',
            'Not considering long-term career implications of choices'
          ],
          relatedSteps: [
            'Student Details (will use selected program for validation)',
            'Course Assignment (automatically assigns based on these selections)'
          ],
          tags: ['program-selection', 'cascading-data', 'academic-planning'],
          difficulty: 'medium',
          prerequisites: [
            'Understanding of academic program structure',
            'Knowledge of student academic background',
            'Access to current program availability'
          ]
        },
        formFields: [
          { 
            key: 'faculty', 
            label: 'Faculty', 
            type: 'select', 
            required: true, 
            queryName: 'GET_FACULTIES',
            placeholder: 'Select a faculty',
            helpText: 'Choose the academic faculty where the student will be enrolled.',
            purpose: 'Determines the broad academic division and available career paths for the student.',
            examples: ['Engineering', 'Business Administration', 'Medicine', 'Arts & Sciences'],
            validationRules: ['Must select from available active faculties', 'Selection affects subsequent career options'],
            dataSource: 'GET_FACULTIES'
          },
          { 
            key: 'career', 
            label: 'Career', 
            type: 'select', 
            required: true, 
            queryName: 'GET_CAREERS_BY_FACULTY', 
            dependencyKey: 'faculty',
            placeholder: 'Select a career',
            helpText: 'Select the career path based on the chosen faculty.',
            purpose: 'Specifies the specific academic program within the selected faculty.',
            examples: ['Computer Science (Engineering)', 'Marketing (Business)', 'General Medicine (Medicine)'],
            validationRules: ['Must be available in selected faculty', 'Determines academic level options'],
            dataSource: 'GET_CAREERS_BY_FACULTY'
          },
          { 
            key: 'level', 
            label: 'Level', 
            type: 'select', 
            required: true, 
            queryName: 'GET_LEVELS_BY_CAREER', 
            dependencyKey: 'career',
            placeholder: 'Select a level',
            helpText: 'Choose the academic level for the student (e.g., Freshman, Sophomore).',
            purpose: 'Defines the academic progression level and course difficulty for enrollment.',
            examples: ['Bachelor Level 1 (Freshman)', 'Master Level 2', 'PhD Level 1'],
            validationRules: ['Must match student academic background', 'Determines course prerequisites'],
            dataSource: 'GET_LEVELS_BY_CAREER'
          },
        ],
      },
      {
        id: 'student-details',
        name: 'Student Details & Enrollment',
        description: 'Enter student info to enroll them and assign a default course.',
        customInfo: {
          enabled: true,
          objectives: [
            'Capture essential student personal information',
            'Execute automated enrollment in the selected program',
            'Assign default courses based on program and level',
            'Generate student credentials and access'
          ],
          keyPoints: [
            'This step triggers a complex query chain upon submission',
            'Student data is validated against admission requirements',
            'System automatically assigns appropriate starter courses',
            'Enrollment and course assignment happen in sequence'
          ],
          examples: [
            'Name: María Elena González-Rodríguez',
            'Email: maria.gonzalez@university.edu',
            'Query Chain: Enrollment → Course Assignment → Credentials'
          ],
          bestPractices: [
            'Verify student information accuracy before submission',
            'Use institutional email format when available',
            'Ensure all previous program selections are correct'
          ],
          commonMistakes: [
            'Using personal email instead of institutional email',
            'Submitting before verifying program selection accuracy',
            'Not checking if student already exists in system'
          ],
          relatedSteps: [
            'Program Selection (provides context for enrollment)',
            'Summary (shows results of query chain execution)'
          ],
          tags: ['database-operation', 'query-chain', 'automation', 'student-data'],
          difficulty: 'hard',
          prerequisites: [
            'Completed and verified program selection',
            'Student eligibility confirmed',
            'System access for enrollment operations'
          ]
        },
        formFields: [
          { 
            key: 'student_name', 
            label: 'Full Name', 
            type: 'text', 
            required: true,
            placeholder: 'Enter student\'s full name',
            helpText: 'Enter the student\'s complete legal name for enrollment records.',
            purpose: 'Official identification for all academic records, transcripts, and institutional communications.',
            examples: ['María Elena González-Rodríguez', 'John Michael Smith Jr.', 'Ahmed Al-Rashid'],
            formatting: 'Full legal name as it appears on official documents',
            validationRules: [
              'Must match official identification documents',
              'Minimum 2 characters required',
              'Special characters allowed: hyphens, apostrophes, spaces'
            ]
          },
          { 
            key: 'student_email', 
            label: 'Email Address', 
            type: 'email', 
            required: true,
            placeholder: 'student@university.edu',
            helpText: 'This email will be used for all academic communications and account setup.',
            purpose: 'Primary communication channel for academic notifications, course materials, and system access.',
            examples: ['maria.gonzalez@university.edu', 'j.smith2024@students.university.edu'],
            formatting: 'Preferably institutional email format: name@university.edu',
            validationRules: [
              'Valid email format required',
              'Must be accessible for account verification',
              'Institutional email preferred for student accounts'
            ]
          },
        ],
        queryChain: [
          {
            queryName: 'FINAL_STUDENT_ENROLLMENT',
            resultKey: 'enrollmentResult',
            parameters: { 
              faculty: 'payload.faculty',
              career: 'payload.career',
              level: 'payload.level',
              student_name: 'payload.student_name',
              student_email: 'payload.student_email'
            }
          },
          {
            queryName: 'ASSIGN_DEFAULT_COURSE',
            resultKey: 'courseAssignmentResult',
            parameters: {
              studentId: 'results.enrollmentResult.studentId'
            }
          }
        ]
      },
      {
        id: 'enrollment-summary',
        name: 'Summary',
        description: 'This step is for confirmation after enrollment.',
        customInfo: {
          enabled: true,
          objectives: [
            'Confirm successful completion of enrollment process',
            'Display results of automated course assignment',
            'Provide student with next steps and important information',
            'Offer access to student portal and resources'
          ],
          keyPoints: [
            'Enrollment is now complete and irreversible without administrative action',
            'Student ID and course assignments have been generated',
            'All systems have been updated with new student information',
            'Email verification and account setup instructions have been sent'
          ],
          bestPractices: [
            'Save or print enrollment confirmation for records',
            'Verify all displayed information is correct',
            'Complete email verification promptly',
            'Access student portal to confirm enrollment status'
          ],
          commonMistakes: [
            'Not completing email verification process',
            'Forgetting to save enrollment confirmation',
            'Not checking course assignment accuracy',
            'Missing orientation or onboarding activities'
          ],
          tags: ['completion', 'confirmation', 'next-steps', 'verification'],
          difficulty: 'easy',
          prerequisites: ['Successful completion of enrollment process']
        },
        formFields: []
      }
    ],
    availableInCertificates: true,
  },
  {
    id: 'document-generation',
    name: 'Document Generation Workflow',
    description: 'Generate official documents with different information modes.',
    // Flow with global custom info disabled to demonstrate flexibility
    customInfo: {
      enabled: false  // This will hide custom info for the entire flow unless overridden at step level
    },
    steps: [
      {
        id: 'document-type',
        name: 'Document Type Selection',
        description: 'Choose the type of document to generate.',
        // This step explicitly enables custom info despite flow-level disable
        customInfo: {
          enabled: true,
          objectives: [
            'Select the appropriate document type for your needs',
            'Understand requirements for different document types',
            'Ensure you have necessary permissions and information'
          ],
          keyPoints: [
            'Different document types have different requirements',
            'Some documents may require additional approvals',
            'Generated documents are legally binding in some cases'
          ],
          examples: [
            'Certificate: Academic achievement verification',
            'Transcript: Complete academic record',
            'Letter: Official institutional correspondence'
          ],
          bestPractices: [
            'Choose the most specific document type for your needs',
            'Verify you meet requirements before proceeding',
            'Consider processing time for urgent requests'
          ],
          commonMistakes: [
            'Selecting wrong document type for intended use',
            'Not checking if document requires special approval',
            'Requesting documents without meeting prerequisites'
          ],
          tags: ['document-types', 'selection', 'requirements'],
          difficulty: 'easy'
        },
        formFields: [
          {
            key: 'documentType',
            label: 'Document Type',
            type: 'select',
            required: true,
            options: [
              { value: 'certificate', label: 'Academic Certificate' },
              { value: 'transcript', label: 'Official Transcript' },
              { value: 'letter', label: 'Recommendation Letter' }
            ],
            placeholder: 'Select document type',
            helpText: 'Choose the type of document you need to generate.',
            purpose: 'Determines the document template and required information fields.',
            examples: ['Academic Certificate for graduation', 'Official Transcript for transfer'],
            validationRules: ['Must select one of the available document types']
          }
        ]
      },
      {
        id: 'document-details',
        name: 'Document Details',
        description: 'Provide specific details for document generation.',
        // This step inherits flow-level setting (disabled) and doesn't override it
        formFields: [
          {
            key: 'recipientName',
            label: 'Recipient Name',
            type: 'text',
            required: true,
            placeholder: 'Enter recipient full name',
            helpText: 'The person or organization that will receive this document.'
          },
          {
            key: 'purpose',
            label: 'Purpose',
            type: 'textarea',
            required: false,
            placeholder: 'Describe the purpose of this document...',
            helpText: 'Optional: Explain why this document is needed.'
          }
        ]
      },
      {
        id: 'review-and-generate',
        name: 'Review & Generate',
        description: 'Review details and generate the document.',
        // This step enables minimal custom info
        customInfo: {
          enabled: true,
          objectives: [
            'Review all information for accuracy',
            'Generate the final document',
            'Provide download or delivery options'
          ],
          keyPoints: [
            'Once generated, documents cannot be easily modified',
            'Review all details carefully before proceeding',
            'Generated documents include timestamp and verification codes'
          ],
          tags: ['review', 'generation', 'finalization'],
          difficulty: 'easy'
        },
        formFields: []
      }
    ],
    availableInCertificates: true
  },
  {
    id: 'help-desk-ticket',
    name: 'IT Help Desk Ticket',
    description: 'Submit a technical support request with comprehensive guidance.',
    // Flow with rich custom info for support scenarios
    customInfo: {
      enabled: true,
      objectives: [
        'Submit a detailed technical support request',
        'Provide sufficient information for quick resolution',
        'Track ticket progress and communicate effectively with support team'
      ],
      keyPoints: [
        'Detailed descriptions lead to faster resolution times',
        'Screenshots and error messages are extremely helpful',
        'Priority levels affect response time expectations'
      ],
      bestPractices: [
        'Include specific error messages or codes',
        'Describe steps that led to the issue',
        'Provide system information when relevant',
        'Be available for follow-up questions'
      ],
      commonMistakes: [
        'Providing vague descriptions like "it doesn\'t work"',
        'Not including relevant system or browser information',
        'Setting inappropriate priority levels',
        'Not responding to support team follow-up questions'
      ],
      tags: ['support', 'troubleshooting', 'technical', 'communication'],
      difficulty: 'medium',
      estimatedDuration: '5-10 minutes',
      prerequisites: [
        'Basic understanding of the issue you\'re experiencing',
        'Access to the system or application having problems',
        'Ability to provide additional information if requested'
      ]
    },
    steps: [
      {
        id: 'issue-classification',
        name: 'Issue Classification',
        description: 'Classify your technical issue for proper routing.',
        customInfo: {
          enabled: true,
          objectives: [
            'Categorize the technical issue accurately',
            'Set appropriate priority level',
            'Ensure ticket reaches the right support team'
          ],
          keyPoints: [
            'Accurate categorization speeds up resolution',
            'Priority levels have specific response time commitments',
            'Categories help route tickets to specialized teams'
          ],
          examples: [
            'High Priority: System down affecting multiple users',
            'Medium Priority: Software not working for individual user',
            'Low Priority: Feature request or general question'
          ],
          bestPractices: [
            'Be honest about the true impact and urgency',
            'Choose the most specific category available',
            'Consider business impact when setting priority'
          ],
          commonMistakes: [
            'Setting everything as high priority',
            'Choosing broad categories when specific ones exist',
            'Confusing personal urgency with business impact'
          ],
          tags: ['categorization', 'priority', 'routing'],
          difficulty: 'easy'
        },
        formFields: [
          {
            key: 'category',
            label: 'Issue Category',
            type: 'select',
            required: true,
            options: [
              { value: 'hardware', label: 'Hardware Problem' },
              { value: 'software', label: 'Software Issue' },
              { value: 'network', label: 'Network/Connectivity' },
              { value: 'account', label: 'Account/Access Issue' },
              { value: 'other', label: 'Other' }
            ],
            placeholder: 'Select issue category',
            helpText: 'Choose the category that best describes your issue.',
            purpose: 'Routes your ticket to the appropriate specialized support team.',
            examples: ['Hardware Problem for broken laptop', 'Software Issue for application crashes'],
            validationRules: ['Must select a category for proper ticket routing']
          },
          {
            key: 'priority',
            label: 'Priority Level',
            type: 'select',
            required: true,
            options: [
              { value: 'low', label: 'Low - General question or minor issue' },
              { value: 'medium', label: 'Medium - Impacting work but workarounds exist' },
              { value: 'high', label: 'High - Blocking work, no workarounds' },
              { value: 'urgent', label: 'Urgent - System down, multiple users affected' }
            ],
            placeholder: 'Select priority level',
            helpText: 'Choose priority based on business impact and urgency.',
            purpose: 'Determines response time commitments and escalation procedures.',
            examples: [
              'Low: How to use a new feature',
              'Medium: Email client crashes occasionally',
              'High: Cannot access critical business application',
              'Urgent: Server down affecting entire department'
            ],
            validationRules: ['Must accurately reflect true business impact and urgency']
          }
        ]
      },
      {
        id: 'issue-description',
        name: 'Issue Description',
        description: 'Provide detailed information about the problem.',
        customInfo: {
          enabled: true,
          objectives: [
            'Provide comprehensive description of the issue',
            'Include relevant technical details',
            'Help support team understand and reproduce the problem'
          ],
          keyPoints: [
            'More detail leads to faster resolution',
            'Include exact error messages when possible',
            'Describe what you were trying to accomplish',
            'Mention any recent changes to your system'
          ],
          examples: [
            'Good: "When I click Print in Microsoft Word, I get error \'Printer not found\' (Error Code: 0x80070002). This started yesterday after Windows update. I can print from other applications."',
            'Poor: "Printing doesn\'t work"'
          ],
          bestPractices: [
            'Use the "What, When, Where, How" format',
            'Include screenshots of error messages',
            'Mention your operating system and browser version',
            'List any troubleshooting steps already attempted'
          ],
          commonMistakes: [
            'Being too vague or general in descriptions',
            'Not mentioning when the problem started',
            'Forgetting to include error messages or codes',
            'Not mentioning what changed recently'
          ],
          tags: ['description', 'details', 'troubleshooting'],
          difficulty: 'medium'
        },
        formFields: [
          {
            key: 'title',
            label: 'Issue Title',
            type: 'text',
            required: true,
            placeholder: 'Brief summary of the issue',
            helpText: 'Provide a clear, concise summary of the problem.',
            purpose: 'Gives support team immediate understanding of the issue type.',
            examples: [
              'Cannot print from Microsoft Word after Windows update',
              'Email client crashes when opening attachments',
              'Unable to access shared network drive from laptop'
            ],
            validationRules: ['Should be specific and actionable', 'Avoid vague terms like "broken" or "not working"']
          },
          {
            key: 'description',
            label: 'Detailed Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe the issue in detail, including what you were trying to do, what happened, and any error messages...',
            helpText: 'Provide as much detail as possible to help us understand and resolve the issue quickly.',
            purpose: 'Comprehensive information helps support team diagnose and resolve issues efficiently.',
            examples: [
              'I was trying to print a 10-page document from Microsoft Word 2023. When I clicked File > Print and selected my usual printer (HP LaserJet Pro), I received the error message "Printer not found (Error Code: 0x80070002)". This started happening yesterday morning after the automatic Windows 11 update installed overnight. The printer works fine from other applications like Adobe PDF Reader and Google Chrome. I have tried restarting both my computer and the printer, but the issue persists.'
            ],
            formatting: 'Include: What you were doing, what happened, when it started, what you\'ve tried',
            validationRules: [
              'Minimum 50 characters for adequate description',
              'Should include specific error messages if any',
              'Must describe the business impact'
            ]
          },
          {
            key: 'stepsToReproduce',
            label: 'Steps to Reproduce',
            type: 'textarea',
            required: false,
            placeholder: '1. Open application X\n2. Click on menu Y\n3. Error appears...',
            helpText: 'If applicable, provide step-by-step instructions to recreate the issue.',
            purpose: 'Helps support team reproduce the issue for faster diagnosis and testing of solutions.',
            examples: [
              '1. Open Microsoft Word 2023\n2. Open any document\n3. Click File > Print\n4. Select HP LaserJet Pro printer\n5. Click Print button\n6. Error message appears: "Printer not found (Error Code: 0x80070002)"'
            ],
            formatting: 'Numbered list format, one action per line',
            validationRules: ['Use clear, actionable steps', 'Include expected vs actual results']
          }
        ]
      },
      {
        id: 'contact-info',
        name: 'Contact Information',
        description: 'Provide your contact details for follow-up.',
        // Minimal custom info for simple contact step
        customInfo: {
          enabled: true,
          objectives: [
            'Provide accurate contact information for follow-up',
            'Set communication preferences',
            'Ensure timely response to support inquiries'
          ],
          keyPoints: [
            'Support team may need to contact you for clarification',
            'Preferred contact method affects response speed',
            'Keep contact information up to date'
          ],
          tags: ['contact', 'communication', 'follow-up'],
          difficulty: 'easy'
        },
        formFields: [
          {
            key: 'contactMethod',
            label: 'Preferred Contact Method',
            type: 'select',
            required: true,
            options: [
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone Call' },
              { value: 'teams', label: 'Microsoft Teams' },
              { value: 'slack', label: 'Slack Message' }
            ],
            placeholder: 'Select preferred contact method',
            helpText: 'How would you like our support team to contact you?',
            purpose: 'Ensures support team can reach you through your preferred communication channel.',
            validationRules: ['Must select a contact method for follow-up communication']
          },
          {
            key: 'phoneNumber',
            label: 'Phone Number',
            type: 'text',
            required: false,
            placeholder: '+1 (555) 123-4567',
            helpText: 'Optional: Provide if phone contact is preferred or for urgent issues.',
            purpose: 'Enables direct phone contact for urgent issues or complex troubleshooting.',
            formatting: 'Include country code and area code',
            examples: ['+1 (555) 123-4567', '+44 20 7123 4567'],
            validationRules: ['Must be valid phone number format if provided']
          }
        ]
      }
    ],
    availableInCertificates: false
  }
];

const MOCK_FLOW_GROUPS: FlowGroup[] = [
  {
    category: 'Human Resources',
    flows: [MOCK_FLOWS[0], MOCK_FLOWS[1]]
  },
  {
    category: 'Academics',
    flows: [MOCK_FLOWS[2], MOCK_FLOWS[3]]
  },
  {
    category: 'IT Support',
    flows: [MOCK_FLOWS[4]]
  }
];

export const useFlowService = () => {
  const [flowGroups, setFlowGroups] = useState<FlowGroup[]>(MOCK_FLOW_GROUPS);
  const [flowState, setFlowState] = useState<FlowState>({
    status: 'loading',
    completedStepsPayload: {},
  });

  const { executeQuery, getAvailableQueries } = useQueryManager();

  // Get all flows flattened
  const getAllFlows = useCallback((): Flow[] => {
    return flowGroups.flatMap(g => g.flows);
  }, [flowGroups]);

  const getFlow = useCallback((flowId: string): Flow | undefined => {
    return getAllFlows().find(f => f.id === flowId);
  }, [getAllFlows]);

  // Flow State Management
  const startFlow = useCallback((flowId: string): void => {
    const flow = getFlow(flowId);
    if (flow && flow.steps.length > 0) {
      setFlowState({
        status: 'ready',
        currentStep: flow.steps[0],
        currentStepIndex: 0,
        completedStepsPayload: {},
        flowId: flowId,
      });
    } else {
      setFlowState({
        status: 'error',
        error: 'Flow not found or has no steps.',
        completedStepsPayload: {},
      });
    }
  }, [getFlow]);

  // Helper to resolve parameter mappings (like Angular _resolveParameters)
  const resolveParameters = useCallback((
    paramMappings: { [key: string]: string },
    payload: any,
    resultsContext: any
  ): { [key: string]: any } => {
    const resolved: { [key: string]: any } = {};
    
    for (const key in paramMappings) {
      const mapping = paramMappings[key];
      const parts = mapping.split('.');
      
      if (parts.length < 2) {
        throw new Error(`Invalid parameter mapping: "${mapping}". Must be in the format "source.value"`);
      }

      const source = parts.shift();
      const path = parts.join('.');

      let value: any;
      if (source === 'payload') {
        value = getObjectValueByPath(payload, path);
      } else if (source === 'results') {
        value = getObjectValueByPath(resultsContext, path);
      } else {
        throw new Error(`Invalid parameter source: "${source}". Must be "payload" or "results".`);
      }
      
      if (value === undefined) {
        console.warn(`Could not resolve value for mapping "${mapping}". Resulting parameter will be undefined.`);
      }

      resolved[key] = value;
    }
    return resolved;
  }, []);

  const getObjectValueByPath = (obj: any, path: string): any => {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj);
  };

  // Execute query chain sequentially (like Angular concatMap pattern)
  const executeQueryChain = useCallback(async (
    chain: QueryChainAction[],
    payload: { [key: string]: any }
  ): Promise<any> => {
    const resultsContext: { [key: string]: any } = {};

    try {
      for (const action of chain) {
        const resolvedParams = resolveParameters(action.parameters, payload, resultsContext);
        const result = await executeQuery(action.queryName, resolvedParams);
        resultsContext[action.resultKey] = result;
      }
      
      return resultsContext;
    } catch (error: any) {
      console.error('Query Chain Failed:', error);
      throw new Error(`Query chain failed: ${error.message}`);
    }
  }, [executeQuery, resolveParameters]);

  const advanceFlow = useCallback(async (advancePayload: AdvanceFlowPayload): Promise<void> => {
    const flow = getFlow(advancePayload.flowId);
    if (!flow) {
      setFlowState({ ...flowState, status: 'error', error: 'Flow not found.' });
      return;
    }

    const currentStepIndex = flow.steps.findIndex(s => s.id === advancePayload.currentStepId);
    if (currentStepIndex === -1) {
      setFlowState({ ...flowState, status: 'error', error: 'Current step not found.' });
      return;
    }

    const currentStep = flow.steps[currentStepIndex];
    const newPayload = { ...flowState.completedStepsPayload, ...advancePayload.payload };

    // If step has queryChain, execute it
    if (currentStep.queryChain && currentStep.queryChain.length > 0) {
      setFlowState({ ...flowState, status: 'loading' });
      
      try {
        const finalResults = await executeQueryChain(currentStep.queryChain, newPayload);
        setFlowState({
          status: 'final-result',
          completedStepsPayload: newPayload,
          flowId: advancePayload.flowId,
          finalQueryResult: finalResults
        });
      } catch (error: any) {
        setFlowState({
          status: 'error',
          error: error.message || 'An error occurred during query chain execution.',
          completedStepsPayload: newPayload,
          flowId: advancePayload.flowId,
        });
      }
      return;
    }

    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex < flow.steps.length) {
      setFlowState({
        status: 'ready',
        currentStep: flow.steps[nextStepIndex],
        currentStepIndex: nextStepIndex,
        completedStepsPayload: newPayload,
        flowId: advancePayload.flowId,
      });
    } else {
      setFlowState({
        status: 'completed',
        completedStepsPayload: newPayload,
        flowId: advancePayload.flowId,
      });
    }
  }, [flowState, getFlow, executeQueryChain]);

  const regressFlow = useCallback((flowId: string): void => {
    const flow = getFlow(flowId);
    const currentStepIndex = flowState.currentStepIndex;

    if (!flow || currentStepIndex === undefined || currentStepIndex <= 0) {
      return;
    }

    const previousStepIndex = currentStepIndex - 1;
    setFlowState({
      ...flowState,
      status: 'ready',
      currentStep: flow.steps[previousStepIndex],
      currentStepIndex: previousStepIndex,
    });
  }, [flowState, getFlow]);

  const fetchOptions = useCallback(async (
    queryName: string,
    parentField: FormField,
    parentValue: string
  ): Promise<FormFieldOption[]> => {
    const queries = getAvailableQueries();
    const query = queries.find(q => q.name === queryName);
    if (!query) return [];

    const params: { [key: string]: any } = {};
    const dependencyParam = query.parameters.find(p => 
      p.key.toLowerCase().includes(parentField.key.toLowerCase())
    );
    
    if (dependencyParam) {
      params[dependencyParam.key] = parentValue;
    }

    try {
      const result = await executeQuery(queryName, params);
      return result as FormFieldOption[];
    } catch (error) {
      console.error(`Error executing catalog query ${queryName}:`, error);
      setFlowState({
        ...flowState,
        status: 'error',
        error: `Failed to load options for ${parentField.label}.`
      });
      return [];
    }
  }, [flowState, getAvailableQueries, executeQuery]);

  // Group Management
  const createFlowGroup = useCallback((category: string): boolean => {
    if (flowGroups.some(g => g.category.toLowerCase() === category.toLowerCase())) {
      return false;
    }
    setFlowGroups([...flowGroups, { category, flows: [] }]);
    return true;
  }, [flowGroups]);

  const updateFlowGroup = useCallback((oldCategory: string, newCategory: string): boolean => {
    if (flowGroups.some(g => g.category.toLowerCase() === newCategory.toLowerCase() && g.category !== oldCategory)) {
      return false;
    }
    setFlowGroups(groups => 
      groups.map(group => 
        group.category === oldCategory 
          ? { ...group, category: newCategory }
          : group
      )
    );
    return true;
  }, [flowGroups]);

  const deleteFlowGroup = useCallback((category: string): boolean => {
    const group = flowGroups.find(g => g.category === category);
    if (!group) return false;
    
    // Check if group has flows
    if (group.flows.length > 0) {
      return false; // Cannot delete group with flows
    }
    
    setFlowGroups(groups => groups.filter(g => g.category !== category));
    return true;
  }, [flowGroups]);

  const moveFlowBetweenGroups = useCallback((flowId: string, fromCategory: string, toCategory: string): boolean => {
    const fromGroup = flowGroups.find(g => g.category === fromCategory);
    const toGroup = flowGroups.find(g => g.category === toCategory);
    
    if (!fromGroup || !toGroup) return false;
    
    const flow = fromGroup.flows.find(f => f.id === flowId);
    if (!flow) return false;
    
    setFlowGroups(groups => 
      groups.map(group => {
        if (group.category === fromCategory) {
          return { ...group, flows: group.flows.filter(f => f.id !== flowId) };
        }
        if (group.category === toCategory) {
          return { ...group, flows: [...group.flows, flow] };
        }
        return group;
      })
    );
    return true;
  }, [flowGroups]);

  const duplicateFlow = useCallback((flowId: string, newName?: string): string | null => {
    const sourceFlow = getAllFlows().find(f => f.id === flowId);
    if (!sourceFlow) return null;
    
    const sourceGroup = flowGroups.find(g => g.flows.some(f => f.id === flowId));
    if (!sourceGroup) return null;
    
    const newFlowId = `${flowId}-copy-${Date.now()}`;
    const duplicatedFlow: Flow = {
      ...sourceFlow,
      id: newFlowId,
      name: newName || `${sourceFlow.name} (Copy)`,
      locked: false, // Copies are never locked
      created: new Date(),
      updated: new Date(),
      steps: sourceFlow.steps.map(step => ({
        ...step,
        id: `${step.id}-copy-${Date.now()}`,
        formFields: [...step.formFields]
      }))
    };
    
    setFlowGroups(groups => 
      groups.map(group => 
        group.category === sourceGroup.category
          ? { ...group, flows: [...group.flows, duplicatedFlow] }
          : group
      )
    );
    
    return newFlowId;
  }, [flowGroups, getAllFlows]);

  // Flow Management
  const createFlow = useCallback((flow: Flow, category: string): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const group = newGroups.find(g => g.category === category);
      if (group && !group.flows.some(f => f.id === flow.id)) {
        group.flows.push({ ...flow, steps: [] });
      }
      return newGroups;
    });
  }, []);

  const updateFlow = useCallback((updatedFlow: Flow): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      for (const group of newGroups) {
        const flowIndex = group.flows.findIndex(f => f.id === updatedFlow.id);
        if (flowIndex > -1) {
          // Preserve steps if they exist in updatedFlow, otherwise keep originals
          const currentFlow = group.flows[flowIndex];
          group.flows[flowIndex] = {
            ...updatedFlow,
            steps: updatedFlow.steps.length > 0 ? updatedFlow.steps : currentFlow.steps,
            // Ensure uiConfig is properly updated
            uiConfig: updatedFlow.uiConfig || currentFlow.uiConfig
          };
          break;
        }
      }
      return newGroups;
    });
  }, []);

  const deleteFlow = useCallback((flowId: string, category: string): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const group = newGroups.find(g => g.category === category);
      if (group) {
        group.flows = group.flows.filter(f => f.id !== flowId);
      }
      return newGroups;
    });
  }, []);

  const toggleFlowLock = useCallback((flowId: string): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow) {
        flow.locked = !flow.locked;
      }
      return newGroups;
    });
  }, []);

  // Step Management
  const createStep = useCallback((flowId: string, step: FlowStep): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow && !flow.steps.some(s => s.id === step.id)) {
        flow.steps.push(step);
      }
      return newGroups;
    });
  }, []);

  const updateStep = useCallback((flowId: string, updatedStep: FlowStep): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow) {
        const stepIndex = flow.steps.findIndex(s => s.id === updatedStep.id);
        if (stepIndex > -1) {
          flow.steps[stepIndex] = updatedStep;
        }
      }
      return newGroups;
    });
  }, []);

  // Field Management
  const addFormField = useCallback((flowId: string, stepId: string, field: FormField): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow) {
        const step = flow.steps.find(s => s.id === stepId);
        if (step && !step.formFields.some(f => f.key === field.key)) {
          step.formFields.push(field);
        }
      }
      return newGroups;
    });
  }, []);

  const updateFormField = useCallback((flowId: string, stepId: string, updatedField: FormField): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow) {
        const step = flow.steps.find(s => s.id === stepId);
        if (step) {
          const fieldIndex = step.formFields.findIndex(f => f.key === updatedField.key);
          if (fieldIndex > -1) {
            step.formFields[fieldIndex] = updatedField;
          }
        }
      }
      return newGroups;
    });
  }, []);

  const deleteFormField = useCallback((flowId: string, stepId: string, fieldKey: string): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow) {
        const step = flow.steps.find(s => s.id === stepId);
        if (step) {
          step.formFields = step.formFields.filter(f => f.key !== fieldKey);
        }
      }
      return newGroups;
    });
  }, []);

  // Reordering (for drag-and-drop)
  const reorderSteps = useCallback((flowId: string, fromIndex: number, toIndex: number): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow && fromIndex !== toIndex) {
        const [movedStep] = flow.steps.splice(fromIndex, 1);
        flow.steps.splice(toIndex, 0, movedStep);
      }
      return newGroups;
    });
  }, []);

  const reorderFields = useCallback((flowId: string, stepId: string, fromIndex: number, toIndex: number): void => {
    setFlowGroups(groups => {
      const newGroups = [...groups];
      const flow = newGroups.flatMap(g => g.flows).find(f => f.id === flowId);
      if (flow) {
        const step = flow.steps.find(s => s.id === stepId);
        if (step && fromIndex !== toIndex) {
          const [movedField] = step.formFields.splice(fromIndex, 1);
          step.formFields.splice(toIndex, 0, movedField);
        }
      }
      return newGroups;
    });
  }, []);

  return {
    // State
    flowGroups,
    flowState,
    flows: getAllFlows(),
    
    // Flow execution
    startFlow,
    advanceFlow,
    regressFlow,
    fetchOptions,
    
    // Group management
    createFlowGroup,
    updateFlowGroup,
    deleteFlowGroup,
    moveFlowBetweenGroups,
    
    // Flow CRUD operations
    getFlow,
    getAllFlows,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    toggleFlowLock,
    
    // Step management
    createStep,
    updateStep,
    
    // Field management
    addFormField,
    updateFormField,
    deleteFormField,
    
    // Reordering
    reorderSteps,
    reorderFields,
  };
};
