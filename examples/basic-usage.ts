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
    completionModel: 'gpt-3.5-turbo',
    minClusterSize: 2,
    distanceThreshold: 0.3
  });

  // Example keywords (Google Ads related)
  const keywords = [
    'digital marketing agency',
    'online marketing services',
    'digital advertising company',
    'SEO optimization services',
    'search engine optimization',
    'website SEO services',
    'social media marketing',
    'Facebook advertising',
    'Instagram marketing',
    'content marketing strategy',
    'blog writing services',
    'content creation agency',
    'PPC management services',
    'Google Ads campaigns',
    'pay per click advertising'
  ];

  console.log(`Clustering ${keywords.length} keywords...`);

  try {
    // Cluster the keywords
    const clusters = await clusterer.clusterKeywords(keywords);

    // Output the results
    console.log(`\nFound ${clusters.length} clusters:\n`);

    clusters.forEach((cluster, index) => {
      console.log(`Cluster ${index + 1}: ${cluster.name}`);
      console.log(`Description: ${cluster.description}`);
      console.log('Keywords:');
      cluster.items.forEach(item => console.log(`  - ${item}`));
      console.log('');
    });
  } catch (error) {
    console.error('Error clustering keywords:', error);
  }
}

main();