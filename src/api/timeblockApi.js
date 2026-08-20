import client from './client';

export const timeblockApi = {
  getDayBlocks: (date) => client.get('/timeblocks', { params: { date } }),
  saveBatch: (date, blocks) => client.post('/timeblocks/batch', { date, blocks }),
};
