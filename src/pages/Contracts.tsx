import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Contracts() {
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Договоры</h2>
      <Card className="p-6 flex flex-col items-center justify-center py-20">
        <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-sm">Договоры будут отображены здесь.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Создайте договор из карточки бронирования.
        </p>
      </Card>
    </div>
  );
}
