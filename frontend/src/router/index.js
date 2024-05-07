import { createRouter, createWebHistory } from 'vue-router'
// import App from '../App.vue'
import Admin from '@/views/Admin.vue'
import Home from '@/views/Home.vue'
import Vendor from '@/views/Vendor.vue'
import PdfTemplate from '@/components/PdfTemplate.vue'
import ResetPassword from '@/components/ResetPassword.vue'
// import Profile from '@/components/Profile.vue'
// import CustomerDetails from '@/components/customerDetails.vue'
// import EditCustomer from '@/components/EditCustomer.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },

    {
      path: '/admin',
      name: 'admin',
      component: Admin
    },
    {
      path: '/vendor',
      name: 'vendor',
      component: Vendor
    },
    {
      path: '/invoice/:id',
      name: 'pdfTemplate',
      component: PdfTemplate,
      props: {
        default: true,
        PdfTemplate: true
      }
    },
    {
      path: '/resetPassword/:token',
      name: 'resetPassword',
      component: ResetPassword,
      props: {
        default: true,
        PdfTemplate: true
      }
    }
  ]
})

export default router
