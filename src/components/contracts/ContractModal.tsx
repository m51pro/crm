import { Check, ChevronDown, FileDown, Mail, Download } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ClientDrawer from "../clients/ClientDrawer";
import { generatePdfFromHtml } from "@/lib/documentGenerator";
import { API_URL } from "@/lib/api";

import { useContractForm } from "@/hooks/useContractForm";
import { MainSection } from "./modal/MainSection";
import { BookingSection } from "./modal/BookingSection";
import { FinanceSection } from "./modal/FinanceSection";
import { SectionHeader } from "./modal/SectionHeader";
import { Contract } from "@/types/crm";

interface Props {
  open: boolean;
  onClose: () => void;
  contract?: Contract;
  onSaved: () => void;
}

const statusOptions = [
  { value: "pre_booking", label: "Предбронь" },
  { value: "not_paid", label: "Не оплачен" },
  { value: "partial_paid", label: "Частичная предоплата" },
  { value: "paid", label: "Оплачен" },
  { value: "cancelled", label: "Аннулирован" },
];

export default function ContractModal({ open, onClose, contract, onSaved }: Props) {
  const {
    form, setF,
    templates, clients, clientSearch, setClientSearch, clientSearchOpen, setClientSearchOpen,
    clientDrawerOpen, setClientDrawerOpen, saving, showExtraInfo, setShowExtraInfo,
    isEditing, daysCalc, totalRentSum, totalToPay, filteredClients,
    handleSave, fetchClients
  } = useContractForm({ open, contract, onSaved, onClose });

  const handleGenerateDocument = async (templateId: string) => {
    // Автоматически сохраняем изменения перед генерацией, чтобы PDF соответствовал базе
    const saved = await handleSave(false);
    if (!saved) return;

    const ok = await generatePdfFromHtml(templateId, form as Record<string, unknown>, clients as unknown as Record<string, unknown>[]);
    if (!ok) toast.error("Не удалось сформировать документ");
  };

  const handleDownloadPdf = async (templateId: string) => {
    // Сохраняем перед генерацией
    const saved = await handleSave(false);
    if (!saved) return;

    const toastId = toast.loading("Генерация PDF...");
    try {
      const res = await fetch(`${API_URL}/templates/${templateId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_id: contract?.id || form.id || form.contract_number })
      });

      if (!res.ok) throw new Error("Ошибка сервера");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      
      const fileName = `${templateId === 'schet' ? 'Schet' : templateId === 'akt' ? 'Akt' : 'Dogovor'}_${form.contract_number || 'draft'}.pdf`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Документ PDF готов", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Не удалось скачать PDF", { id: toastId });
    }
  };

  const downloadContract = handleDownloadPdf;

  const getStatusBadge = () => {
    const opt = statusOptions.find(o => o.value === form.status);
    if (!opt) return null;
    if (form.status === "paid") return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold ml-3 shadow-md border-0"><Check className="h-3 w-3 mr-1" />{opt.label}</Badge>;
    if (form.status === "partial_paid") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold ml-3 border-amber-200">{opt.label}</Badge>;
    if (form.status === "not_paid") return <Badge className="bg-red-50 text-red-600 font-bold ml-3 shadow-sm border-none">{opt.label}</Badge>;
    if (form.status === "cancelled") return <Badge variant="secondary" className="text-muted-foreground ml-3 opacity-50">{opt.label}</Badge>;
    return <Badge variant="outline" className="border-sky-400 text-sky-600 bg-sky-50 font-bold ml-3 uppercase tracking-tighter">{opt.label}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-[860px] max-h-[95vh] p-0 flex flex-col gap-0 overflow-hidden bg-card border border-border/60 shadow-2xl rounded-2xl">
          <DialogHeader className="px-8 pt-7 pb-5 border-b border-border/60 bg-background/90 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-heading text-2xl font-bold flex items-center">
                {isEditing ? "Договор" : "Новый договор"}
                {getStatusBadge()}
              </DialogTitle>
            </div>
            {!isEditing && (
              <div className="flex mt-3 bg-muted/70 rounded-xl p-1 gap-1 border border-border/50">
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all",
                    form.property === "chunga_changa" ? "bg-background shadow-sm text-chunga" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setF("property", "chunga_changa")}
                >
                  <div className={cn("w-2 h-2 rounded-full bg-chunga", form.property !== "chunga_changa" && "opacity-40")} />
                  Чунга-Чанга
                </button>
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all",
                    form.property === "golubaya_bukhta" ? "bg-background shadow-sm text-bukhta" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setF("property", "golubaya_bukhta")}
                >
                  <div className={cn("w-2 h-2 rounded-full bg-bukhta", form.property !== "golubaya_bukhta" && "opacity-40")} />
                  Голубая Бухта
                </button>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 pb-8 min-h-0 custom-scrollbar relative">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 pt-6 pb-2">
              <div className="flex items-center gap-6">
                <SectionHeader title="Основное" />
                {!isEditing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 rounded-xl transition-all hover:bg-sky-100/50">
                    <Checkbox id="prebooking" checked={form.is_prebooking} onCheckedChange={(c) => setF("is_prebooking", !!c)} className="border-sky-400 data-[state=checked]:bg-sky-500" />
                    <label htmlFor="prebooking" className="text-xs font-black uppercase text-sky-700 dark:text-sky-400 cursor-pointer tracking-wider">Предбронь</label>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs uppercase font-black text-muted-foreground tracking-tighter opacity-70">№ договора</span>
                <span className="font-mono text-lg font-black text-accent -mt-0.5 leading-none">{form.contract_number}</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <MainSection 
                form={form}
                setF={setF}
                clientSearch={clientSearch}
                setClientSearch={setClientSearch}
                clientSearchOpen={clientSearchOpen}
                setClientSearchOpen={setClientSearchOpen}
                filteredClients={filteredClients}
                setClientDrawerOpen={setClientDrawerOpen}
              />

              <BookingSection 
                form={form}
                setF={setF}
                daysCalc={daysCalc}
              />

              <FinanceSection 
                form={form}
                setF={setF}
                totalRentSum={totalRentSum}
                totalToPay={totalToPay}
                showExtraInfo={showExtraInfo}
                setShowExtraInfo={setShowExtraInfo}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 p-4 flex-row items-center justify-between w-full bg-background/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-lg" disabled={templates.length === 0}>
                    <FileDown className="h-4 w-4" /> 
                    Сформировать 
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-zinc-950 border-white/10 text-white p-2">
                  {templates.length > 0 ? templates.map(t => (
                    <div key={t.id} className="mb-2 last:mb-0 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="px-2 py-1 text-[10px] font-black uppercase text-zinc-500 tracking-widest">{t.title}</div>
                      <DropdownMenuItem 
                        onClick={() => handleDownloadPdf(t.id)}
                        className="cursor-pointer gap-3 hover:bg-white/5 focus:bg-white/5 rounded-md py-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <FileDown className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">Скачать PDF</span>
                          <span className="text-[10px] text-zinc-400">Официальный документ</span>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  )) : (
                    <DropdownMenuItem disabled className="text-zinc-500 text-center py-4">Нет доступных шаблонов</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-lg">
                    <Download className="h-4 w-4" />
                    Скачать документ
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-white/10 text-white shadow-2xl p-1">
                  <DropdownMenuItem onClick={() => downloadContract('rental_agreement')} className="cursor-pointer focus:bg-accent/15 focus:text-accent rounded-md">
                    Договор на проживание
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadContract('schet')} className="cursor-pointer focus:bg-accent/15 focus:text-accent rounded-md">
                    Счёт на оплату
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadContract('akt')} className="cursor-pointer focus:bg-accent/15 focus:text-accent rounded-md">
                    Акт выполненных работ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="gap-2 rounded-lg"><Mail className="h-4 w-4" /> Email</Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving} className="rounded-lg">Применить</Button>
              <Button onClick={() => handleSave(true)} disabled={saving} className="bg-amber-500 text-white hover:bg-amber-600 font-bold px-8 rounded-lg shadow-md">ОК</Button>
              <Button variant="ghost" onClick={onClose} className="rounded-lg">Закрыть</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ClientDrawer open={clientDrawerOpen} onClose={() => setClientDrawerOpen(false)} onSaved={fetchClients} />
    </>
  );
}
