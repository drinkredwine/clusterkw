# ClusterKW

A Node.js package for clustering keywords using OpenAI embeddings. This package can be used to cluster Google Ads keywords, AI chat topics, project tasks, or any other text-based items into semantically similar groups.

## Features

- Generate embeddings for keywords using OpenAI API
- Calculate distances between keywords
- Create clusters of semantically similar keywords
- Automatically generate cluster names and descriptions using OpenAI API
- Multiple clustering algorithms:
  - **Simple**: Basic distance-based clustering
  - **K-means**: Centroid-based clustering with configurable number of clusters
  - **Hierarchical**: Agglomerative clustering with different linkage methods
  - **Direct**: LLM-based clustering without embeddings (sends keywords directly to the model)

## Installation

```bash
npm install clusterkw
```

## Usage

```typescript
import { KeywordClusterer } from 'clusterkw';

// Initialize with your OpenAI API key
const clusterer = new KeywordClusterer({
  apiKey: 'your-openai-api-key',
  // Optional configuration
  embeddingModel: 'text-embedding-3-small',
  completionModel: 'gpt-4o-mini-2024-07-18',
  minClusterSize: 3,
  distanceThreshold: 0.2,
  algorithm: 'direct',
  context: 'AI chat topics'
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
- `algorithm` (string, optional): Clustering algorithm to use ('simple', 'kmeans', or 'hierarchical'). Default: 'simple'
- `k` (number, optional): Number of clusters for k-means algorithm. Default: auto-calculated based on dataset size
- `maxIterations` (number, optional): Maximum iterations for k-means algorithm. Default: 100
- `linkage` (string, optional): Linkage method for hierarchical clustering ('single', 'complete', or 'average'). Default: 'average'

#### Methods

- `clusterKeywords(keywords: string[]): Promise<Cluster[]>`: Clusters the provided keywords and returns the clusters with names and descriptions.
- `getEmbeddings(texts: string[]): Promise<number[][]>`: Gets embeddings for the provided texts.
- `calculateDistances(embeddings: number[][]): number[][]`: Calculates the cosine distances between all embeddings.
- `generateClusters(keywords: string[], distances: number[][], embeddings?: number[][]): Cluster[]`: Generates clusters based on the selected algorithm.
- `nameAndDescribeClusters(clusters: Cluster[]): Promise<Cluster[]>`: Generates names and descriptions for the clusters.

## Command Line Interface (CLI)

The package includes a CLI tool for clustering keywords directly from the command line:

```bash
# Install globally
npm install -g clusterkw

# Basic usage with a file
clusterkw --file keywords.txt

# Using a CSV file with a specific column
clusterkw --file keywords.csv --column keyword

# Specify output file
clusterkw --file keywords.txt --output clusters.json

# Customize clustering parameters
clusterkw --file keywords.txt --min-cluster-size 3 --distance 0.25

# Use different clustering algorithms
clusterkw --file keywords.txt --algorithm kmeans --clusters 5
clusterkw --file keywords.txt --algorithm hierarchical --linkage complete
clusterkw --file keywords.txt --algorithm direct --gpt-model gpt-4o-mini-2024-07-18

# Use context to guide clustering
clusterkw --file keywords.txt --context "AI chat topics"
clusterkw --file keywords.txt --algorithm direct --context "Google Ads keywords"

# Provide API key directly (alternatively, set OPENAI_API_KEY or OPENAI_KEY environment variable)
clusterkw --file keywords.txt --api-key your-openai-api-key
```

### CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--file` | `-f` | Path to file containing keywords (supports txt, csv, json) | (required) |
| `--column` | `-c` | Column name containing keywords (for CSV files) | `keyword` |
| `--output` | `-o` | Output file path (supports json, csv) | (none) |
| `--api-key` | | OpenAI API key (overrides environment variables) | (from env) |
| `--min-cluster-size` | `-m` | Minimum cluster size | `2` |
| `--distance` | `-d` | Maximum distance threshold | `0.3` |
| `--embedding-model` | `-e` | OpenAI embedding model | `text-embedding-3-small` |
| `--gpt-model` | `-g` | OpenAI completion model | `gpt-4o-mini-2024-07-18` |
| `--algorithm` | `-a` | Clustering algorithm (simple, kmeans, hierarchical, direct) | `simple` |
| `--clusters` | `-k` | Number of clusters for k-means algorithm | `5` |
| `--max-iterations` | | Maximum iterations for k-means algorithm | `100` |
| `--linkage` | | Linkage method for hierarchical clustering | `average` |
| `--context` | | Context description to guide clustering | (none) |
| `--delimiter` | | CSV delimiter | `,` |
| `--no-header` | | CSV file has no header row | (false) |

## Version Management

This package follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR**: Incompatible API changes
- **MINOR**: Add functionality (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

### Updating the Version

You can update the version using npm scripts:

```bash
# Increment patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Increment minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Increment major version (1.0.0 -> 2.0.0)
npm run version:major
```

### Automatic Publishing

This package uses GitHub Actions to automatically publish to npm when:

1. A new version is pushed to the main branch (package.json changes)
2. A new GitHub Release is created
3. The publish workflow is manually triggered

## License

MIT