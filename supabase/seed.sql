-- ============================================================
-- WordFlow AI — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ============================================================
-- THEME PACKS
-- ============================================================
insert into public.theme_packs (slug, name, description, color, icon) values
  ('corporate',  'Corporate',   'Business and professional vocabulary',     '#3b82f6', '💼'),
  ('daily_life', 'Daily Life',  'Everyday conversational vocabulary',       '#10b981', '🏠'),
  ('tech',       'Technology',  'Software, AI, and tech industry terms',    '#8b5cf6', '💻');

-- ============================================================
-- CORPORATE WORDS (35 words)
-- ============================================================
insert into public.words (theme_id, word, definition, difficulty)
select id, word, definition, difficulty from public.theme_packs
cross join (values
  ('Leverage',        'Use something to maximum advantage',                                    1),
  ('Synergy',         'Combined effort producing greater results than individual efforts',     1),
  ('Stakeholder',     'Person with interest or concern in a business',                        1),
  ('Deliverable',     'Output or result to be provided at end of a project',                  1),
  ('Bandwidth',       'Capacity to handle additional work or tasks',                          1),
  ('Escalate',        'Refer an issue to a higher authority for resolution',                  1),
  ('Agile',           'Flexible iterative approach to project management',                    2),
  ('Paradigm',        'A typical example or pattern that serves as a model',                  2),
  ('Actionable',      'Capable of being acted upon directly',                                 1),
  ('ROI',             'Return On Investment — profit relative to cost',                       1),
  ('Proactive',       'Acting in anticipation of future problems',                            1),
  ('Alignment',       'Agreement and consistency of goals across a team',                     2),
  ('Disruptive',      'Causing a fundamental change in an industry',                         2),
  ('Scalable',        'Able to grow in proportion to demand',                                 2),
  ('Onboarding',      'Process of integrating new employees into the organisation',           1),
  ('Pipeline',        'A series of processes through which something passes',                 2),
  ('Benchmark',       'Standard or point of reference for measurement',                       2),
  ('Incentivise',     'Motivate by offering a reward or benefit',                             2),
  ('Vertical',        'A specific industry or market segment',                                2),
  ('Pivot',           'Shift strategy or direction in response to feedback',                  2),
  ('KPI',             'Key Performance Indicator — measurable success metric',                1),
  ('Headcount',       'Total number of employees in an organisation',                         1),
  ('Runway',          'Time before a company runs out of funding',                            2),
  ('Traction',        'Evidence of growth or market demand',                                  2),
  ('Velocity',        'Speed of progress in a project or sprint',                             2),
  ('Cadence',         'Regular rhythm or frequency of meetings or updates',                   3),
  ('Bottleneck',      'A point of congestion slowing overall progress',                       2),
  ('Offsite',         'Meeting held outside the regular workplace',                           1),
  ('Exec',            'Executive — senior leader in an organisation',                         1),
  ('Greenfield',      'A new project with no legacy constraints',                             3),
  ('Low-hanging fruit','Easy quick wins that can be achieved with minimal effort',            1),
  ('Circling back',   'Returning to a previously raised topic',                               1),
  ('Deep dive',       'Thorough and detailed analysis of a subject',                          1),
  ('Touch base',      'Brief meeting or check-in to exchange updates',                        1),
  ('Game changer',    'Innovation that radically alters an industry',                         1)
) as w(word, definition, difficulty)
where public.theme_packs.slug = 'corporate';

