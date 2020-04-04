import Vue from 'vue'
import VueAxios from 'vue-axios'
import axios from 'axios'

var vueax = axios.create({
  baseURL: 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json'
  }
})

Vue.use(VueAxios, vueax)
export default vueax
