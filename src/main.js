import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io';
import Store from './store.js'

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000',
}))
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store: Store,
}).$mount('#app');
