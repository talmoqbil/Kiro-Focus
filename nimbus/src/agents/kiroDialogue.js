/**
 * Kiro Dialogue - Fallback messages for when AI agents are unavailable
 * Requirements: 11.1, 11.3
 * 
 * These messages are used when:
 * - Agent API calls timeout (>5s)
 * - Agent API returns an error
 * - Rate limit is exceeded
 */

/**
 * Focus Coach fallback messages by mode
 * These are context-specific messages that match the user's current situation
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export const FOCUS_COACH_FALLBACKS = {
  encouragement: [
    "Starting a focus session! You've got this - let's earn some Cloud Credits together.",
    "Focus mode activated! I'll be here cheering you on. Let's build that cloud empire!",
    "Time to focus! Every minute counts toward your next AWS component.",
    "Session starting! Clear your mind and let's make this count.",
    "Let's do this! I believe in you. Stay focused and the credits will flow."
  ],
  
  analysis: [
    "Session complete! Amazing work - you just earned credits for your cloud infrastructure!",
    "You did it! Another successful focus session in the books. Your dedication is inspiring!",
    "Fantastic job finishing that session! Your focus muscles are getting stronger.",
    "Session completed successfully! Those credits are now yours to spend in the shop.",
    "Well done! You stayed focused and earned your reward. I'm proud of you!"
  ],
  
  motivation: [
    "Welcome back! I missed you. Ready to jump back into focusing?",
    "Hey, you're back! No pressure - let's ease into a session when you're ready.",
    "Good to see you again! Your cloud infrastructure has been waiting for you.",
    "Welcome back, friend! Take your time, and let's start fresh together.",
    "You returned! That takes courage. Ready for another focus adventure?"
  ],
  
  supportive: [
    "Session ended early - that's okay! Sometimes we need to stop. Try a shorter session next time?",
    "No worries about stopping early. Rest is part of the process. You still earned partial credits!",
    "It's okay to end early. Maybe a 15-minute session would work better? You've got this!",
    "Session abandoned, but that's alright. Every attempt teaches us something. Try again when ready!",
    "Stopping early is fine - listen to your body. You still made progress today!"
  ]
};

/**
 * Cloud Architect fallback explanations by component type
 * Requirements: 8.1, 8.2
 */
