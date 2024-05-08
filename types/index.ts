export interface IValuesData {
  [key: string]: {
    metadata: {
      name: string;
      description: string;
      image: string;
    };
    cid: string;
    minters: string[];
  };
}
