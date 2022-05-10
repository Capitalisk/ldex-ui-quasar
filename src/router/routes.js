const routes = [
  {
    path: '/',
    component: () => import('layouts/Trader.vue'),
    children: [{ path: '', component: () => import('pages/trader/Index.vue') }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
