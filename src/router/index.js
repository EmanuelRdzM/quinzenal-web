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
    path: '/expenses-analytics',
    name: 'expenses-analytics',
    component: () => import('../pages/ExpensesAnalytics/ExpensesAnalyticsPage.vue')
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
    path: '/loans',
    name: 'loans',
    component: () => import('../pages/Debts/PeoplePage.vue'),
    props: { category: 'loan' }
  },
  {
    path: '/rents',
    name: 'rents',
    component: () => import('../pages/Debts/PeoplePage.vue'),
    props: { category: 'rent' }
  },
  {
    path: '/people',
    redirect: '/loans'
  },
  {
    path: '/debts',
    redirect: '/loans'
  },
  {
    path: '/people/:id/loans',
    name: 'person-loans',
    component: () => import('../pages/Debts/PersonDetail.vue'),
    props: { category: 'loan' }
  },
  {
    path: '/people/:id/rents',
    name: 'person-rents',
    component: () => import('../pages/Debts/PersonDetail.vue'),
    props: { category: 'rent' }
  },
  {
    path: '/people/:id',
    redirect: to => `/people/${to.params.id}/loans`
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
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../pages/Settings/SettingsPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFound/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
