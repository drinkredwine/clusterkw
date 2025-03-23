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
    distanceThreshold: 0.3
  });

  // Example project tasks
  const projectTasks = [
    'Design database schema',
    'Create entity relationship diagram',
    'Implement database migrations',
    'Design user interface mockups',
    'Create wireframes for mobile app',
    'Design responsive layouts',
    'Implement authentication system',
    'Add user login functionality',
    'Create password reset feature',
    'Write unit tests for API endpoints',
    'Set up integration testing',
    'Configure CI/CD pipeline',
    'Deploy application to staging',
    'Configure production environment',
    'Set up monitoring and alerts',
    'Write user documentation',
    'Create API documentation',
    'Prepare training materials'
  ];

  console.log(`Clustering ${projectTasks.length} project tasks...`);

  try {
    // Cluster the tasks
    const clusters = await clusterer.clusterKeywords(projectTasks);

    // Output the results
    console.log(`\nFound ${clusters.length} task clusters:\n`);

    clusters.forEach((cluster, index) => {
      console.log(`Task Group ${index + 1}: ${cluster.name}`);
      console.log(`Description: ${cluster.description}`);
      console.log('Tasks:');
      cluster.items.forEach(item => console.log(`  - ${item}`));
      console.log('');
    });
  } catch (error) {
    console.error('Error clustering project tasks:', error);
  }
}

main();