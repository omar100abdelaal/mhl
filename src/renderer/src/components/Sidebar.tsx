import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  ClipboardList,
  AlertTriangle,
  Languages
} from 'lucide-react'
import { useI18n } from '../contexts/I18nContext'

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  lowStockCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, lowStockCount }) => {
  const { t, language, setLanguage } = useI18n()

  const menuItems = [
    { id: 'pos', icon: <ShoppingBag size={20} />, label: t('pos') },
    { id: 'inventory', icon: <Package size={20} />, label: t('inventory') },
    { id: 'categories', icon: <LayoutDashboard size={20} />, label: t('categories') },
    { id: 'receipts', icon: <ClipboardList size={20} />, label: t('history') },
  ]

  return (
    <div className="sidebar">
      <div className="brand">منصور</div>
      
      <div className="nav-menu">
        {menuItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div 
          className="nav-item" 
          style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'center' }}
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
          <Languages size={20} />
          <span>{language === 'en' ? 'Arabic' : 'English'}</span>
        </div>

        {lowStockCount > 0 && (
          <div 
            className="nav-item" 
            style={{ color: '#fb7185', background: 'rgba(251, 113, 133, 0.1)' }}
            onClick={() => setActiveView('inventory')}
          >
            <AlertTriangle size={20} />
            <span>{lowStockCount} {t('lowStock')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
