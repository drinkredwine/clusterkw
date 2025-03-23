import { KeywordClusterer } from '../src/keyword-clusterer';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  // Example keywords (mixed topics)
  const keywords = [
    // Machine Learning
    'machine learning algorithms',
    'deep learning frameworks',
    'neural networks',
    'supervised learning',
    'reinforcement learning',
    // Data Visualization
    'data visualization tools',
    'interactive dashboards',
    'chart types',
    'business intelligence',
    'data storytelling',
    // Web Development
    'frontend frameworks',
    'responsive design',
    'CSS preprocessors',
    'JavaScript libraries',
    'web accessibility',
    // Cloud Computing
    'cloud infrastructure',
    'serverless architecture',
    'container orchestration',
    'microservices',
    'cloud providers'
  ];

  console.log(`Clustering ${keywords.length} keywords using different algorithms...\n`);

  // Compare different clustering algorithms
  await compareAlgorithms(apiKey, keywords);
}

async function compareAlgorithms(apiKey: string, keywords: string[]) {
  const algorithms = ['simple', 'kmeans', 'hierarchical'] as const;
  
  for (const algorithm of algorithms) {
    console.log(`\n=== ${algorithm.toUpperCase()} CLUSTERING ===\n`);
    
    // Initialize clusterer with the current algorithm
    const clusterer = new KeywordClusterer({
      apiKey,
      algorithm: algorithm as any,
      minClusterSize: 2,
      distanceThreshold: 0.3,
      k: algorithm === 'kmeans' ? 4 : undefined,
      linkage: algorithm === 'hierarchical' ? 'average' : undefined
    });
    
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
    
    // Print a separator
    console.log('-'.repeat(50));
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});