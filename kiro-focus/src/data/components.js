/**
 * Component Catalog for Kiro Focus
 * 
 * Defines all AWS-style infrastructure components available for purchase.
 * Each component includes: id, type, name, descriptions, icon, cost, tier,
 * prerequisites, category, realWorldExample, and docLinks.
 * 
 * **Validates: Requirements 4.1, 16.1, 16.2, 16.3, 18.1**
 */

import { COMPONENT_CATEGORIES } from '../utils/connectionRules';

// AWS Architecture Icons - using icon.icepanel.io which hosts AWS icons
export const AWS_ICONS = {
  ec2: 'https://icon.icepanel.io/AWS/svg/Compute/EC2.svg',
  s3: 'https://icon.icepanel.io/AWS/svg/Storage/Simple-Storage-Service.svg',
  rds: 'https://icon.icepanel.io/AWS/svg/Database/RDS.svg',
  loadbalancer: 'https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Elastic-Load-Balancing.svg',
  cloudfront: 'https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/CloudFront.svg',
  route53: 'https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Route-53.svg',
  ecs: 'https://icon.icepanel.io/AWS/svg/Containers/Elastic-Container-Service.svg',
  lambda: 'https://icon.icepanel.io/AWS/svg/Compute/Lambda.svg',
  dynamodb: 'https://icon.icepanel.io/AWS/svg/Database/DynamoDB.svg',
  elasticache: 'https://icon.icepanel.io/AWS/svg/Database/ElastiCache.svg',
  sqs: 'https://icon.icepanel.io/AWS/svg/App-Integration/Simple-Queue-Service.svg',
  sns: 'https://icon.icepanel.io/AWS/svg/App-Integration/Simple-Notification-Service.svg',
  eventbridge: 'https://icon.icepanel.io/AWS/svg/App-Integration/EventBridge.svg',
  cognito: 'https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/Cognito.svg',
  waf: 'https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/WAF.svg',
  cloudwatch: 'https://icon.icepanel.io/AWS/svg/Management-Governance/CloudWatch.svg',
};

