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

  // Initialize the clusterer
  const clusterer = new KeywordClusterer({
    apiKey,
    embeddingModel: 'text-embedding-3-small',
    completionModel: 'gpt-4o-mini-2024-07-18',
    minClusterSize: 2,
    distanceThreshold: 0.25
  });

  // Example AI chat topics
  const chatTopics = [
    'How to train a machine learning model',
    'Best practices for neural networks',
    'Difference between supervised and unsupervised learning',
    'How to make homemade pasta',
    'Italian cooking techniques',
    'Best recipes for beginners',
    'Tips for growing vegetables in small spaces',
    'Indoor gardening for apartments',
    'How to care for houseplants',
    'Renewable energy sources explained',
    'Solar panel installation guide',
    'Wind power vs solar power comparison',
    'Effective study techniques for college',
    'How to improve memory retention',
    'Note-taking methods for students'
  ];

  console.log(`Clustering ${chatTopics.length} AI chat topics...`);

  try {
    // Cluster the topics
    const clusters = await clusterer.clusterKeywords(chatTopics);

    // Output the results
    console.log(`\nFound ${clusters.length} topic clusters:\n`);

    clusters.forEach((cluster, index) => {
      console.log(`Topic Cluster ${index + 1}: ${cluster.name}`);
      console.log(`Description: ${cluster.description}`);
      console.log('Topics:');
      cluster.items.forEach(item => console.log(`  - ${item}`));
      console.log('');
    });
  } catch (error) {
    console.error('Error clustering chat topics:', error);
  }
}

main();