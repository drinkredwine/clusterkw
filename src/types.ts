/**
 * Configuration options for the KeywordClusterer
 */
export interface KeywordClustererOptions {
  /** OpenAI API key */
  apiKey: string;
  /** OpenAI model to use for embeddings */
  embeddingModel?: string;
  /** OpenAI model to use for generating cluster names and descriptions */
  completionModel?: string;
  /** Minimum number of items to form a cluster */
  minClusterSize?: number;
  /** Maximum cosine distance for items to be considered similar */
  distanceThreshold?: number;
}

/**
 * Represents a cluster of keywords
 */
export interface Cluster {
  /** Items in the cluster */
  items: string[];
  /** Name of the cluster */
  name?: string;
  /** Description of the cluster */
  description?: string;
}