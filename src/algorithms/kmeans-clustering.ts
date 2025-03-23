import { Cluster } from '../types';

/**
 * K-means clustering algorithm
 * @param keywords Array of keywords to cluster
 * @param embeddings Matrix of embeddings for each keyword
 * @param options Configuration options
 * @returns Array of clusters
 */
export function kmeansClustering(
  keywords: string[],
  embeddings: number[][],
  options: {
    k?: number;
    maxIterations?: number;
    minClusterSize?: number;
  }
): Cluster[] {
  const n = keywords.length;
  
  // Default options
  const k = options.k || 5; // Default to 5 clusters
  const maxIterations = options.maxIterations || 100;
  const minClusterSize = options.minClusterSize || 2;
  
  if (n <= k) {
    // If we have fewer keywords than clusters, just return one cluster with all keywords
    return [{ items: [...keywords] }];
  }

  // Initialize centroids randomly
  const centroids: number[][] = [];
  const usedIndices = new Set<number>();
  
  while (centroids.length < k) {
    const randomIndex = Math.floor(Math.random() * n);
    if (!usedIndices.has(randomIndex)) {
      centroids.push([...embeddings[randomIndex]]);
      usedIndices.add(randomIndex);
    }
  }

  // Initialize cluster assignments
  let clusterAssignments: number[] = Array(n).fill(-1);
  let iterations = 0;
  let changed = true;

  // Main K-means loop
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Assign each point to the nearest centroid
    for (let i = 0; i < n; i++) {
      const embedding = embeddings[i];
      let minDistance = Infinity;
      let closestCentroid = -1;

      for (let j = 0; j < k; j++) {
        const distance = euclideanDistance(embedding, centroids[j]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = j;
        }
      }

      if (clusterAssignments[i] !== closestCentroid) {
        clusterAssignments[i] = closestCentroid;
        changed = true;
      }
    }

    // Update centroids
    const newCentroids: number[][] = Array(k).fill(0).map(() => Array(embeddings[0].length).fill(0));
    const counts: number[] = Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      const clusterIndex = clusterAssignments[i];
      counts[clusterIndex]++;
      
      for (let j = 0; j < embeddings[i].length; j++) {
        newCentroids[clusterIndex][j] += embeddings[i][j];
      }
    }

    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        for (let j = 0; j < newCentroids[i].length; j++) {
          newCentroids[i][j] /= counts[i];
        }
        centroids[i] = newCentroids[i];
      }
    }
  }

  // Create clusters from assignments
  const clusterMap: Map<number, string[]> = new Map();
  
  for (let i = 0; i < n; i++) {
    const clusterIndex = clusterAssignments[i];
    if (!clusterMap.has(clusterIndex)) {
      clusterMap.set(clusterIndex, []);
    }
    clusterMap.get(clusterIndex)!.push(keywords[i]);
  }

  // Convert to Cluster objects, filtering out clusters that are too small
  const clusters: Cluster[] = [];
  
  clusterMap.forEach((items) => {
    if (items.length >= minClusterSize) {
      clusters.push({ items });
    }
  });

  return clusters;
}

/**
 * Calculate Euclidean distance between two vectors
 */
function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}