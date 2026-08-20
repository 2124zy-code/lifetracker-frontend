import client from './client';

export const habitApi = {
  getList: (date) => client.get('/habits', { params: { date } }),
  create: (data) => client.post('/habits', data),
  update: (id, data) => client.put(`/habits/${id}`, data),
  delete: (id) => client.delete(`/habits/${id}`),
  toggle: (id, logDate) => client.post(`/habits/${id}/toggle`, { logDate }),
  injectDemo: () => client.post('/habits/demo/inject'),
  resetDemo: () => client.post('/habits/demo/reset'),
};
