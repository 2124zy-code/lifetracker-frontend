import client from './client';

export const statApi = {
  getHeatmap: (year) => client.get('/stat/heatmap', { params: { year } }),
  getSummary: () => client.get('/stat/summary'),
};
