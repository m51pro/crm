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

export default function Chess() {
  const [date, setDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/bookings");
      const data = await res.json();
      setBookings(data);
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
  const chungaBookings = bookings.filter(b => b.property === 'chunga');
  const gbCottageBookings = bookings.filter(b => b.property === 'gb_cottages');
  const gbBanyaBookings = bookings.filter(b => b.property === 'gb_banya');

  const handleExportPdf = () => {
    toast.info("Экспорт PDF будет доступен после подключения данных");
  };

  return (
    <div className="flex flex-col h-full">
      <DateNavBar date={date} onDateChange={setDate} onExportPdf={handleExportPdf} />

      <div className="flex-1 overflow-auto flex flex-col pb-6">
        <div className="px-6 pt-6">
          <NotifierAlert />
        </div>
      
        <Tabs defaultValue="chunga" className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 mt-2">
            <TabsList className="bg-muted rounded-2xl p-1 h-auto">
              <TabsTrigger
                value="chunga"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-chunga data-[state=active]:text-chunga-foreground data-[state=active]:shadow-md data-[state=active]:shadow-chunga/20 transition-all"
              >
                🟠 Чунга-Чанга
              </TabsTrigger>
              <TabsTrigger
                value="golubaya"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-bukhta data-[state=active]:text-bukhta-foreground data-[state=active]:shadow-md data-[state=active]:shadow-bukhta/20 transition-all"
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
              accentClass="bg-chunga"
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
