#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import * as path from 'path';
import csvParser from 'csv-parser';
import * as dotenv from 'dotenv';
import { KeywordClusterer } from './keyword-clusterer';

// Load environment variables
dotenv.config();

const program = new Command();

// Set up CLI options
program
  .name('clusterkw')
  .description('Cluster keywords using OpenAI embeddings')
  .version('0.1.0');

program
  .option('-f, --file <path>', 'Path to file containing keywords (supports txt, csv, json)')
  .option('-c, --column <name>', 'Column name containing keywords (for CSV files)', 'keyword')
  .option('-o, --output <path>', 'Output file path (supports json, csv)')
  .option('-k, --key <apiKey>', 'OpenAI API key (overrides OPENAI_API_KEY env variable)')
  .option('-m, --min-cluster-size <number>', 'Minimum cluster size', '2')
  .option('-d, --distance <number>', 'Maximum distance threshold', '0.3')
  .option('-e, --embedding-model <model>', 'OpenAI embedding model', 'text-embedding-3-small')
  .option('-g, --gpt-model <model>', 'OpenAI completion model', 'gpt-4o-mini-2024-07-18')
  .option('-a, --algorithm <algorithm>', 'Clustering algorithm (simple, kmeans, hierarchical)', 'simple')
  .option('--k <number>', 'Number of clusters for k-means algorithm')
  .option('--max-iterations <number>', 'Maximum iterations for k-means algorithm', '100')
  .option('--linkage <method>', 'Linkage method for hierarchical clustering (single, complete, average)', 'average')
  .option('--delimiter <char>', 'CSV delimiter', ',')
  .option('--no-header', 'CSV file has no header row');

program.parse(process.argv);

const options = program.opts();