export const ARCHITECT_COMPONENT_EXPLANATIONS = {
  ec2: {
    explanation: "EC2 is like renting a computer in the cloud. It's the foundation of most cloud applications - your own virtual server to run whatever you need!",
    suggestedNext: "s3",
    reasoning: "S3 pairs great with EC2 for storing files, images, and backups.",
    educationalNote: "Netflix runs thousands of EC2 instances to stream to millions of users!"
  },
  
  s3: {
    explanation: "S3 is cloud storage that scales infinitely. Think of it as a giant filing cabinet that never runs out of space and is accessible from anywhere.",
    suggestedNext: "cloudfront",
    reasoning: "CloudFront can serve your S3 content faster by caching it closer to users.",
    educationalNote: "Dropbox started by storing all user files in S3!"
  },
  
  rds: {
    explanation: "RDS is a managed database service. Instead of setting up and maintaining your own database server, AWS handles all the heavy lifting for you.",
    suggestedNext: "ec2",
    reasoning: "EC2 instances typically connect to RDS to store and retrieve application data.",
    educationalNote: "Airbnb uses RDS to manage their massive booking database!"
  },
  
  loadbalancer: {
    explanation: "A Load Balancer distributes incoming traffic across multiple servers. It's like a traffic cop making sure no single server gets overwhelmed.",
    suggestedNext: "ec2",
    reasoning: "You'll want multiple EC2 instances behind your load balancer for high availability.",
    educationalNote: "Amazon.com uses load balancers to handle millions of shoppers during Prime Day!"
  },
  
  cloudfront: {
    explanation: "CloudFront is a CDN that caches your content at edge locations worldwide. It makes your app faster by serving content from servers closer to your users.",
    suggestedNext: "s3",
    reasoning: "CloudFront works beautifully with S3 to serve static assets lightning fast.",
    educationalNote: "Slack uses CloudFront to deliver their web app quickly to teams worldwide!"
  },
  
  route53: {
    explanation: "Route 53 is AWS's DNS service - it's like the phone book of the internet, translating domain names into IP addresses so users can find your app.",
    suggestedNext: "cloudfront",
    reasoning: "Route 53 pairs perfectly with CloudFront to route users to your cached content.",
    educationalNote: "Slack uses Route 53 to manage DNS for their global infrastructure!"
  },
  
  lambda: {
    explanation: "Lambda lets you run code without managing servers. Just upload your function and AWS handles everything else - scaling, patching, and availability!",
    suggestedNext: "dynamodb",
    reasoning: "DynamoDB is the perfect serverless database companion for Lambda functions.",
    educationalNote: "iRobot uses Lambda to process data from millions of Roomba vacuums!"
  },
  
  dynamodb: {
    explanation: "DynamoDB is a lightning-fast NoSQL database that scales automatically. It's perfect for apps that need consistent, single-digit millisecond response times.",
    suggestedNext: "lambda",
    reasoning: "Lambda functions work seamlessly with DynamoDB for serverless architectures.",
    educationalNote: "Amazon.com uses DynamoDB to handle Prime Day traffic - millions of requests per second!"
  },
  
  ecs: {
    explanation: "ECS runs your Docker containers without the hassle of managing servers. It's like having a team that deploys and scales your containers automatically.",
    suggestedNext: "loadbalancer",
    reasoning: "A load balancer in front of ECS distributes traffic across your containers.",
    educationalNote: "Duolingo runs their language learning platform on ECS!"
  },
  
  elasticache: {
    explanation: "ElastiCache is an in-memory cache that makes your app blazing fast. Instead of hitting the database every time, frequently accessed data lives in memory.",
    suggestedNext: "rds",
    reasoning: "ElastiCache works great in front of RDS to cache frequent database queries.",
    educationalNote: "Expedia uses ElastiCache for sub-millisecond hotel search results!"
  },
  
  sqs: {
    explanation: "SQS is a message queue that lets services communicate reliably. Think of it as a to-do list that ensures no task gets lost, even if services go down.",
    suggestedNext: "lambda",
    reasoning: "Lambda can automatically process messages from SQS queues.",
    educationalNote: "Capital One uses SQS to process millions of financial transactions!"
  },
  
  sns: {
    explanation: "SNS sends notifications to multiple subscribers at once. It's like a megaphone that broadcasts messages to Lambda functions, queues, or even phones!",
    suggestedNext: "sqs",
    reasoning: "SNS and SQS together create powerful fan-out patterns for event processing.",
    educationalNote: "NASA uses SNS to broadcast real-time mission updates to multiple systems!"
  },
  
  eventbridge: {
    explanation: "EventBridge is an event bus that connects your applications. Events flow in, rules match them, and targets react - all without writing integration code.",
    suggestedNext: "lambda",
    reasoning: "Lambda functions are perfect targets for EventBridge rules.",
    educationalNote: "Coca-Cola uses EventBridge to coordinate their vending machine network!"
  },
  
  cognito: {
    explanation: "Cognito handles user sign-up, sign-in, and access control. It's like having a bouncer for your app that also remembers everyone's face.",
    suggestedNext: "lambda",
    reasoning: "Cognito integrates seamlessly with Lambda for custom authentication flows.",
    educationalNote: "Fox Broadcasting uses Cognito for millions of streaming app sign-ins!"
  },
  
  waf: {
    explanation: "WAF is a web application firewall that protects your app from attacks. It blocks malicious traffic before it reaches your servers.",
    suggestedNext: "cloudfront",
    reasoning: "WAF works great with CloudFront to protect your entire CDN edge.",
    educationalNote: "Robinhood uses WAF to protect their trading platform from attacks!"
  },
  
  cloudwatch: {
    explanation: "CloudWatch monitors everything in your AWS infrastructure. It collects logs, tracks metrics, and alerts you when something needs attention.",
    suggestedNext: "ec2",
    reasoning: "CloudWatch automatically monitors EC2 instances and can trigger auto-scaling.",
    educationalNote: "Lyft uses CloudWatch to monitor their ride-sharing platform in real-time!"
  }
};

