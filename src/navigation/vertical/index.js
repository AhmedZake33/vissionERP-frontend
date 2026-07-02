
import clinic from './clinic'
import erp from './erp'

const tagNavigation = (items, app) => items.map(item => ({
  ...item,
  app,
  children: item.children ? tagNavigation(item.children, app) : item.children,
}))

// Array of sections
export default [...tagNavigation(erp, 'erp'), ...tagNavigation(clinic, 'clinic')]
