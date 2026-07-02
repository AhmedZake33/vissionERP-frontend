const erpBreadcrumb = current => [
  { text: 'ERP', to: { name: 'erp-dashboard' } },
  { text: current, active: true },
]

const superAdminBreadcrumb = current => [
  { text: 'Administration', to: { name: 'super-admin-dashboard' } },
  { text: current, active: true },
]

export default [
  {
    path: '/super-admin',
    name: 'super-admin-dashboard',
    component: () => import('@/views/erp/SuperAdmin.vue'),
    meta: { requiresAuth: true, roles: ['super_admin'], pageTitle: 'Platform Administration', breadcrumb: superAdminBreadcrumb('Dashboard') },
  },
  {
    path: '/erp/dashboard',
    name: 'erp-dashboard',
    component: () => import('@/views/erp/Dashboard.vue'),
    meta: { requiresAuth: true, permissions: ['erp.reports.view'], pageTitle: 'ERP Dashboard', breadcrumb: erpBreadcrumb('Dashboard') },
  },
  {
    path: '/erp/products',
    name: 'erp-products',
    component: () => import('@/views/erp/Products.vue'),
    meta: { requiresAuth: true, permissions: ['erp.products.view', 'erp.categories.view'], pageTitle: 'Products', breadcrumb: erpBreadcrumb('Products') },
  },
  {
    path: '/erp/customers',
    name: 'erp-customers',
    component: () => import('@/views/erp/Customers.vue'),
    meta: { requiresAuth: true, permissions: ['erp.customers.view'], pageTitle: 'Customers', breadcrumb: erpBreadcrumb('Customers') },
  },
  {
    path: '/erp/suppliers',
    name: 'erp-suppliers',
    component: () => import('@/views/erp/Suppliers.vue'),
    meta: { requiresAuth: true, permissions: ['erp.suppliers.view'], pageTitle: 'Suppliers', breadcrumb: erpBreadcrumb('Suppliers') },
  },
  {
    path: '/erp/raw-materials',
    name: 'erp-raw-materials',
    component: () => import('@/views/erp/RawMaterials.vue'),
    meta: { requiresAuth: true, permissions: ['erp.raw-materials.view'], pageTitle: 'Raw Materials', breadcrumb: erpBreadcrumb('Raw Materials') },
  },
  {
    path: '/erp/raw-material-purchases',
    name: 'erp-raw-material-purchases',
    component: () => import('@/views/erp/RawMaterialPurchases.vue'),
    meta: { requiresAuth: true, permissions: ['erp.raw-material-purchases.view'], pageTitle: 'Raw Material Purchases', breadcrumb: erpBreadcrumb('Raw Material Purchases') },
  },
  {
    path: '/erp/raw-material-payments',
    name: 'erp-raw-material-payments',
    component: () => import('@/views/erp/RawMaterialPayments.vue'),
    meta: { requiresAuth: true, permissions: ['erp.raw-material-payments.view'], pageTitle: 'Raw Material Payments', breadcrumb: erpBreadcrumb('Raw Material Payments') },
  },
  {
    path: '/erp/raw-material-operations',
    name: 'erp-raw-material-operations',
    component: () => import('@/views/erp/RawMaterialOperations.vue'),
    meta: { requiresAuth: true, permissions: ['erp.raw-material-operations.view'], pageTitle: 'Raw Material Operations', breadcrumb: erpBreadcrumb('Raw Material Operations') },
  },
  {
    path: '/erp/invoices',
    name: 'erp-invoices',
    component: () => import('@/views/erp/Invoices.vue'),
    meta: { requiresAuth: true, permissions: ['erp.invoices.view'], pageTitle: 'Invoices', breadcrumb: erpBreadcrumb('Invoices') },
  },
  {
    path: '/erp/operations',
    name: 'erp-operations',
    component: () => import('@/views/erp/Operations.vue'),
    meta: { requiresAuth: true, permissions: ['erp.operations.view', 'erp.inventory.view'], pageTitle: 'Operations', breadcrumb: erpBreadcrumb('Operations') },
  },
  {
    path: '/erp/payments',
    name: 'erp-payments',
    component: () => import('@/views/erp/Payments.vue'),
    meta: { requiresAuth: true, permissions: ['erp.invoice-payments.view'], pageTitle: 'Payments', breadcrumb: erpBreadcrumb('Payments') },
  },
  {
    path: '/erp/expenses',
    name: 'erp-expenses',
    component: () => import('@/views/erp/Expenses.vue'),
    meta: { requiresAuth: true, permissions: ['erp.expenses.view'], pageTitle: 'Expenses', breadcrumb: erpBreadcrumb('Expenses') },
  },
  {
    path: '/erp/inventory',
    name: 'erp-inventory',
    component: () => import('@/views/erp/Inventory.vue'),
    meta: { requiresAuth: true, permissions: ['erp.inventory.view'], pageTitle: 'Inventory', breadcrumb: erpBreadcrumb('Inventory') },
  },
  {
    path: '/erp/employees',
    name: 'erp-employees',
    component: () => import('@/views/erp/Employees.vue'),
    meta: { requiresAuth: true, permissions: ['erp.employees.view'], pageTitle: 'Employees', breadcrumb: erpBreadcrumb('Employees') },
  },
  {
    path: '/erp/salaries',
    name: 'erp-salaries',
    component: () => import('@/views/erp/Salaries.vue'),
    meta: { requiresAuth: true, permissions: ['erp.salaries.view'], pageTitle: 'Salaries', breadcrumb: erpBreadcrumb('Salaries') },
  },
  {
    path: '/erp/reports',
    name: 'erp-reports',
    component: () => import('@/views/erp/Reports.vue'),
    meta: { requiresAuth: true, permissions: ['erp.reports.view'], pageTitle: 'Reports', breadcrumb: erpBreadcrumb('Reports') },
  },
  {
    path: '/erp/access-control',
    name: 'erp-access-control',
    component: () => import('@/views/erp/AccessControl.vue'),
    meta: { requiresAuth: true, permissions: ['erp.access.view'], ownerAccess: true, pageTitle: 'Team, Roles & Permissions', breadcrumb: erpBreadcrumb('Team, Roles & Permissions') },
  },
]
