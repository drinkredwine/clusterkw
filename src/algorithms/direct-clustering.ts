import { Cluster } from '../types';
import OpenAI from 'openai';

/**
 * Direct clustering using LLM without embeddings
 * @param keywords Array of keywords to cluster
 * @param openai OpenAI client instance
 * @param options Configuration options
 * @returns Array of clusters
 */
export async function directClustering(
  keywords: string[],
  openai: OpenAI,
  options: {
    model?: string;
    minClusterSize?: number;
    maxClusters?: number;
    context?: string;
  }
): Promise<Cluster[]> {
  const model = options.model || 'gpt-4o-mini-2024-07-18';
  const minClusterSize = options.minClusterSize || 2;
  const maxClusters = options.maxClusters || 10;
  const context = options.context || '';
  
  // Prepare the prompt
  const contextIntro = context 
    ? `I have a list of ${keywords.length} keywords related to "${context}" that I need to cluster into groups based on their semantic similarity.`
    : `I have a list of ${keywords.length} keywords that I need to cluster into groups based on their semantic similarity.`;
  
  const prompt = `
${contextIntro}
Please analyze these keywords and group them into ${Math.min(maxClusters, Math.ceil(keywords.length / minClusterSize))} clusters (or fewer).
Each cluster should have at least ${minClusterSize} items (if possible).
${context ? `\nThe keywords are specifically about: ${context}. Please make sure the cluster names and descriptions reflect this context.` : ''}

Keywords:
${keywords.map(k => `- ${k}`).join('\n')}

Please provide your response in JSON format with the following structure:
{
  "clusters": [
    {
      "name": "Cluster Name",
      "description": "A brief description of what unifies these keywords",
      "items": ["keyword1", "keyword2", "keyword3"]
    },
    ...
  ]
}

Important:
1. Each keyword should appear in exactly one cluster
2. Ensure all keywords are included in the clusters
3. The "items" array must contain the exact keywords from the original list
4. Provide a descriptive name and explanation for each cluster
`;

  try {
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that specializes in semantic clustering of keywords.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    const result = JSON.parse(content);
    
    if (!result.clusters || !Array.isArray(result.clusters)) {
      throw new Error('Invalid response format: missing clusters array');
    }

    // Validate and transform the clusters
    const clusters: Cluster[] = result.clusters.map((cluster: any) => ({
      name: cluster.name,
      description: cluster.description,
      items: cluster.items
    }));

    // Filter out clusters that are too small
    return clusters.filter(cluster => cluster.items.length >= minClusterSize);
  } catch (error) {
    console.error('Error in direct clustering:', error);
    throw error;
  }
}