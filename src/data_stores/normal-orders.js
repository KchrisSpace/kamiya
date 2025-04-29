import { defineStore } from 'pinia';
import axios from 'axios';
import { API_URL } from '/src/pages/const/index';

export const useNormalOrdersStore = defineStore('normalOrders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
  }),

  getters: {
    // 获取所有订单
    allOrders: (state) => state.orders,
    // 根据用户ID获取订单
    ordersByUser: (state) => (userId) =>
      state.orders.filter((order) => order.user_id === userId),
  },

  actions: {
    // 获取所有订单或特定用户的订单
    async fetchOrders(userId = null) {
      this.loading = true;
      try {
        const url = userId
          ? `${API_URL}/normal_orders?user_id=${userId}`
          : `${API_URL}/normal_orders`;
        const response = await axios.get(url);
        this.orders = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.message;
        console.error('获取订单失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 添加新订单
    async addOrder(orderData) {
      this.loading = true;
      try {
        const response = await axios.post(
          `${API_URL}/normal_orders`,
          orderData
        );
        this.orders.push(response.data);
        this.error = null;
        console.log('添加订单后', this.orders);
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('添加订单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 更新订单
    async updateOrder(orderId, orderData) {
      this.loading = true;
      try {
        const response = await axios.put(
          `${API_URL}/normal_orders/${orderId}`,
          orderData
        );
        const index = this.orders.findIndex((order) => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = response.data;
        }
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('更新订单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 删除订单
    async deleteOrder(orderId) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/normal_orders/${orderId}`);
        this.orders = this.orders.filter((order) => order.id !== orderId);
        this.error = null;
      } catch (error) {
        this.error = error.message;
        console.error('删除订单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
