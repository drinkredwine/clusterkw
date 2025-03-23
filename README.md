# Keyword Clustering

A Node.js package for clustering keywords using OpenAI embeddings. This package can be used to cluster Google Ads keywords, AI chat topics, project tasks, or any other text-based items into semantically similar groups.

## Features

- Generate embeddings for keywords using OpenAI API
- Calculate distances between keywords
- Create clusters of semantically similar keywords
- Automatically generate cluster names and descriptions using OpenAI API

## Installation

```bash
npm install keyword-clustering
```

## Usage

```typescript
import { KeywordClusterer } from 'keyword-clustering';

// Initialize with your OpenAI API key
const clusterer = new KeywordClusterer({
  apiKey: 'your-openai-api-key',
  // Optional configuration
  embeddingModel: 'text-embedding-3-small',
  completionModel: 'gpt-3.5-turbo',
  minClusterSize: 3,
  distanceThreshold: 0.2
});

// Example keywords
const keywords = [
  'machine learning algorithms',
  'deep learning frameworks',
  'neural networks',
  'data visualization tools',
  'business intelligence software',
  'data analytics platforms',
  'artificial intelligence applications',
  'natural language processing',
  'computer vision systems',
  'reinforcement learning'
];

// Cluster the keywords
const clusters = await clusterer.clusterKeywords(keywords);

// Output the clusters with their names and descriptions
console.log(clusters);
```

## API Reference

### `KeywordClusterer`

The main class for clustering keywords.

#### Constructor Options

- `apiKey` (string, required): Your OpenAI API key
- `embeddingModel` (string, optional): The OpenAI model to use for embeddings. Default: 'text-embedding-3-small'
- `completionModel` (string, optional): The OpenAI model to use for generating cluster names and descriptions. Default: 'gpt-3.5-turbo'
- `minClusterSize` (number, optional): Minimum number of items to form a cluster. Default: 2
- `distanceThreshold` (number, optional): Maximum cosine distance for items to be considered similar. Default: 0.3

#### Methods

- `clusterKeywords(keywords: string[]): Promise<Cluster[]>`: Clusters the provided keywords and returns the clusters with names and descriptions.
- `getEmbeddings(texts: string[]): Promise<number[][]>`: Gets embeddings for the provided texts.
- `calculateDistances(embeddings: number[][]): number[][]`: Calculates the cosine distances between all embeddings.
- `generateClusters(keywords: string[], distances: number[][]): Cluster[]`: Generates clusters based on the distances.
- `nameAndDescribeClusters(clusters: Cluster[]): Promise<Cluster[]>`: Generates names and descriptions for the clusters.

## License

MIT