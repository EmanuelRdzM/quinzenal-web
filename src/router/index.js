import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/Dashboard/DashboardPage.vue')
  },
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
    component: () => import('../pages/Debts/PeoplePage.vue')
  },
  {
    path: '/people/:id',
    name: 'person-detail',
    component: () => import('../pages/Debts/PersonDetail.vue'),
    props: true
  },
  {
    path: '/debts/:id',
    name: 'debt-detail',
    component: () => import('../pages/Debts/DebtDetail.vue'),
    props: true
  },
  {
    path: '/credits',
    name: 'credits',
    component: () => import('../pages/Credits/CreditsPage.vue')
  },
  {
    path: '/credits/:id',
    name: 'credit-detail',
    component: () => import('../pages/Credits/CreditDetail.vue'),
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
