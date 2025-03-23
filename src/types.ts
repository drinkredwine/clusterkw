/**
 * Available clustering algorithms
 */
export type ClusteringAlgorithm = 'simple' | 'kmeans' | 'hierarchical' | 'direct';

/**
 * Linkage methods for hierarchical clustering
 */
export type HierarchicalLinkage = 'single' | 'complete' | 'average';

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
  /** Clustering algorithm to use */
  algorithm?: ClusteringAlgorithm;
  /** Number of clusters for k-means algorithm */
  k?: number;
  /** Maximum iterations for k-means algorithm */
  maxIterations?: number;
  /** Linkage method for hierarchical clustering */
  linkage?: HierarchicalLinkage;
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