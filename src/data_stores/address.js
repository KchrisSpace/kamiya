import { defineStore } from 'pinia';
import axios from 'axios';
import { API_URL } from '/src/pages/const/index';

export const useAddressStore = defineStore('address', {
  state: () => ({
    addresses: [],
    loading: false,
    error: null,
  }),

  getters: {
    // 获取默认地址
    defaultAddress: (state) => state.addresses.find((addr) => addr.is_default),

    // 获取用户的所有地址
    userAddresses: (state) => (userId) =>
      state.addresses.filter((addr) => addr.user_id === userId),
  },

  actions: {
    // 获取所有地址
    async fetchAddresses() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/addresses`, {
          params: { user_id: '02' },
        });
        this.addresses = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.message;
        console.error('获取地址失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 添加新地址
    async addAddress(addressData) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/addresses`, addressData);
        this.addresses.push(response.data);
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('添加地址失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 更新地址
    async updateAddress(addressId, addressData) {
      this.loading = true;
      try {
        const response = await axios.put(
          `${API_URL}/addresses/${addressId}`,
          addressData
        );
        const index = this.addresses.findIndex((addr) => addr.id === addressId);
        if (index !== -1) {
          this.addresses[index] = response.data;
        }
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('更新地址失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 删除地址
    async deleteAddress(addressId) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/addresses/${addressId}`);
        this.addresses = this.addresses.filter((addr) => addr.id !== addressId);
        this.error = null;
      } catch (error) {
        this.error = error.message;
        console.error('删除地址失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 设置默认地址
    async setDefaultAddress(addressId) {
      this.loading = true;
      try {
        // 先将所有地址设置为非默认
        this.addresses.forEach((addr) => {
          if (addr.is_default) {
            this.updateAddress(addr.id, { ...addr, is_default: false });
          }
        });

        // 设置新的默认地址
        const address = this.addresses.find((addr) => addr.id === addressId);
        if (address) {
          await this.updateAddress(addressId, { ...address, is_default: true });
        }
        this.error = null;
      } catch (error) {
        this.error = error.message;
        console.error('设置默认地址失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
