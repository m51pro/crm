import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { API_URL } from "@/lib/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OverdueContract {
  id: string;
  contract_number: string;
  client_name: string;
  client_phone: string;
  property: string;
  total: number;
  created_at: string;
}

export function NotifierAlert() {
  const [overdueContracts, setOverdueContracts] = useState<OverdueContract[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOverdue = async () => {
    try {
      const res = await fetch(`${API_URL}/contracts/overdue`);
      const data = await res.json();
      setOverdueContracts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
    // Poll every 1 minute
    const interval = setInterval(fetchOverdue, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || overdueContracts.length === 0) return null;

  const handleRemindLater = async (id: string, date: Date | undefined) => {
    if (!date) return;
    try {
      // Set to 9:00 AM of the selected date to avoid timezone offset issues making it trigger immediately
      date.setHours(9, 0, 0, 0);
      
      await fetch(`${API_URL}/contracts/${id}/reminder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_reminder_at: date.toISOString() }),
      });
      toast.success("Напоминание отложено");
      fetchOverdue();
    } catch (e) {
      toast.error("Ошибка при откладывании напоминания");
    }
  };

  const handleChangeStatus = async (contract: OverdueContract, newStatus: string) => {
    try {
      // Fetch full contract data first to update properly
      const res = await fetch(`${API_URL}/contracts`);
      const allContracts = await res.json();
      const target = allContracts.find((c: Record<string, unknown>) => c.id === contract.id);
      
      if (!target) {
        toast.error("Договор не найден");
        return;
      }

      await fetch(`${API_URL}/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, status: newStatus }),
      });
      
      toast.success(newStatus === "paid" ? "Договор оплачен!" : "Договор аннулирован");
      fetchOverdue();
    } catch (e) {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  return (
    <>
      {/* Alert Bar */}
      <div className="flex items-center justify-between rounded-3xl bg-orange-500/10 border border-orange-500/20 px-6 py-4 mb-6 shadow-[0_0_30px_rgb(245,158,11,0.1)] animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <p className="font-bold text-orange-600 dark:text-orange-400 text-sm">
            {overdueContracts.length} {overdueContracts.length === 1 ? "договор ожидает" : overdueContracts.length < 5 ? "договора ожидают" : "договоров ожидают"} оплаты более 24 часов
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-6 h-10 font-bold shadow-md shadow-orange-500/20"
        >
          Посмотреть
        </Button>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl rounded-3xl overflow-hidden p-0 border-border bg-card">
          <DialogHeader className="px-8 pt-8 pb-4 border-b border-border">
            <DialogTitle className="font-heading text-2xl flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-2xl text-orange-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              Ожидают оплаты
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4 bg-muted/20">
            {overdueContracts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Все договоры оплачены!</p>
              </div>
            ) : (
              overdueContracts.map((contract) => (
                <div key={contract.id} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-orange-500/30 transition-colors">
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-bold bg-muted px-2 py-0.5 rounded-lg text-foreground">
                        № {contract.contract_number}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg font-bold">
                        <Clock className="h-3 w-3" />
                        Создан: {format(new Date(contract.created_at), "dd.MM.yy HH:mm", { locale: ru })}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-[15px] mb-1">{contract.client_name}</h4>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{contract.client_phone || "Нет телефона"}</span>
                      {contract.property === "chunga_changa" && <span className="text-xs font-bold text-chunga">🟠 Чунга-Чанга</span>}
                      {contract.property === "golubaya_bukhta" && <span className="text-xs font-bold text-bukhta">🔵 Голубая Бухта</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center flex-wrap gap-3">
                    {/* Amount reminder */}
                    <div className="text-right mr-2 hidden md:block">
                      <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">К оплате</div>
                      <div className="font-bold text-lg">{Number(contract.total || 0).toLocaleString("ru-RU")} ₽</div>
                    </div>

                    {/* Date Picker (Remind later) */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="rounded-2xl h-11 px-4 border-dashed border-muted-foreground/40 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/5">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Напомнить позже
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden" align="end">
                        <Calendar
                          mode="single"
                          onSelect={(date) => handleRemindLater(contract.id, date)}
                          className="p-4"
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>

                    <Button 
                      onClick={() => handleChangeStatus(contract, "paid")}
                      className="rounded-2xl h-11 px-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Оплачен
                    </Button>
                    
                    <Button 
                      variant="ghost"
                      onClick={() => handleChangeStatus(contract, "cancelled")}
                      className="rounded-2xl h-11 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Аннулировать"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="px-8 py-5 border-t border-border bg-muted/10 flex justify-end shrink-0">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="rounded-2xl font-bold px-6">
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
