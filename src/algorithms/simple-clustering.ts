import { Cluster } from '../types';

/**
 * Simple clustering algorithm based on distance threshold
 * @param keywords Array of keywords to cluster
 * @param distances Matrix of distances between keywords
 * @param options Configuration options
 * @returns Array of clusters
 */
export function simpleClustering(
  keywords: string[],
  distances: number[][],
  options: {
    minClusterSize: number;
    distanceThreshold: number;
  }
): Cluster[] {
  const { minClusterSize, distanceThreshold } = options;
  const n = keywords.length;
  const visited = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue;

    const cluster: string[] = [keywords[i]];
    visited.add(i);

    for (let j = 0; j < n; j++) {
      if (i === j || visited.has(j)) continue;

      if (distances[i][j] <= distanceThreshold) {
        cluster.push(keywords[j]);
        visited.add(j);
      }
    }

    if (cluster.length >= minClusterSize) {
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

  if (unclustered.length > 0 && unclustered.length >= minClusterSize) {
    clusters.push({ items: unclustered });
  }

  return clusters;
}