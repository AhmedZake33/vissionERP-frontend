import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import broadcast from './modules/broadcast'
import assistantCalls from './modules/assistantCalls'


// Modules
import ecommerceStoreModule from '@/views/apps/e-commerce/eCommerceStoreModule'
import app from './app'
import appConfig from './app-config'
import verticalMenu from './vertical-menu'
import language from './language'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
  },
  getters: {
    user: state => state.user,
  },
  modules: {
    app,
    appConfig,
    verticalMenu,
    language,
    'app-ecommerce': ecommerceStoreModule,
    auth,
    broadcast,
    assistantCalls,
  },
  strict: process.env.DEV,
})
