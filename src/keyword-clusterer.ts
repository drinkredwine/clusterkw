import OpenAI from 'openai';
import { Cluster, KeywordClustererOptions } from './types';

/**
 * KeywordClusterer class for clustering keywords using OpenAI embeddings
 */
export class KeywordClusterer {
  private openai: OpenAI;
  private embeddingModel: string;
  private completionModel: string;
  private minClusterSize: number;
  private distanceThreshold: number;

  /**
   * Creates a new KeywordClusterer instance
   * @param options Configuration options
   */
  constructor(options: KeywordClustererOptions) {
    if (!options.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: options.apiKey
    });

    this.embeddingModel = options.embeddingModel || 'text-embedding-3-small';
    this.completionModel = options.completionModel || 'gpt-3.5-turbo';
    this.minClusterSize = options.minClusterSize || 2;
    this.distanceThreshold = options.distanceThreshold || 0.3;
  }

  /**
   * Clusters the provided keywords
   * @param keywords Array of keywords to cluster
   * @returns Array of clusters with names and descriptions
   */
  public async clusterKeywords(keywords: string[]): Promise<Cluster[]> {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    // Get embeddings for all keywords
    const embeddings = await this.getEmbeddings(keywords);

    // Calculate distances between all embeddings
    const distances = this.calculateDistances(embeddings);

    // Generate clusters based on distances
    const clusters = this.generateClusters(keywords, distances);

    // Generate names and descriptions for clusters
    const namedClusters = await this.nameAndDescribeClusters(clusters);

    return namedClusters;
  }

  /**
   * Gets embeddings for the provided texts
   * @param texts Array of texts to get embeddings for
   * @returns Array of embeddings
   */
  public async getEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    // Process in batches of 100 to avoid API limits
    for (let i = 0; i < texts.length; i += 100) {
      const batch = texts.slice(i, i + 100);
      
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: batch
      });

      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  }

  /**
   * Calculates cosine distances between all embeddings
   * @param embeddings Array of embeddings
   * @returns Matrix of distances
   */
  public calculateDistances(embeddings: number[][]): number[][] {
    const n = embeddings.length;
    const distances: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (i === j) {
          distances[i][j] = 0;
        } else {
          const distance = 1 - this.cosineSimilarity(embeddings[i], embeddings[j]);
          distances[i][j] = distance;
          distances[j][i] = distance; // Distance matrix is symmetric
        }
      }
    }

    return distances;
  }

  /**
   * Calculates cosine similarity between two vectors
   * @param a First vector
   * @param b Second vector
   * @returns Cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generates clusters based on distances
   * @param keywords Array of keywords
   * @param distances Matrix of distances
   * @returns Array of clusters
   */
  public generateClusters(keywords: string[], distances: number[][]): Cluster[] {
    const n = keywords.length;
    const visited = new Set<number>();
    const clusters: Cluster[] = [];

    for (let i = 0; i < n; i++) {
      if (visited.has(i)) continue;

      const cluster: string[] = [keywords[i]];
      visited.add(i);

      for (let j = 0; j < n; j++) {
        if (i === j || visited.has(j)) continue;

        if (distances[i][j] <= this.distanceThreshold) {
          cluster.push(keywords[j]);
          visited.add(j);
        }
      }

      if (cluster.length >= this.minClusterSize) {
        clusters.push({ items: cluster });
      }
    }

    // Handle unclustered items
    const unclustered: string[] = [];
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) {
        unclustered.push(keywords[i]);
      }
    }

    if (unclustered.length > 0 && unclustered.length >= this.minClusterSize) {
      clusters.push({ items: unclustered });
    }

    return clusters;
  }

  /**
   * Generates names and descriptions for clusters
   * @param clusters Array of clusters
   * @returns Array of clusters with names and descriptions
   */
  public async nameAndDescribeClusters(clusters: Cluster[]): Promise<Cluster[]> {
    const namedClusters: Cluster[] = [];

    for (const cluster of clusters) {
      const items = cluster.items.join(', ');
      
      const response = await this.openai.chat.completions.create({
        model: this.completionModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that names and describes clusters of keywords.'
          },
          {
            role: 'user',
            content: `I have a cluster of keywords: ${items}. Please provide a short, descriptive name for this cluster and a brief description of what unifies these keywords. Format your response as JSON with "name" and "description" fields.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      try {
        const content = response.choices[0].message.content;
        if (content) {
          const result = JSON.parse(content);
          namedClusters.push({
            items: cluster.items,
            name: result.name,
            description: result.description
          });
        } else {
          namedClusters.push(cluster);
        }
      } catch (error) {
        // If parsing fails, just use the original cluster
        namedClusters.push(cluster);
      }
    }

    return namedClusters;
  }
}