async function main() {
  try {
    // Check if file is provided
    if (!options.file) {
      console.error('Error: File path is required. Use --file or -f option.');
      program.help();
      process.exit(1);
    }

    // Get API key with enhanced handling
    let apiKey = options.key || process.env.OPENAI_API_KEY;
    
    // If no API key found, check for .env file
    if (!apiKey) {
      try {
        // Check if .env file exists
        if (fs.existsSync('.env')) {
          console.log('Found .env file, loading environment variables...');
          // Force reload of .env file
          dotenv.config({ override: true });
          apiKey = process.env.OPENAI_API_KEY;
        }
      } catch (error) {
        console.warn('Error checking for .env file:', error.message);
      }
    }
    
    if (!apiKey) {
      console.error('Error: OpenAI API key is required. You can provide it via:');
      console.error('  1. --key command line option');
      console.error('  2. OPENAI_API_KEY environment variable');
      console.error('  3. .env file with OPENAI_API_KEY=your-key');
      process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(options.file)) {
      console.error(`Error: File not found: ${options.file}`);
      process.exit(1);
    }

    console.log(`Reading keywords from: ${options.file}`);
    
    // Read keywords from file
    const keywords = await readKeywordsFromFile(options.file, options);
    
    if (keywords.length === 0) {
      console.error('Error: No keywords found in the file.');
      process.exit(1);
    }

    console.log(`Found ${keywords.length} keywords.`);

    // Initialize clusterer
    const clusterer = new KeywordClusterer({
      apiKey,
      embeddingModel: options.embeddingModel,
      completionModel: options.gptModel,
      minClusterSize: parseInt(options.minClusterSize, 10),
      distanceThreshold: parseFloat(options.distance),
      algorithm: options.algorithm as any,
      k: options.k ? parseInt(options.k, 10) : undefined,
      maxIterations: parseInt(options.maxIterations, 10),
      linkage: options.linkage as any
    });
    
    console.log(`Using clustering algorithm: ${options.algorithm}`);

    console.log('Clustering keywords...');
    
    // Cluster keywords
    const clusters = await clusterer.clusterKeywords(keywords);
    
    console.log(`\nFound ${clusters.length} clusters:\n`);

    // Display clusters
    clusters.forEach((cluster, index) => {
      console.log(`Cluster ${index + 1}: ${cluster.name || 'Unnamed Cluster'}`);
      console.log(`Description: ${cluster.description || 'No description'}`);
      console.log(`Items (${cluster.items.length}):`);
      
      // Only show first 5 items if there are more than 10
      const displayItems = cluster.items.length > 10 
        ? [...cluster.items.slice(0, 5), `... and ${cluster.items.length - 5} more`] 
        : cluster.items;
      
      displayItems.forEach(item => console.log(`  - ${item}`));
      console.log('');
    });

    // Save output if specified
    if (options.output) {
      await saveOutput(clusters, options.output);
      console.log(`Results saved to: ${options.output}`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function readKeywordsFromFile(filePath: string, options: any): Promise<string[]> {
  const fileExt = path.extname(filePath).toLowerCase();
  
  // Read based on file extension
  switch (fileExt) {
    case '.csv':
      return readFromCSV(filePath, options);
    case '.json':
      return readFromJSON(filePath, options);
    case '.txt':
    default:
      return readFromTXT(filePath);
  }
}

async function readFromCSV(filePath: string, options: any): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const column = options.column;
    
    // Set up CSV parser
    const parser = fs.createReadStream(filePath)
      .pipe(csvParser({
        separator: options.delimiter,
        headers: options.header !== false
      }));
    
    parser.on('data', (data: Record<string, string>) => {
      // If headers are used, look for the specified column
      if (options.header !== false) {
        if (data[column]) {
          results.push(data[column]);
        }
      } else {
        // If no headers, take the first value from each row
        const firstValue = Object.values(data)[0];
        if (firstValue) {
          results.push(firstValue);
        }
      }
    });
    
    parser.on('end', () => {
      resolve(results);
    });
    
    parser.on('error', (error: Error) => {
      reject(error);
    });
  });
}

async function readFromJSON(filePath: string, options: any): Promise<string[]> {
  try {
    const data = await fs.readJSON(filePath);
    
    // Handle different JSON formats
    if (Array.isArray(data)) {
      // If it's an array of strings
      if (data.length > 0 && typeof data[0] === 'string') {
        return data as string[];
      }
      
      // If it's an array of objects
      if (data.length > 0 && typeof data[0] === 'object') {
        const column = options.column;
        return data
          .filter((item: Record<string, any>) => item[column])
          .map((item: Record<string, any>) => item[column] as string);
      }
    }
    
    // If it's an object with a keywords array
    if (data.keywords && Array.isArray(data.keywords)) {
      return data.keywords as string[];
    }
    
    throw new Error('Invalid JSON format. Expected an array of strings, array of objects with a keyword property, or an object with a keywords array.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse JSON file: ${error.message}`);
    }
    throw new Error('Failed to parse JSON file');
  }
}

async function readFromTXT(filePath: string): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    // Split by newlines and filter out empty lines
    return content.split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to read text file: ${error.message}`);
    }
    throw new Error('Failed to read text file');
  }
}

async function saveOutput(clusters: any[], outputPath: string) {
  const fileExt = path.extname(outputPath).toLowerCase();
  
  try {
    switch (fileExt) {
      case '.json':
        await fs.writeJSON(outputPath, clusters, { spaces: 2 });
        break;
      case '.csv':
        // Create CSV content
        const csvContent = [
          'cluster_id,cluster_name,cluster_description,keyword',
          ...clusters.flatMap((cluster, index) => 
            cluster.items.map((item: string) => 
              `${index + 1},"${(cluster.name || '').replace(/"/g, '""')}","${(cluster.description || '').replace(/"/g, '""')}","${item.replace(/"/g, '""')}"`
            )
          )
        ].join('\n');
        
        await fs.writeFile(outputPath, csvContent);
        break;
      default:
        // Default to JSON if extension is not recognized
        await fs.writeJSON(`${outputPath}.json`, clusters, { spaces: 2 });
        break;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to save output: ${error.message}`);
    }
    throw new Error('Failed to save output');
  }
}

main();