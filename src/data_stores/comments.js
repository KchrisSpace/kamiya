import { defineStore } from 'pinia';
import axios from 'axios';
import { API_URL } from '/src/pages/const/index';

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [],
    allComments: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    // 获取评论
    async fetchComments(articleId, commentType, commentQuery) {
      try {
        this.isLoading = true;
        const response = await axios.get(
          `${API_URL}/${commentType}?${commentQuery}=${articleId}`
        );
        this.allComments = response.data;
        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('获取评论失败:', err);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    // 添加评论
    async addComment(commentData, commentType) {
      try {
        this.isLoading = true;
        const response = await axios.post(`${API_URL}/${commentType}`, {
          ...commentData,
          created_at: new Date().toISOString(),
          is_audited: true,
        });

        // 更新评论状态
        if (response.data) {
          this.allComments = [response.data, ...this.allComments];
        }

        return response.data;
      } catch (err) {
        this.error = err.message;
        console.error('添加评论失败:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // 删除评论
    async deleteComment(commentId, commentType) {
      try {
        await axios.delete(`${API_URL}/${commentType}/${commentId}`);
        this.comments = this.comments.filter((c) => c.id !== commentId);
        this.allComments = this.allComments.filter((c) => c.id !== commentId);
      } catch (error) {
        this.error = error.message;
        console.error('删除评论失败:', error);
        throw error;
      }
    },
  },
});
