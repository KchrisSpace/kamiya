import { defineStore } from "pinia";
import axios from "axios";

export const useNormalOrdersStore = defineStore("normalOrders", {
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
          ? `http://localhost:3001/normal_orders?user_id=${userId}`
          : `http://localhost:3001/normal_orders`;
        const response = await axios.get(url);

        // 为没有创建时间的订单添加创建时间
        this.orders = response.data.map((order) => {
          if (!order.created_at) {
            return {
              ...order,
              created_at: new Date().toISOString(), // 为历史订单设置当前时间
            };
          }
          return order;
        });

        this.error = null;
      } catch (error) {
        this.error = error.message;
        console.error("获取订单失败:", error);
      } finally {
        this.loading = false;
      }
    },

    // 添加新订单
    async addOrder(orderData) {
      this.loading = true;
      try {
        const response = await axios.post(
          `http://localhost:3001/normal_orders`,
          orderData
        );
        this.orders.push(response.data);
        this.error = null;
        console.log("添加订单后", this.orders);
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error("添加订单失败:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 更新订单
    async updateOrder(orderId, orderData) {
      this.loading = true;
      try {
        // 先获取当前订单的完整信息
        const currentOrder = this.orders.find((order) => order.id === orderId);
        if (!currentOrder) {
          throw new Error("订单不存在");
        }

        // 只更新状态，保留其他信息
        const updatedOrder = {
          ...currentOrder,
          ...orderData,
        };

        const response = await axios.put(
          `http://localhost:3001/normal_orders/${orderId}`,
          updatedOrder
        );

        // 更新本地订单列表
        const index = this.orders.findIndex((order) => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = response.data;
        }
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error("更新订单失败:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 删除订单
    async deleteOrder(orderId) {
      this.loading = true;
      try {
        await axios.delete(`http://localhost:3001/normal_orders/${orderId}`);
        this.orders = this.orders.filter((order) => order.id !== orderId);
        this.error = null;
      } catch (error) {
        this.error = error.message;
        console.error("删除订单失败:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
