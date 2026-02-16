import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/balance' },
  {
    path: '/balance',
    name: 'balance',
    component: () => import('../pages/BalanceQuick/BalanceQuickForm.vue')
  },
  {
    path: '/cards',
    name: 'cards',
    component: () => import('../pages/CardsHistory/CardsHistory.vue')
  },
  {
    path: '/cards/:id',
    name: 'card-detail',
    component: () => import('../pages/CardsHistory/CardDetail.vue'),
    props: true
  },
  {
    path: '/debts',
    name: 'debts',
    component: () => import('../pages/Debts/DebtsPage.vue')
  },
  {
    path: '/credits',
    name: 'credits',
    component: () => import('../pages/Credits/CreditsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
