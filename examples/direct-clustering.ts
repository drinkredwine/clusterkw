import { KeywordClusterer } from '../src/keyword-clusterer';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  
  if (!apiKey) {
    console.error('OPENAI_API_KEY or OPENAI_KEY environment variable is required');
    process.exit(1);
  }

  // Initialize the clusterer with direct algorithm
  const clusterer = new KeywordClusterer({
    apiKey,
    algorithm: 'direct',
    completionModel: 'gpt-4o-mini-2024-07-18',
    minClusterSize: 2
  });

  // Example keywords (mixed topics)
  const keywords = [
    // Digital Marketing
    'social media marketing',
    'content marketing strategy',
    'SEO optimization',
    'PPC advertising',
    'email marketing campaigns',
    // Data Science
    'machine learning algorithms',
    'data visualization',
    'predictive analytics',
    'big data processing',
    'statistical modeling',
    // Web Development
    'responsive web design',
    'frontend frameworks',
    'backend development',
    'API integration',
    'database management',
    // Mobile Development
    'iOS app development',
    'Android development',
    'cross-platform frameworks',
    'mobile UI design',
    'app store optimization'
  ];

  console.log(`Clustering ${keywords.length} keywords using direct LLM-based clustering...\n`);
  
  // Cluster the keywords
  const startTime = Date.now();
  const clusters = await clusterer.clusterKeywords(keywords);
  const duration = Date.now() - startTime;
  
  // Output the results
  console.log(`Found ${clusters.length} clusters in ${duration}ms:\n`);
  
  clusters.forEach((cluster, index) => {
    console.log(`Cluster ${index + 1}: ${cluster.name}`);
    console.log(`Description: ${cluster.description}`);
    console.log('Keywords:');
    cluster.items.forEach(item => console.log(`  - ${item}`));
    console.log('');
  });
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});