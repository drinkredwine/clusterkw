import { Cluster } from '../types';

/**
 * Hierarchical clustering algorithm (agglomerative)
 * @param keywords Array of keywords to cluster
 * @param distances Matrix of distances between keywords
 * @param options Configuration options
 * @returns Array of clusters
 */
export function hierarchicalClustering(
  keywords: string[],
  distances: number[][],
  options: {
    minClusterSize?: number;
    distanceThreshold?: number;
    linkage?: 'single' | 'complete' | 'average';
  }
): Cluster[] {
  const n = keywords.length;
  
  // Default options
  const minClusterSize = options.minClusterSize || 2;
  const distanceThreshold = options.distanceThreshold || 0.3;
  const linkage = options.linkage || 'average';

  // Initialize each keyword as its own cluster
  let clusters: { items: string[]; indices: number[] }[] = keywords.map((keyword, index) => ({
    items: [keyword],
    indices: [index]
  }));

  // Clone the distances matrix to avoid modifying the original
  const distanceMatrix = distances.map(row => [...row]);

  // Main loop: merge clusters until we can't merge any more
  while (clusters.length > 1) {
    // Find the two closest clusters
    let minDistance = Infinity;
    let minI = -1;
    let minJ = -1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = getClusterDistance(
          clusters[i].indices,
          clusters[j].indices,
          distanceMatrix,
          linkage
        );

        if (distance < minDistance) {
          minDistance = distance;
          minI = i;
          minJ = j;
        }
      }
    }

    // If the minimum distance is above the threshold, stop merging
    if (minDistance > distanceThreshold) {
      break;
    }

    // Merge the two closest clusters
    const merged = {
      items: [...clusters[minI].items, ...clusters[minJ].items],
      indices: [...clusters[minI].indices, ...clusters[minJ].indices]
    };

    // Remove the two clusters and add the merged one
    clusters = [
      ...clusters.slice(0, minI),
      ...clusters.slice(minI + 1, minJ),
      ...clusters.slice(minJ + 1),
      merged
    ];
  }

  // Filter out clusters that are too small
  return clusters
    .filter(cluster => cluster.items.length >= minClusterSize)
    .map(cluster => ({ items: cluster.items }));
}

/**
 * Calculate distance between two clusters based on linkage method
 */
function getClusterDistance(
  indicesA: number[],
  indicesB: number[],
  distances: number[][],
  linkage: 'single' | 'complete' | 'average'
): number {
  const allDistances: number[] = [];

  // Collect all pairwise distances between points in the two clusters
  for (const i of indicesA) {
    for (const j of indicesB) {
      allDistances.push(distances[i][j]);
    }
  }

  if (allDistances.length === 0) {
    return Infinity;
  }

  // Apply the linkage method
  switch (linkage) {
    case 'single':
      // Minimum distance between any two points
      return Math.min(...allDistances);
    
    case 'complete':
      // Maximum distance between any two points
      return Math.max(...allDistances);
    
    case 'average':
    default:
      // Average distance between all points
      return allDistances.reduce((sum, d) => sum + d, 0) / allDistances.length;
  }
}