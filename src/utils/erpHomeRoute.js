const ERP_HOME_ROUTES = [
  { permission: 'erp.reports.view', path: '/erp/dashboard', name: 'erp-dashboard' },
  { permission: 'erp.employees.view', path: '/erp/employees', name: 'erp-employees' },
  { permission: 'erp.salaries.view', path: '/erp/salaries', name: 'erp-salaries' },
  { permission: 'erp.invoices.view', path: '/erp/invoices', name: 'erp-invoices' },
  { permission: 'erp.invoice-payments.view', path: '/erp/payments', name: 'erp-payments' },
  { permission: 'erp.expenses.view', path: '/erp/expenses', name: 'erp-expenses' },
  { permission: 'erp.products.view', path: '/erp/products', name: 'erp-products' },
  { permission: 'erp.categories.view', path: '/erp/products', name: 'erp-products' },
  { permission: 'erp.customers.view', path: '/erp/customers', name: 'erp-customers' },
  { permission: 'erp.suppliers.view', path: '/erp/suppliers', name: 'erp-suppliers' },
  { permission: 'erp.raw-materials.view', path: '/erp/raw-materials', name: 'erp-raw-materials' },
  { permission: 'erp.raw-material-purchases.view', path: '/erp/raw-material-purchases', name: 'erp-raw-material-purchases' },
  { permission: 'erp.raw-material-payments.view', path: '/erp/raw-material-payments', name: 'erp-raw-material-payments' },
  { permission: 'erp.raw-material-operations.view', path: '/erp/raw-material-operations', name: 'erp-raw-material-operations' },
  { permission: 'erp.inventory.view', path: '/erp/inventory', name: 'erp-inventory' },
  { permission: 'erp.operations.view', path: '/erp/operations', name: 'erp-operations' },
  { permission: 'erp.access.view', path: '/erp/access-control', name: 'erp-access-control' },
]

const normalizePermissions = permissions => Array.isArray(permissions) ? permissions : []

export const hasErpPermission = permissions => normalizePermissions(permissions).some(permission => permission.startsWith('erp.'))

export const erpHomeRouteForPermissions = permissions => {
  const userPermissions = normalizePermissions(permissions)
  return ERP_HOME_ROUTES.find(route => userPermissions.includes(route.permission)) || null
}

export const erpHomePathForPermissions = permissions => erpHomeRouteForPermissions(permissions)?.path || '/erp/dashboard'

export const erpHomeRouteNameForPermissions = permissions => erpHomeRouteForPermissions(permissions)?.name || 'erp-dashboard'