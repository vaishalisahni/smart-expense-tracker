import api from './api';

export const chatService = {
  async sendMessage(message, context) {
    const response = await api.post('/chat/message', { message, context });
    return response.data;
  },

  async getInsights() {
    const response = await api.get('/chat/insights');
    return response.data;
  },

  async getChatHistory() {
    const response = await api.get('/chat/history');
    return response.data;
  },

  async clearHistory() {
    const response = await api.delete('/chat/history');
    return response.data;
  }
};

export const savingsService = {
  async getGoals() {
    const response = await api.get('/savings/goals');
    return response.data;
  },

  async createGoal(goalData) {
    const response = await api.post('/savings/goals', goalData);
    return response.data;
  },

  async updateGoal(goalId, updates) {
    const response = await api.put(`/savings/goals/${goalId}`, updates);
    return response.data;
  },

  async deleteGoal(goalId) {
    const response = await api.delete(`/savings/goals/${goalId}`);
    return response.data;
  },

  async addToGoal(goalId, amount) {
    const response = await api.post(`/savings/goals/${goalId}/add`, { amount });
    return response.data;
  },

  async withdrawFromGoal(goalId, amount) {
    const response = await api.post(`/savings/goals/${goalId}/withdraw`, { amount });
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get('/savings/analytics');
    return response.data;
  }
};