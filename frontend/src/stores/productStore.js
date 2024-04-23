import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

export const useProductStore = defineStore('productStore', () => {
  let loading = ref(false)
  let products = ref([]);
  let rowsCount = ref(null);

  const getAllProducts = async (options) => {
    let queryStr = ''
    for (const key in options) {
      if (options[key]) {
        queryStr += key + '=' + options[key] + '&'
      }
      // console.log(key,options[key])
    }
    // console.log(queryStr);
    try {
      loading.value = true
      const res = await axios.get(`http://localhost:3500/api/v1/products?${queryStr}`, {
        withCredentials: true
      })
      console.log(res.data.data)
      products.value = res.data.data.myProducts;
      rowsCount.value = res.data.data.totalRows.count;
    } catch (error) {
      console.log(error.message)
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (data) => {
    try {
      loading.value = true
      console.log('line 38',data.id)
      const res = await axios.patch(`http://localhost:3500/api/v1/products/${data.id}`,
        data,
        {
        withCredentials: true
        }
      );
      toast.success(res.data.message, {
        autoClose: 2000,
        pauseOnHover: false,
        type: 'success',
        position: 'bottom-center',
        transition: 'zoom',
        dangerouslyHTMLString: true
      })
    }
    catch (err) {
      console.log(err.message);
      toast.error(err.message, {
        autoClose: 2000,
        pauseOnHover: false,
        type: 'error',
        position: 'bottom-center',
        transition: 'zoom',
        dangerouslyHTMLString: true
      })
    }
    finally {
      loading.value = false;
    }
    
  }

  const deleteProduct = async (id)=>{
    try {
      loading.value = true;
      await axios.delete(`http://localhost:3500/api/v1/products/${id}`,{withCredentials:true})    
    } catch (err) {
      toast.error(err.message, {
        autoClose: 2000,
        pauseOnHover: false,
        type: 'error',
        position: 'bottom-center',
        transition: 'zoom',
        dangerouslyHTMLString: true
      })
    }finally {
      loading.value = false;
    }
  }

  return { getAllProducts, products, rowsCount, loading, updateProduct, deleteProduct }
})