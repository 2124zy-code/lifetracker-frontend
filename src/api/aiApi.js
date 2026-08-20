import client from './client';

export const aiApi = {
  getWeeklyReview: () => client.post('/ai/review'),
};
