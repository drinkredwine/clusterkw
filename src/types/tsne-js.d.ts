declare module 'tsne-js' {
  export default class TSNE {
    constructor(config?: any);
    init(data: any): void;
    run(): void;
    getOutput(): number[][];
    getOutputScaled(): number[][];
    getSolution(): number[][];
  }
}