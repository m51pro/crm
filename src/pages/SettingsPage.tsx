import { useState } from "react";
import { Building, Mail, FileText, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import CompanyDetails from "@/components/settings/CompanyDetails";
import SmtpSettings from "@/components/settings/SmtpSettings";
import TemplatesSettings from "@/components/settings/TemplatesSettings";
import ObjectsSettings from "@/components/settings/ObjectsSettings";

const tabs = [
  { id: "company", label: "Реквизиты предприятия", icon: Building },
  { id: "smtp", label: "Настройки почты", icon: Mail },
  { id: "templates", label: "Шаблоны документов", icon: FileText },
  { id: "objects", label: "Объекты управления", icon: Home },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="flex flex-col h-full">
      <div className="px-10 py-8 border-b border-border/50">
        <h2 className="font-heading text-2xl font-bold flex items-center gap-3">
          Настройки <Sparkles className="h-5 w-5 text-accent" />
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Управление конфигурацией системы и шаблонами документов.
        </p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left sub-navigation */}
        <aside className="w-72 shrink-0 p-4 overflow-y-auto border-r border-border/50">
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-accent/10 text-accent shadow-sm" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-accent" : "opacity-60")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {activeTab === "company" && <CompanyDetails />}
            {activeTab === "smtp" && <SmtpSettings />}
            {activeTab === "templates" && <TemplatesSettings />}
            {activeTab === "objects" && <ObjectsSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
