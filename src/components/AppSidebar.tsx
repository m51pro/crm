import { CalendarDays, Users, FileText, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { title: "Шахматка", path: "/", icon: CalendarDays },
  { title: "Клиенты", path: "/clients", icon: Users },
  { title: "Договоры", path: "/contracts", icon: FileText, badge: 3 },
  { title: "Настройки", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-50">
      {/* Logo area */}
      <div className="px-5 py-6">
        <h1 className="font-heading text-lg font-semibold text-sidebar-foreground tracking-tight">
          CRM Коттеджи
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                transition-all duration-150 relative
                ${
                  isActive
                    ? "bg-sidebar-active/10 text-sidebar-active border-l-[3px] border-sidebar-active -ml-px"
                    : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground"
                }
              `}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-sidebar-active text-accent-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-hover">
        <p className="text-xs text-sidebar-muted">CRM Коттеджи</p>
        <p className="text-[10px] text-sidebar-muted/60 mt-0.5">Версия 1.0</p>
      </div>
    </aside>
  );
}
