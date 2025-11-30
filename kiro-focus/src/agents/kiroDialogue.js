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
