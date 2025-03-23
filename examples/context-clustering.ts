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

  // Example keywords (mixed topics that could be interpreted differently based on context)
  const keywords = [
    'chat',
    'message',
    'conversation',
    'thread',
    'response',
    'reply',
    'notification',
    'alert',
    'mention',
    'tag',
    'search',
    'filter',
    'sort',
    'view',
    'dashboard'
  ];

  console.log('Clustering the same keywords with different contexts...\n');

  // First, cluster without context
  await clusterWithContext(apiKey, keywords, undefined);

  // Then, cluster with AI chat app context
  await clusterWithContext(apiKey, keywords, 'AI chat application features');

  // Finally, cluster with project management context
  await clusterWithContext(apiKey, keywords, 'project management software features');
}

async function clusterWithContext(apiKey: string, keywords: string[], context?: string) {
  console.log(`\n=== ${context || 'NO CONTEXT'} ===\n`);
  
  // Initialize clusterer with the specified context
  const clusterer = new KeywordClusterer({
    apiKey,
    algorithm: 'direct',
    completionModel: 'gpt-4o-mini-2024-07-18',
    minClusterSize: 2,
    context
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
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});