export const COMPONENTS_CATALOG = [
  // ============ EDGE/NETWORKING/DNS ============
  {
    id: 'route53',
    type: 'Route53',
    name: 'Route 53',
    description: 'Scalable DNS and domain name registration service',
    fullDescription: 'Amazon Route 53 is a highly available and scalable Domain Name System (DNS) web service. It routes end users to Internet applications by translating domain names into IP addresses. Think of it as the phone book of the internet that directs traffic to your applications.',
    icon: 'Globe',
    awsIcon: AWS_ICONS.route53,
    cost: 30,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Basic DNS', cost: 30, description: 'Simple DNS routing for your domain' },
      { tier: 2, name: 'Health Checks', cost: 60, description: 'Automated health monitoring and failover' },
      { tier: 3, name: 'Geolocation', cost: 120, description: 'Route traffic based on user location' },
      { tier: 4, name: 'Traffic Flow', cost: 240, description: 'Advanced traffic management policies' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.EDGE,
    realWorldExample: 'Slack uses Route 53 to manage DNS for their global infrastructure, ensuring users are routed to the nearest data center for optimal performance.',
    docLinks: [
      { title: 'What is Amazon Route 53?', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html' },
      { title: 'Getting Started with Route 53', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/getting-started.html' },
      { title: 'Route 53 Routing Policies', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html' }
    ]
  },
  {
    id: 'cloudfront',
    type: 'CloudFront',
    name: 'CloudFront CDN',
    description: 'Content delivery network for fast global access',
    fullDescription: 'Amazon CloudFront is a content delivery network (CDN) that speeds up distribution of your static and dynamic web content. It caches your content at edge locations around the world, so users get faster load times.',
    icon: 'Globe',
    awsIcon: AWS_ICONS.cloudfront,
    cost: 70,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Basic CDN', cost: 70, description: 'Static content caching at edge locations' },
      { tier: 2, name: 'Dynamic CDN', cost: 140, description: 'Optimized for dynamic content and APIs' },
      { tier: 3, name: 'Secure CDN', cost: 280, description: 'WAF integration and DDoS protection' },
      { tier: 4, name: 'Enterprise CDN', cost: 560, description: 'Custom SSL, real-time logs, and field-level encryption' }
    ],
    prerequisites: ['s3'],
    category: COMPONENT_CATEGORIES.EDGE,
    realWorldExample: 'Spotify uses CloudFront to deliver album artwork and static assets. When you browse playlists, images load quickly because they\'re served from a nearby edge location.',
    docLinks: [
      { title: 'What is Amazon CloudFront?', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html' },
      { title: 'Getting Started with CloudFront', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html' },
      { title: 'CloudFront Use Cases', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/IntroductionUseCases.html' }
    ]
  },
  {
    id: 'loadbalancer',
    type: 'LoadBalancer',
    name: 'Application Load Balancer',
    description: 'Distributes traffic across multiple servers for reliability',
    fullDescription: 'Elastic Load Balancing automatically distributes incoming application traffic across multiple targets, such as EC2 instances. It ensures no single server gets overwhelmed and provides fault tolerance if a server fails.',
    icon: 'GitBranch',
    awsIcon: AWS_ICONS.loadbalancer,
    cost: 60,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Application LB', cost: 60, description: 'HTTP/HTTPS traffic routing with path-based rules' },
      { tier: 2, name: 'Network LB', cost: 120, description: 'Ultra-low latency for TCP/UDP traffic' },
      { tier: 3, name: 'Gateway LB', cost: 240, description: 'Third-party virtual appliance integration' },
      { tier: 4, name: 'Global Accelerator', cost: 480, description: 'Global traffic management with AWS edge locations' }
    ],
    prerequisites: ['ec2'],
    category: COMPONENT_CATEGORIES.LOAD_BALANCER,
    realWorldExample: 'Twitter uses load balancers to handle millions of tweets per day. When you post a tweet, a load balancer routes your request to one of many available servers.',
    docLinks: [
      { title: 'What is Elastic Load Balancing?', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html' },
      { title: 'Application Load Balancer Guide', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html' },
      { title: 'Load Balancer Listeners', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html' }
    ]
  },

  // ============ COMPUTE/CONTAINERS/SERVERLESS ============
  {
    id: 'ec2',
    type: 'EC2',
    name: 'EC2 Instance',
    description: 'Virtual computer in the cloud - the foundation of applications',
    fullDescription: 'Amazon EC2 (Elastic Compute Cloud) provides resizable compute capacity in the cloud. It allows you to run virtual servers, called instances, that can host your applications. Think of it as renting a computer that lives in Amazon\'s data centers.',
    icon: 'Server',
    awsIcon: AWS_ICONS.ec2,
    cost: 50,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 't2.micro', cost: 50, description: 'Entry-level instance for learning and small workloads' },
      { tier: 2, name: 't2.medium', cost: 100, description: '2x CPU and RAM for growing applications' },
      { tier: 3, name: 'm5.large', cost: 200, description: 'Production-ready with balanced compute and memory' },
      { tier: 4, name: 'c5.xlarge', cost: 400, description: 'Compute-optimized for intensive processing' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.COMPUTE,
    realWorldExample: 'Netflix uses thousands of EC2 instances to stream video to millions of users worldwide. Each instance handles encoding, streaming, and serving content to viewers.',
    docLinks: [
      { title: 'What is Amazon EC2?', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html' },
      { title: 'Getting Started with EC2', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html' },
      { title: 'EC2 Instance Types', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html' }
    ]
  },
  {
    id: 'ecs',
    type: 'ECS',
    name: 'ECS Service',
    description: 'Fully managed container orchestration service',
    fullDescription: 'Amazon Elastic Container Service (ECS) is a fully managed container orchestration service that makes it easy to deploy, manage, and scale containerized applications. It eliminates the need to install and operate your own container orchestration software.',
    icon: 'Server',
    awsIcon: AWS_ICONS.ecs,
    cost: 100,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Fargate', cost: 100, description: 'Serverless containers without managing servers' },
      { tier: 2, name: 'EC2 Launch', cost: 200, description: 'Run containers on your own EC2 instances' },
      { tier: 3, name: 'Auto Scaling', cost: 400, description: 'Automatic scaling based on demand' },
      { tier: 4, name: 'Service Mesh', cost: 800, description: 'Advanced networking with App Mesh integration' }
    ],
    prerequisites: ['ec2'],
    category: COMPONENT_CATEGORIES.COMPUTE,
    realWorldExample: 'Duolingo runs their language learning platform on ECS, allowing them to scale their microservices architecture to handle millions of daily lessons.',
    docLinks: [
      { title: 'What is Amazon ECS?', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html' },
      { title: 'Getting Started with ECS', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started.html' },
      { title: 'ECS Task Definitions', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html' }
    ]
  },
  {
    id: 'lambda',
    type: 'Lambda',
    name: 'Lambda Function',
    description: 'Run code without provisioning servers',
    fullDescription: 'AWS Lambda lets you run code without provisioning or managing servers. You pay only for the compute time you consume - there is no charge when your code is not running. Lambda automatically scales your application by running code in response to triggers.',
    icon: 'Zap',
    awsIcon: AWS_ICONS.lambda,
    cost: 40,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: '128 MB', cost: 40, description: 'Basic function for simple tasks' },
      { tier: 2, name: '512 MB', cost: 80, description: 'More memory for data processing' },
      { tier: 3, name: '1 GB', cost: 160, description: 'Production workloads with higher throughput' },
      { tier: 4, name: '10 GB', cost: 320, description: 'Memory-intensive ML and data tasks' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.SERVERLESS,
    realWorldExample: 'iRobot uses Lambda to process data from millions of Roomba vacuums, handling real-time events like cleaning schedules and status updates without managing any servers.',
    docLinks: [
      { title: 'What is AWS Lambda?', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' },
      { title: 'Getting Started with Lambda', url: 'https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html' },
      { title: 'Lambda Function URLs', url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html' }
    ]
  },

  // ============ STORAGE/DATABASES/CACHE ============
  {
    id: 's3',
    type: 'S3',
    name: 'S3 Bucket',
    description: 'Unlimited cloud storage for files, images, and data',
    fullDescription: 'Amazon S3 (Simple Storage Service) is object storage built to store and retrieve any amount of data. It\'s like having an infinite hard drive in the cloud where you can store files, images, videos, backups, and more.',
    icon: 'Database',
    awsIcon: AWS_ICONS.s3,
    cost: 30,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Standard', cost: 30, description: 'General purpose storage for frequently accessed data' },
      { tier: 2, name: 'Intelligent-Tiering', cost: 60, description: 'Automatic cost optimization based on access patterns' },
      { tier: 3, name: 'Glacier', cost: 120, description: 'Long-term archive storage with retrieval options' },
      { tier: 4, name: 'Multi-Region', cost: 240, description: 'Replicated across regions for disaster recovery' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.STORAGE,
    realWorldExample: 'Dropbox stores billions of files on S3. When you upload a file to Dropbox, it gets stored in S3 buckets, making it accessible from anywhere.',
    docLinks: [
      { title: 'What is Amazon S3?', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' },
      { title: 'Getting Started with S3', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html' },
      { title: 'S3 Storage Classes', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html' }
    ]
  },
  {
    id: 'rds',
    type: 'RDS',
    name: 'RDS Database',
    description: 'Managed relational database for structured data',
    fullDescription: 'Amazon RDS (Relational Database Service) makes it easy to set up, operate, and scale databases in the cloud. It handles backups, patching, and maintenance so you can focus on your application instead of database administration.',
    icon: 'HardDrive',
    awsIcon: AWS_ICONS.rds,
    cost: 80,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'db.t3.micro', cost: 80, description: 'Development database for testing and learning' },
      { tier: 2, name: 'db.t3.medium', cost: 160, description: 'Small production workloads with moderate traffic' },
      { tier: 3, name: 'db.r5.large', cost: 320, description: 'Memory-optimized for complex queries' },
      { tier: 4, name: 'db.r5.xlarge', cost: 640, description: 'High-performance for enterprise applications' }
    ],
    prerequisites: ['ec2'],
    category: COMPONENT_CATEGORIES.DATABASE,
    realWorldExample: 'Airbnb uses RDS to store listing information, user profiles, and booking data. The managed service handles millions of database queries daily.',
    docLinks: [
      { title: 'What is Amazon RDS?', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html' },
      { title: 'Getting Started with RDS', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.html' },
      { title: 'RDS DB Instance Classes', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.html' }
    ]
  },
  {
    id: 'dynamodb',
    type: 'DynamoDB',
    name: 'DynamoDB Table',
    description: 'Fast and flexible NoSQL database for any scale',
    fullDescription: 'Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. It\'s designed for applications that need consistent, single-digit millisecond latency at any scale.',
    icon: 'Database',
    awsIcon: AWS_ICONS.dynamodb,
    cost: 60,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'On-Demand', cost: 60, description: 'Pay-per-request pricing for variable workloads' },
      { tier: 2, name: 'Provisioned', cost: 120, description: 'Reserved capacity for predictable workloads' },
      { tier: 3, name: 'Global Tables', cost: 240, description: 'Multi-region replication for global apps' },
      { tier: 4, name: 'DAX Cache', cost: 480, description: 'In-memory acceleration for microsecond latency' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.DATABASE,
    realWorldExample: 'Amazon.com uses DynamoDB to handle Prime Day traffic, processing millions of requests per second during peak shopping events.',
    docLinks: [
      { title: 'What is Amazon DynamoDB?', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html' },
      { title: 'Getting Started with DynamoDB', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStartedDynamoDB.html' },
      { title: 'DynamoDB Core Components', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html' }
    ]
  },
  {
    id: 'elasticache',
    type: 'ElastiCache',
    name: 'ElastiCache Redis',
    description: 'In-memory caching for ultra-fast data access',
    fullDescription: 'Amazon ElastiCache is a fully managed in-memory caching service that improves the performance of web applications by retrieving data from fast, managed, in-memory caches instead of slower disk-based databases.',
    icon: 'Database',
    awsIcon: AWS_ICONS.elasticache,
    cost: 80,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'cache.t3.micro', cost: 80, description: 'Development cache for testing' },
      { tier: 2, name: 'cache.t3.medium', cost: 160, description: 'Small production workloads' },
      { tier: 3, name: 'cache.r5.large', cost: 320, description: 'Memory-optimized for large datasets' },
      { tier: 4, name: 'cache.r5.xlarge', cost: 640, description: 'High-performance caching cluster' }
    ],
    prerequisites: ['ec2'],
    category: COMPONENT_CATEGORIES.CACHE,
    realWorldExample: 'Expedia uses ElastiCache to cache hotel search results, reducing database load and delivering sub-millisecond response times for millions of travel searches.',
    docLinks: [
      { title: 'What is Amazon ElastiCache?', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html' },
      { title: 'Getting Started with ElastiCache', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/GettingStarted.html' },
      { title: 'ElastiCache Best Practices', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html' }
    ]
  },

  // ============ ASYNC/INTEGRATION ============
  {
    id: 'sqs',
    type: 'SQS',
    name: 'SQS Queue',
    description: 'Fully managed message queuing service',
    fullDescription: 'Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications. It eliminates the complexity of managing message-oriented middleware.',
    icon: 'MessageSquare',
    awsIcon: AWS_ICONS.sqs,
    cost: 40,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Standard Queue', cost: 40, description: 'Best-effort ordering, at-least-once delivery' },
      { tier: 2, name: 'FIFO Queue', cost: 80, description: 'Exactly-once processing, strict ordering' },
      { tier: 3, name: 'Long Polling', cost: 160, description: 'Reduced costs with efficient message retrieval' },
      { tier: 4, name: 'Dead Letter', cost: 320, description: 'Advanced error handling and retry logic' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.ASYNC,
    realWorldExample: 'Capital One uses SQS to process millions of financial transactions, ensuring reliable message delivery even during peak banking hours.',
    docLinks: [
      { title: 'What is Amazon SQS?', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html' },
      { title: 'Getting Started with SQS', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-getting-started.html' },
      { title: 'SQS FIFO Queues', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html' }
    ]
  },
  {
    id: 'sns',
    type: 'SNS',
    name: 'SNS Topic',
    description: 'Pub/sub messaging for microservices and serverless',
    fullDescription: 'Amazon Simple Notification Service (SNS) is a fully managed messaging service for both application-to-application (A2A) and application-to-person (A2P) communication. It enables you to fan out messages to multiple subscribers.',
    icon: 'Bell',
    awsIcon: AWS_ICONS.sns,
    cost: 35,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Standard Topic', cost: 35, description: 'Best-effort message delivery' },
      { tier: 2, name: 'FIFO Topic', cost: 70, description: 'Strict ordering and deduplication' },
      { tier: 3, name: 'SMS/Email', cost: 140, description: 'Direct notifications to users' },
      { tier: 4, name: 'Mobile Push', cost: 280, description: 'Push notifications to mobile devices' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.ASYNC,
    realWorldExample: 'NASA uses SNS to broadcast real-time mission updates to multiple systems simultaneously, from ground control displays to public websites.',
    docLinks: [
      { title: 'What is Amazon SNS?', url: 'https://docs.aws.amazon.com/sns/latest/dg/welcome.html' },
      { title: 'Getting Started with SNS', url: 'https://docs.aws.amazon.com/sns/latest/dg/sns-getting-started.html' },
      { title: 'SNS Message Filtering', url: 'https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html' }
    ]
  },
  {
    id: 'eventbridge',
    type: 'EventBridge',
    name: 'EventBridge Bus',
    description: 'Serverless event bus for event-driven architectures',
    fullDescription: 'Amazon EventBridge is a serverless event bus that makes it easier to build event-driven applications at scale. It connects applications using events, routing data from sources like your own apps, SaaS applications, and AWS services.',
    icon: 'Workflow',
    awsIcon: AWS_ICONS.eventbridge,
    cost: 50,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Default Bus', cost: 50, description: 'AWS service events and custom events' },
      { tier: 2, name: 'Custom Bus', cost: 100, description: 'Isolated event bus for your application' },
      { tier: 3, name: 'Partner Events', cost: 200, description: 'SaaS integrations (Zendesk, Datadog, etc.)' },
      { tier: 4, name: 'Archive/Replay', cost: 400, description: 'Event archiving and replay capabilities' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.ASYNC,
    realWorldExample: 'Coca-Cola uses EventBridge to coordinate their vending machine network, processing events from thousands of machines to manage inventory and maintenance.',
    docLinks: [
      { title: 'What is Amazon EventBridge?', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html' },
      { title: 'Getting Started with EventBridge', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-get-started.html' },
      { title: 'EventBridge Event Patterns', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html' }
    ]
  },

  // ============ AUTH/SECURITY/OBSERVABILITY ============
  {
    id: 'cognito',
    type: 'Cognito',
    name: 'Cognito User Pool',
    description: 'User authentication and authorization service',
    fullDescription: 'Amazon Cognito provides authentication, authorization, and user management for your web and mobile apps. Users can sign in directly with a username and password, or through third parties like Facebook, Amazon, Google, or Apple.',
    icon: 'Users',
    awsIcon: AWS_ICONS.cognito,
    cost: 70,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'User Pool', cost: 70, description: 'User directory with sign-up and sign-in' },
      { tier: 2, name: 'Social Login', cost: 140, description: 'Google, Facebook, Apple sign-in' },
      { tier: 3, name: 'MFA', cost: 280, description: 'Multi-factor authentication' },
      { tier: 4, name: 'Advanced Security', cost: 560, description: 'Adaptive authentication and threat protection' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.AUTH,
    realWorldExample: 'Fox Broadcasting uses Cognito to manage user authentication for their streaming apps, handling millions of user sign-ins during live events.',
    docLinks: [
      { title: 'What is Amazon Cognito?', url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html' },
      { title: 'Getting Started with User Pools', url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html' },
      { title: 'Cognito User Pool Authentication', url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow.html' }
    ]
  },
  {
    id: 'waf',
    type: 'WAF',
    name: 'WAF Web ACL',
    description: 'Web application firewall for protection against attacks',
    fullDescription: 'AWS WAF is a web application firewall that helps protect your web applications from common web exploits and bots that may affect availability, compromise security, or consume excessive resources.',
    icon: 'Shield',
    awsIcon: AWS_ICONS.waf,
    cost: 90,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Basic Rules', cost: 90, description: 'IP blocking and rate limiting' },
      { tier: 2, name: 'Managed Rules', cost: 180, description: 'AWS managed rule groups for common threats' },
      { tier: 3, name: 'Bot Control', cost: 360, description: 'Advanced bot detection and mitigation' },
      { tier: 4, name: 'Fraud Control', cost: 720, description: 'Account takeover and fraud prevention' }
    ],
    prerequisites: ['loadbalancer'],
    category: COMPONENT_CATEGORIES.SECURITY,
    realWorldExample: 'Robinhood uses WAF to protect their trading platform from DDoS attacks and malicious bots, ensuring their users can trade securely during market hours.',
    docLinks: [
      { title: 'What is AWS WAF?', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html' },
      { title: 'Getting Started with AWS WAF', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/getting-started.html' },
      { title: 'AWS WAF Rule Groups', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-groups.html' }
    ]
  },
  {
    id: 'cloudwatch',
    type: 'CloudWatch',
    name: 'CloudWatch',
    description: 'Monitoring and observability for AWS resources',
    fullDescription: 'Amazon CloudWatch is a monitoring and observability service that provides data and actionable insights for AWS, hybrid, and on-premises applications and infrastructure. It collects monitoring and operational data in the form of logs, metrics, and events.',
    icon: 'Activity',
    awsIcon: AWS_ICONS.cloudwatch,
    cost: 45,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: 'Basic Metrics', cost: 45, description: 'Standard AWS resource metrics' },
      { tier: 2, name: 'Custom Metrics', cost: 90, description: 'Application-specific metrics' },
      { tier: 3, name: 'Logs Insights', cost: 180, description: 'Advanced log querying and analysis' },
      { tier: 4, name: 'Container Insights', cost: 360, description: 'Deep container and Kubernetes monitoring' }
    ],
    prerequisites: null,
    category: COMPONENT_CATEGORIES.OBSERVABILITY,
    realWorldExample: 'Lyft uses CloudWatch to monitor their ride-sharing platform, tracking millions of metrics to ensure drivers and riders have a seamless experience.',
    docLinks: [
      { title: 'What is Amazon CloudWatch?', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html' },
      { title: 'Getting Started with CloudWatch', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/GettingStarted.html' },
      { title: 'CloudWatch Alarms', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html' }
    ]
  }
];

/**
 * Get a component by its ID
 * @param {string} id - Component ID
 * @returns {Object|undefined} - Component object or undefined
 */
export function getComponentById(id) {
  return COMPONENTS_CATALOG.find(c => c.id === id);
}

/**
 * Get all components in a category
 * @param {string} category - Category name
 * @returns {Array} - Array of components in that category
 */
export function getComponentsByCategory(category) {
  return COMPONENTS_CATALOG.filter(c => c.category === category);
}

/**
 * Get all unique categories
 * @returns {Array} - Array of category names
 */
export function getCategories() {
  return [...new Set(COMPONENTS_CATALOG.map(c => c.category))];
}
