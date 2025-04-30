import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useProductsStore = defineStore("products", () => {
  // 状态
  const products = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const perPage = ref(10);
  const total = ref(0);
  const loading = ref(false);
  const error = ref(null);
  const categories = ref(["热销", "上新", "特价出售"]);
  const currentCategory = ref("");

  // 计算属性
  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return products.value.slice(start, end);
  });

  const filteredProducts = computed(() => {
    if (!currentCategory.value) return products.value;
    return products.value.filter(
      (product) => product.main_category === currentCategory.value
    );
  });

  // 方法
  const fetchProducts = async () => {
    loading.value = true;
    try {
      const response = await fetch("http://localhost:3001/products_list");
      const data = await response.json();
      products.value = data;
      total.value = data.length;
      totalPages.value = Math.ceil(data.length / perPage.value);
    } catch (err) {
      error.value = err;
      console.error("获取商品列表失败:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchProductById = async (id) => {
    loading.value = true;
    try {
      const response = await fetch(`http://localhost:3001/products_list/${id}`);
      const data = await response.json();
      return data;
    } catch (err) {
      error.value = err;
      console.error("获取商品详情失败:", err);
    } finally {
      loading.value = false;
    }
  };

  const addProduct = async (product) => {
    loading.value = true;
    try {
      const response = await fetch("http://localhost:3001/products_list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      const newProduct = await response.json();
      products.value.push(newProduct);
      return newProduct;
    } catch (err) {
      error.value = err;
      console.error("添加商品失败:", err);
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id, product) => {
    loading.value = true;
    try {
      const response = await fetch(
        `http://localhost:3001/products_list/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );
      const updatedProduct = await response.json();
      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        products.value[index] = updatedProduct;
      }
      return updatedProduct;
    } catch (err) {
      error.value = err;
      console.error("更新商品失败:", err);
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id) => {
    loading.value = true;
    try {
      await fetch(`http://localhost:3001/products_list/${id}`, {
        method: "DELETE",
      });
      products.value = products.value.filter((product) => product.id !== id);
    } catch (err) {
      error.value = err;
      console.error("删除商品失败:", err);
    } finally {
      loading.value = false;
    }
  };

  const setCurrentPage = (page) => {
    currentPage.value = page;
  };

  const setCurrentCategory = (category) => {
    currentCategory.value = category;
    currentPage.value = 1;
  };

  const searchProducts = (keyword) => {
    return products.value.filter(
      (product) =>
        product.title.toLowerCase().includes(keyword.toLowerCase()) ||
        product.promotion.keywords.some((k) =>
          k.toLowerCase().includes(keyword.toLowerCase())
        )
    );
  };

  return {
    // 状态
    products,
    currentPage,
    totalPages,
    perPage,
    total,
    loading,
    error,
    categories,
    currentCategory,

    // 计算属性
    paginatedProducts,
    filteredProducts,

    // 方法
    fetchProducts,
    fetchProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    setCurrentPage,
    setCurrentCategory,
    searchProducts,
  };
});
