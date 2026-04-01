import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Clients() {
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Клиенты</h2>
      <Card className="p-6 flex flex-col items-center justify-center py-20">
        <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-sm">База клиентов пока пуста.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Добавьте первого клиента для начала работы.
        </p>
      </Card>
    </div>
  );
}
