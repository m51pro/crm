import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Настройки</h2>
      <Card className="p-6 flex flex-col items-center justify-center py-20">
        <Settings className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-sm">Настройки системы.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Управление объектами, тарифами и пользователями.
        </p>
      </Card>
    </div>
  );
}
