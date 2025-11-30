/**
 * Component Catalog for Kiro Focus
 * 
 * Defines all 5 AWS-style infrastructure components available for purchase.
 * Each component includes: id, type, name, descriptions, icon, cost, tier,
 * prerequisites, category, and realWorldExample.
 * 
 * **Validates: Requirements 4.1**
 */

// AWS Architecture Icons - using icon.icepanel.io which hosts AWS icons
export const AWS_ICONS = {
  ec2: 'https://icon.icepanel.io/AWS/svg/Compute/EC2.svg',
  s3: 'https://icon.icepanel.io/AWS/svg/Storage/Simple-Storage-Service.svg',
  rds: 'https://icon.icepanel.io/AWS/svg/Database/RDS.svg',
  loadbalancer: 'https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Elastic-Load-Balancing.svg',
  cloudfront: 'https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/CloudFront.svg',
};

export const COMPONENTS_CATALOG = [
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
    category: 'Compute',
    realWorldExample: 'Netflix uses thousands of EC2 instances to stream video to millions of users worldwide. Each instance handles encoding, streaming, and serving content to viewers.'
  },
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
    category: 'Storage',
    realWorldExample: 'Dropbox stores billions of files on S3. When you upload a file to Dropbox, it gets stored in S3 buckets, making it accessible from anywhere.'
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
    category: 'Database',
    realWorldExample: 'Airbnb uses RDS to store listing information, user profiles, and booking data. The managed service handles millions of database queries daily.'
  },
  {
    id: 'loadbalancer',
    type: 'LoadBalancer',
    name: 'Load Balancer',
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
    category: 'Networking',
    realWorldExample: 'Twitter uses load balancers to handle millions of tweets per day. When you post a tweet, a load balancer routes your request to one of many available servers.'
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
    category: 'Content Delivery',
    realWorldExample: 'Spotify uses CloudFront to deliver album artwork and static assets. When you browse playlists, images load quickly because they\'re served from a nearby edge location.'
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