-- ============================================================
-- DAILY LIFE WORDS (35 words)
-- ============================================================
insert into public.words (theme_id, word, definition, difficulty)
select id, word, definition, difficulty from public.theme_packs
cross join (values
  ('Errand',        'A short trip to carry out a task',                                     1),
  ('Groceries',     'Food and household items bought from a shop',                          1),
  ('Commute',       'Regular journey between home and work',                                1),
  ('Chores',        'Routine household tasks',                                              1),
  ('Budget',        'Plan for income and expenditure',                                      1),
  ('Routine',       'A regular sequence of actions',                                        1),
  ('Appointment',   'Arranged meeting at a set time',                                       1),
  ('Neighbourhood', 'The area surrounding where one lives',                                 1),
  ('Landlord',      'Person who rents property to a tenant',                                1),
  ('Utilities',     'Essential services like electricity, water, and gas',                  1),
  ('Pantry',        'Small room or cupboard for storing food',                              1),
  ('Subscription',  'Regular payment for continued service or access',                      1),
  ('Invoice',       'A bill listing goods or services provided',                            2),
  ('Warranty',      'Guarantee of product quality for a set period',                        2),
  ('Receipt',       'Proof of purchase or payment',                                         1),
  ('Mortgage',      'Loan used to purchase a property',                                     2),
  ('Lease',         'A contract for renting property or equipment',                         2),
  ('Negotiation',   'Discussion aimed at reaching an agreement',                            2),
  ('Refund',        'Return of money paid for a product or service',                        1),
  ('Deposit',       'Money paid upfront as security or part payment',                       1),
  ('Insurance',     'Financial protection against risk or loss',                            1),
  ('Ambulance',     'Vehicle equipped to transport sick or injured people',                 1),
  ('Prescription',  'Written order from a doctor for medicine',                             2),
  ('Ingredient',    'Component used in cooking a dish',                                     1),
  ('Recipe',        'Set of instructions for preparing a dish',                             1),
  ('Appliance',     'Electrical device used in the home',                                   2),
  ('Upholstery',    'Soft furnishing covering on furniture',                                3),
  ('Threshold',     'Strip of material at the bottom of a doorway',                         3),
  ('Amenity',       'Desirable or useful feature of a place',                               3),
  ('Declutter',     'Remove unnecessary items to organise a space',                         2),
  ('Housemate',     'Person who shares a house with others',                                1),
  ('Carpool',       'Share a car journey with others',                                      1),
  ('Takeaway',      'Cooked meal bought from a restaurant to eat elsewhere',                1),
  ('Leftovers',     'Food remaining after a meal',                                          1),
  ('Detergent',     'Cleaning substance used for washing clothes or dishes',                1)
) as w(word, definition, difficulty)
where public.theme_packs.slug = 'daily_life';

-- ============================================================
-- TECH WORDS (35 words)
-- ============================================================
insert into public.words (theme_id, word, definition, difficulty)
select id, word, definition, difficulty from public.theme_packs
cross join (values
  ('Algorithm',      'A step-by-step procedure to solve a problem',                         1),
  ('API',            'Application Programming Interface — a way for programs to talk',      1),
  ('Repository',     'Storage location for source code and history',                        1),
  ('Deployment',     'Process of releasing software to a server or users',                  1),
  ('Latency',        'Time delay between action and response',                              2),
  ('Cache',          'Temporary storage for quick data retrieval',                          1),
  ('Microservices',  'Architecture splitting an app into small independent services',       2),
  ('Containerisation','Packaging software with its dependencies for portability',           3),
  ('Refactor',       'Restructure existing code without changing its behaviour',            2),
  ('Abstraction',    'Hiding complex implementation behind a simple interface',             2),
  ('Polymorphism',   'Ability to process objects of different types uniformly',             3),
  ('Recursion',      'Function calling itself to solve a smaller sub-problem',              2),
  ('Webhook',        'HTTP callback triggered by an event in another system',               2),
  ('Authentication', 'Verifying the identity of a user or system',                          1),
  ('Authorisation',  'Granting or denying access rights to a resource',                     2),
  ('Encryption',     'Converting data into a coded format to prevent access',               1),
  ('Throttling',     'Limiting the rate of requests to a server',                           2),
  ('Scalability',    'Ability of a system to handle increased load',                        2),
  ('Middleware',     'Software acting as a bridge between components',                      2),
  ('IDE',            'Integrated Development Environment for writing code',                 1),
  ('Version control','System recording changes to files over time',                         1),
  ('CI/CD',          'Continuous Integration and Continuous Delivery pipeline',             2),
  ('Debugging',      'Finding and fixing errors in code',                                   1),
  ('Regression',     'A previously fixed bug that reappears',                               2),
  ('Payload',        'Data sent in a network request or response',                          2),
  ('Endpoint',       'Specific URL where an API can be accessed',                           2),
  ('Asynchronous',   'Operations that do not block the main thread while running',          3),
  ('Serverless',     'Cloud model where server management is abstracted away',              3),
  ('Token',          'A piece of data used for authentication or authorisation',            2),
  ('Framework',      'Pre-built structure providing tools and conventions for development', 1),
  ('Open source',    'Software whose source code is publicly available',                    1),
  ('Boilerplate',    'Reusable sections of code with little variation',                     2),
  ('Linting',        'Static code analysis to flag errors and style issues',                2),
  ('Prototype',      'Early model built to test concepts',                                  1),
  ('Iteration',      'Repetition of a process to approach a desired result',                1)
) as w(word, definition, difficulty)
where public.theme_packs.slug = 'tech';
