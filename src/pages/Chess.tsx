import { useState } from "react";
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
  MOCK_BOOKINGS_CC,
  MOCK_BOOKINGS_GB_COTTAGES,
  MOCK_BOOKINGS_GB_BANYA,
} from "@/lib/chess-data";
import { toast } from "sonner";

export default function Chess() {
  const [date, setDate] = useState(new Date());

  const handleExportPdf = () => {
    toast.info("Экспорт PDF будет доступен после подключения данных");
  };

  return (
    <div className="flex flex-col h-full">
      <DateNavBar date={date} onDateChange={setDate} onExportPdf={handleExportPdf} />

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="chunga" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="chunga"
                className="data-[state=active]:bg-forest data-[state=active]:text-forest-foreground"
              >
                Чунга-Чанга
              </TabsTrigger>
              <TabsTrigger
                value="golubaya"
                className="data-[state=active]:bg-teal data-[state=active]:text-teal-foreground"
              >
                Голубая Бухта
              </TabsTrigger>
            </TabsList>
            <BookingLegend />
          </div>

          <TabsContent value="chunga">
            <HourlyGrid
              columns={CHUNGA_CHANGA_COTTAGES}
              hours={HOURS_CC}
              bookings={MOCK_BOOKINGS_CC}
              date={date}
              accentClass="bg-forest"
            />
          </TabsContent>

          <TabsContent value="golubaya" className="space-y-6">
            <div>
              <h3 className="font-heading text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Коттеджи
              </h3>
              <DailyGrid columns={GB_COTTAGES} bookings={MOCK_BOOKINGS_GB_COTTAGES} date={date} />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-border" />
                <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Баня и Фурако
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <HourlyGrid
                columns={GB_BANYA_ITEMS}
                hours={HOURS_GB_BANYA}
                bookings={MOCK_BOOKINGS_GB_BANYA}
                date={date}
                accentClass="bg-teal"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
