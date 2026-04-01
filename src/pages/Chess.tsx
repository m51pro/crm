import { Card } from "@/components/ui/card";

const properties = [
  { name: "Чунга-Чанга", color: "bg-forest", cottages: 6 },
  { name: "Голубая Бухта", color: "bg-teal", cottages: 4 },
];

export default function Chess() {
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Шахматка</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {properties.map((p) => (
          <Card key={p.name} className="p-5 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-lg ${p.color} flex items-center justify-center`}>
              <span className="text-sm font-bold text-card">
                {p.name[0]}
              </span>
            </div>
            <div>
              <p className="font-heading font-medium text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.cottages} коттеджей</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground text-sm text-center py-16">
          Шахматная доска бронирований будет отображена здесь.
          <br />
          <span className="text-xs">Выберите объект и период для просмотра.</span>
        </p>
      </Card>
    </div>
  );
}
