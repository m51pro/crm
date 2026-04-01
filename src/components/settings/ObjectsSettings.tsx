import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CHUNGA_CHANGA_COTTAGES, GB_COTTAGES } from "@/lib/chess-data";
import { CheckCircle2, Pencil, Users, Check, Waves, Sun, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ObjectsSettings() {
  const [chunga, setChunga] = useState(() => {
    const saved = localStorage.getItem('chess_cottages_chunga');
    return saved ? JSON.parse(saved) : CHUNGA_CHANGA_COTTAGES.map(c => ({ ...c, active: true }));
  });
  const [gb, setGb] = useState(() => {
    const saved = localStorage.getItem('chess_cottages_gb');
    return saved ? JSON.parse(saved) : GB_COTTAGES.map(c => ({ ...c, active: true }));
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdate = (type: 'chunga' | 'gb', id: string, key: string, val: string | number | boolean) => {
    if (type === 'chunga') setChunga(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c));
    else setGb(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c));
  };

  const handleSave = () => {
    localStorage.setItem('chess_cottages_chunga', JSON.stringify(chunga));
    localStorage.setItem('chess_cottages_gb', JSON.stringify(gb));
    setEditingId(null);
    toast.success("Объекты базы обновлены");
  };

  interface CottageObj { id: string; name: string; capacity?: number | null; active: boolean; }

  const ObjectRow = ({ obj, type }: { obj: CottageObj, type: 'chunga'|'gb' }) => {
    const isEditing = editingId === obj.id;
    const brandColor = type === 'chunga' ? 'chunga' : 'bukhta';

    return (
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between p-5 mb-3 rounded-3xl border transition-all duration-300 group",
        obj.active
          ? "bg-card border-border/50 shadow-sm hover:shadow-md hover:border-accent/30"
          : "bg-muted/30 border-border/30 opacity-60 grayscale-[30%] hover:grayscale-0"
      )}>
        <div className="flex items-center gap-4 flex-1 mb-4 md:mb-0">
          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", 
            type === 'chunga' ? "bg-chunga/10" : "bg-bukhta/10")}>
            <HomeIcon className={cn("h-5 w-5", obj.active ? (type === 'chunga' ? "text-chunga" : "text-bukhta") : "text-muted-foreground")} />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1">
            {isEditing ? (
              <input value={obj.name} onChange={e => handleUpdate(type, obj.id, 'name', e.target.value)}
                className="font-bold text-[15px] border-b-2 border-accent bg-transparent px-1 py-0.5 outline-none w-[250px]" autoFocus />
            ) : (
              <span className="font-bold text-[15px] min-w-[250px]">{obj.name}</span>
            )}
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50 w-fit">
              <Users className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <input type="number" value={obj.capacity || 0} onChange={e => handleUpdate(type, obj.id, 'capacity', parseInt(e.target.value) || 0)}
                  className="w-10 font-mono font-bold text-accent bg-transparent outline-none text-center" />
              ) : (
                <span className="font-mono font-bold">{obj.capacity || "—"}</span>
              )}
              <span className="text-xs text-muted-foreground font-medium">мест</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6 border-t border-border/50 md:border-0 pt-4 md:pt-0">
          <div className="flex items-center space-x-3 bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
            <span className={cn("text-[13px] font-bold", obj.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
              {obj.active ? "Активен" : "Скрыт"}
            </span>
            <Switch checked={obj.active} onCheckedChange={v => handleUpdate(type, obj.id, 'active', v)} />
          </div>
          <Button variant={isEditing ? "default" : "ghost"} size="icon" onClick={() => setEditingId(isEditing ? null : obj.id)}
            className={cn("rounded-xl w-10 h-10 transition-all", isEditing ? "bg-accent hover:bg-accent/90 shadow-md" : "text-muted-foreground hover:text-accent group-hover:opacity-100")}>
            {isEditing ? <Check className="h-5 w-5" /> : <Pencil className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Chunga Changa Section */}
      <section className="bg-card/50 rounded-[32px] border border-border/50 overflow-hidden shadow-sm">
        <button 
          onClick={() => setExpanded(expanded === 'chunga' ? null : 'chunga')}
          className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-chunga/10 rounded-2xl flex items-center justify-center">
              <Sun className="h-7 w-7 text-chunga" />
            </div>
            <div className="text-left">
              <h3 className="font-heading text-xl font-black">Чунга-Чанга</h3>
              <p className="text-muted-foreground text-[12px]">Объекты первой линии ({chunga.filter(c => c.active).length}/{chunga.length} активно)</p>
            </div>
          </div>
          <ChevronDown className={cn("h-6 w-6 text-muted-foreground transition-transform duration-300", expanded === 'chunga' && "rotate-180")} />
        </button>
        
        <div className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded === 'chunga' ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden px-6 pb-6 pt-2">
            {chunga.map(c => <ObjectRow key={c.id} obj={c} type="chunga" />)}
          </div>
        </div>
      </section>

      {/* Golubaya Bukhta Section */}
      <section className="bg-card/50 rounded-[32px] border border-border/50 overflow-hidden shadow-sm">
        <button 
          onClick={() => setExpanded(expanded === 'gb' ? null : 'gb')}
          className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-bukhta/10 rounded-2xl flex items-center justify-center">
              <Waves className="h-7 w-7 text-bukhta" />
            </div>
            <div className="text-left">
              <h3 className="font-heading text-xl font-black">Голубая Бухта</h3>
              <p className="text-muted-foreground text-[12px]">Объекты с собственной территорией ({gb.filter(c => c.active).length}/{gb.length} активно)</p>
            </div>
          </div>
          <ChevronDown className={cn("h-6 w-6 text-muted-foreground transition-transform duration-300", expanded === 'gb' && "rotate-180")} />
        </button>

        <div className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded === 'gb' ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden px-6 pb-6 pt-2">
            {gb.map(c => <ObjectRow key={c.id} obj={c} type="gb" />)}
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4 pb-4">
        <Button onClick={handleSave}
          className="h-14 px-10 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 font-bold text-lg">
          <CheckCircle2 className="h-6 w-6 mr-2" /> Сохранить изменения
        </Button>
      </div>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
