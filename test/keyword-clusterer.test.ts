import { KeywordClusterer } from '../src/keyword-clusterer';
import { Cluster } from '../src/types';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [
            { embedding: [0.1, 0.2, 0.3] },
            { embedding: [0.1, 0.2, 0.3] },
            { embedding: [0.4, 0.5, 0.6] },
            { embedding: [0.4, 0.5, 0.6] },
            { embedding: [0.7, 0.8, 0.9] }
          ]
        })
      },
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: '{"name":"Test Cluster","description":"This is a test cluster"}'
                }
              }
            ]
          })
        }
      }
    };
  });
});

describe('KeywordClusterer', () => {
  let clusterer: KeywordClusterer;

  beforeEach(() => {
    clusterer = new KeywordClusterer({
      apiKey: 'test-api-key',
      distanceThreshold: 0.1,
      minClusterSize: 2
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should throw error if API key is not provided', () => {
    expect(() => {
      new KeywordClusterer({
        apiKey: ''
      });
    }).toThrow('OpenAI API key is required');
  });

  test('should initialize with default options', () => {
    const clusterer = new KeywordClusterer({
      apiKey: 'test-api-key'
    });
    
    expect(clusterer).toBeDefined();
  });

  test('should get embeddings for texts', async () => {
    const texts = ['text1', 'text2', 'text3', 'text4', 'text5'];
    const embeddings = await clusterer.getEmbeddings(texts);
    
    expect(embeddings).toHaveLength(5);
    expect(embeddings[0]).toEqual([0.1, 0.2, 0.3]);
  });

  test('should calculate distances between embeddings', () => {
    const embeddings = [
      [1, 0, 0],
      [0, 1, 0],
      [1, 1, 0]
    ];
    
    const distances = clusterer.calculateDistances(embeddings);
    
    expect(distances).toHaveLength(3);
    expect(distances[0][1]).toBeCloseTo(1);
    expect(distances[0][2]).toBeCloseTo(0.2929, 4);
    expect(distances[1][2]).toBeCloseTo(0.2929, 4);
  });

  test('should generate clusters based on distances', () => {
    const keywords = ['keyword1', 'keyword2', 'keyword3', 'keyword4', 'keyword5'];
    const distances = [
      [0, 0.05, 0.8, 0.9, 0.7],
      [0.05, 0, 0.7, 0.8, 0.6],
      [0.8, 0.7, 0, 0.05, 0.9],
      [0.9, 0.8, 0.05, 0, 0.8],
      [0.7, 0.6, 0.9, 0.8, 0]
    ];
    
    const clusters = clusterer.generateClusters(keywords, distances);
    
    expect(clusters).toHaveLength(2);
    expect(clusters[0].items).toContain('keyword1');
    expect(clusters[0].items).toContain('keyword2');
    expect(clusters[1].items).toContain('keyword3');
    expect(clusters[1].items).toContain('keyword4');
  });

  test('should name and describe clusters', async () => {
    const clusters: Cluster[] = [
      {
        items: ['keyword1', 'keyword2']
      }
    ];
    
    const namedClusters = await clusterer.nameAndDescribeClusters(clusters);
    
    expect(namedClusters).toHaveLength(1);
    expect(namedClusters[0].name).toBe('Test Cluster');
    expect(namedClusters[0].description).toBe('This is a test cluster');
  });

  test('should cluster keywords', async () => {
    const keywords = ['keyword1', 'keyword2', 'keyword3', 'keyword4', 'keyword5'];
    
    const clusters = await clusterer.clusterKeywords(keywords);
    
    expect(clusters).toBeDefined();
    expect(clusters.length).toBeGreaterThan(0);
  });

  test('should return empty array for empty keywords', async () => {
    const clusters = await clusterer.clusterKeywords([]);
    
    expect(clusters).toHaveLength(0);
  });
});