/**
 * Architecture pattern recognition messages
 * Requirements: 8.6
 */
export const ARCHITECTURE_PATTERNS = {
  'web-server': {
    components: ['ec2'],
    message: "You've got a basic web server setup! This is where every cloud journey begins."
  },
  'static-website': {
    components: ['s3', 'cloudfront'],
    message: "Nice! You've built a static website architecture. Fast and cost-effective!"
  },
  'basic-web-app': {
    components: ['ec2', 'rds'],
    message: "A classic web application setup! Your server can now persist data reliably."
  },
  'scalable-web-app': {
    components: ['ec2', 'rds', 'loadbalancer'],
    message: "You're building for scale! This architecture can handle growing traffic."
  },
  'three-tier': {
    components: ['loadbalancer', 'ec2', 'rds'],
    message: "Congratulations! You've built a 3-tier architecture - the industry standard for web apps!"
  },
  'full-stack': {
    components: ['ec2', 's3', 'rds', 'loadbalancer', 'cloudfront'],
    message: "Wow! You've built a complete cloud infrastructure. You're a true cloud architect!"
  }
};

/**
 * Generic error recovery messages
 * Requirements: 11.3
 */
export const ERROR_RECOVERY_MESSAGES = [
  "Hmm, I'm having trouble thinking right now. But you're doing great!",
  "My cloud brain is a bit foggy. Keep up the good work though!",
  "I'll be back with better advice soon. In the meantime, trust your instincts!",
  "Technical difficulties on my end. You've got this without me!",
  "Oops, my thoughts got lost in the cloud. But you're still awesome!"
];

/**
 * Get a random fallback message for Focus Coach
 * @param {string} mode - 'encouragement' | 'analysis' | 'motivation' | 'supportive'
 * @returns {Object} - Fallback response object
 */
export function getFocusCoachFallback(mode) {
  const messages = FOCUS_COACH_FALLBACKS[mode] || FOCUS_COACH_FALLBACKS.encouragement;
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    message,
    suggestedDuration: mode === 'supportive' ? 900 : null, // Suggest 15 min for supportive
    tone: mode === 'analysis' ? 'celebratory' : 
          mode === 'supportive' ? 'supportive' : 'gentle'
  };
}

/**
 * Get a fallback explanation for Architect Agent
 * @param {string} componentType - The component type (ec2, s3, rds, etc.)
 * @returns {Object} - Fallback response object
 */
export function getArchitectFallback(componentType) {
  const explanation = ARCHITECT_COMPONENT_EXPLANATIONS[componentType.toLowerCase()];
  
  if (explanation) {
    return explanation;
  }
  
  // Generic fallback if component type is unknown
  return {
    explanation: "This is a powerful cloud component that will enhance your infrastructure!",
    suggestedNext: "ec2",
    reasoning: "EC2 is always a solid foundation for any architecture.",
    educationalNote: "The cloud is all about building blocks that work together!"
  };
}

/**
 * Get a random error recovery message
 * @returns {string}
 */
export function getErrorRecoveryMessage() {
  return ERROR_RECOVERY_MESSAGES[Math.floor(Math.random() * ERROR_RECOVERY_MESSAGES.length)];
}

/**
 * Check if owned components match a known architecture pattern
 * @param {string[]} ownedComponents - Array of owned component IDs
 * @returns {Object|null} - Pattern info or null if no match
 */
export function detectArchitecturePattern(ownedComponents) {
  const owned = new Set(ownedComponents.map(c => c.toLowerCase()));
  
  // Check patterns from most complex to simplest
  const patternOrder = ['full-stack', 'three-tier', 'scalable-web-app', 'basic-web-app', 'static-website', 'web-server'];
  
  for (const patternKey of patternOrder) {
    const pattern = ARCHITECTURE_PATTERNS[patternKey];
    const hasAllComponents = pattern.components.every(c => owned.has(c));
    
    if (hasAllComponents && owned.size === pattern.components.length) {
      return {
        pattern: patternKey,
        ...pattern
      };
    }
  }
  
  return null;
}
