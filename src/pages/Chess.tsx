import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateNavBar } from "@/components/chess/DateNavBar";
import { HourlyGrid } from "@/components/chess/HourlyGrid";
import { DailyGrid } from "@/components/chess/DailyGrid";
import { BookingLegend } from "@/components/chess/BookingLegend";
import {
  CHUNGA_CHANGA_COTTAGES,
  GB_COTTAGES,
  GB_BANYA_ITEMS,
  HOURS_CC,
  HOURS_GB_BANYA,
  type Booking,
} from "@/lib/chess-data";
import { toast } from "sonner";
import { NotifierAlert } from "@/components/contracts/NotifierAlert";
import { apiFetch } from "@/lib/api";

export default function Chess() {
  const [date, setDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = new URL(apiFetch("/bookings").url);
      url.searchParams.set("date", date.toISOString().slice(0, 10));
      const res = await fetch(url.toString());
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      toast.error("Ошибка загрузки бронирований");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const activeChunga = useMemo(() => {
    const saved = localStorage.getItem('chess_cottages_chunga');
    if (!saved) return CHUNGA_CHANGA_COTTAGES;
    const items = JSON.parse(saved);
    return CHUNGA_CHANGA_COTTAGES.filter(c => items.find((i: { id: string; active: boolean }) => i.id === c.id)?.active !== false);
  }, []);

  const activeGb = useMemo(() => {
    const saved = localStorage.getItem('chess_cottages_gb');
    if (!saved) return GB_COTTAGES;
    const items = JSON.parse(saved);
    return GB_COTTAGES.filter(c => items.find((i: { id: string; active: boolean }) => i.id === c.id)?.active !== false);
  }, []);

  // Split bookings by property for grids
  const chungaBookings = bookings.filter(b => b.property === 'chunga_changa' || b.property === 'chunga');
  const gbCottageBookings = bookings.filter(b => b.property === 'golubaya_bukhta' || b.property === 'gb_cottages');
  const gbBanyaBookings = bookings.filter(b => b.property === 'gb_banya');

  const handleExportPdf = () => {
    toast.info("Экспорт PDF будет доступен после подключения данных");
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <DateNavBar date={date} onDateChange={setDate} onExportPdf={handleExportPdf} />

      <div className="flex-1 overflow-auto flex flex-col pb-6 gap-4">
        <div className="px-6 pt-6">
          <NotifierAlert />
        </div>
      
        <Tabs defaultValue="chunga" className="space-y-4 flex-1 flex flex-col px-6">
          <div className="flex items-center justify-between mt-1 gap-4 flex-wrap">
            <TabsList className="bg-background/80 border border-border/60 rounded-2xl p-1 h-auto shadow-sm">
              <TabsTrigger
                value="chunga"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                🟠 Чунга-Чанга
              </TabsTrigger>
              <TabsTrigger
                value="golubaya"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                🔵 Голубая Бухта
              </TabsTrigger>
            </TabsList>
            <BookingLegend />
          </div>

          <TabsContent value="chunga" className="mt-0 flex-1 border-t border-border mt-2">
            <HourlyGrid
              columns={activeChunga}
              hours={HOURS_CC}
              bookings={chungaBookings}
              date={date}
              accentClass="bg-primary"
              onRefresh={fetchBookings}
            />
          </TabsContent>

          <TabsContent value="golubaya" className="mt-0 flex-1 space-y-6 pt-6">
            <div>
              <h3 className="font-heading text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide px-6">
                Коттеджи
              </h3>
              <div className="border-t border-border">
                <DailyGrid 
                  columns={activeGb} 
                  bookings={gbCottageBookings} 
                  date={date} 
                  onRefresh={fetchBookings}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3 px-6">
                <div className="h-px flex-1 bg-border" />
                <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Баня и Фурако
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="border-t border-border">
                <HourlyGrid
                  columns={GB_BANYA_ITEMS}
                  hours={HOURS_GB_BANYA}
                  bookings={gbBanyaBookings}
                  date={date}
                  accentClass="bg-bukhta"
                  onRefresh={fetchBookings}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
