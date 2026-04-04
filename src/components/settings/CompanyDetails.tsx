import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, Building2, CreditCard, Mail, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CompanyDetails() {
  const [form, setForm] = useState({
    name: "Общество с ограниченной ответственностью «Золото Арктики»",
    shortName: "ООО «Золото Арктики»",
    inn: "5105013870",
    kpp: "510501001",
    ogrn: "1215100000158",
    address: "184433, Мурманская область, Печенгский район, г. Заполярный, ул. Ленина, д.1А, помещение 34",
    postalAddress: "183038, г. Мурманск, пер. Терский, д. З",
    director: "Сташ Екатерина Александровна",
    directorBasis: "Устава",
    bank: "МУРМАНСКОЕ ОТДЕЛЕНИЕ N8627 ПАО СБЕРБАНК",
    raschetSchet: "40702810941710000190",
    korrSchet: "30101810300000000615",
    bik: "044705615",
    bankInn: "7707083893",
    bankKpp: "519002001",
    phone: "(815-2) 99-44-21",
    fax: "(815-2) 99-49-49",
    emailChunga: "admin@chunga-changa.ru",
    emailBukhta: "admin@golubayabukhta.ru"
  });

  const handleChange = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Реквизиты успешно сохранены", { description: "Данные обновлены во всех печатных формах" });
  };

  const ImageUpload = ({ label, description }: { label: string, description: string }) => (
    <div className="relative group overflow-hidden border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-accent hover:bg-accent/5 transition-all duration-300 cursor-pointer bg-muted/30">
      <div className="h-14 w-14 rounded-2xl bg-card shadow-sm border border-border flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform duration-300">
        <UploadCloud className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-bold text-foreground text-[15px] mb-1.5">{label}</h3>
      <p className="text-[13px] text-muted-foreground font-medium">{description}</p>
    </div>
  );

  const SectionTitle = ({ title, icon: Icon, desc }: { title: string, icon: React.ElementType, desc: string }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1.5">
        <div className="p-2 rounded-xl bg-accent/10 text-accent">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <h3 className="font-heading text-xl font-bold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground pl-11">{desc}</p>
    </div>
  );

  const inputCn = "h-12 bg-muted/30 border-border rounded-2xl focus-visible:ring-accent/30 focus-visible:border-accent";

  return (
    <form onSubmit={handleSubmit} className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <SectionTitle title="Юридические данные" icon={Building2} desc="Основная информация об организации для документов." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div className="space-y-2 col-span-full md:col-span-2">
            <Label className="text-muted-foreground ml-1">Полное название организации</Label>
            <Input value={form.name} onChange={e => handleChange("name", e.target.value)} className={inputCn + " text-[15px] font-medium"} />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1">Сокращенное название</Label>
            <Input value={form.shortName} onChange={e => handleChange("shortName", e.target.value)} className={inputCn} />
          </div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">ИНН</Label><Input value={form.inn} onChange={e => handleChange("inn", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">КПП</Label><Input value={form.kpp} onChange={e => handleChange("kpp", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">ОГРН</Label><Input value={form.ogrn} onChange={e => handleChange("ogrn", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">Директор (ФИО)</Label><Input value={form.director} onChange={e => handleChange("director", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">Основание (Устава/Доверенности)</Label><Input value={form.directorBasis} onChange={e => handleChange("directorBasis", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">Телефон</Label><Input value={form.phone} onChange={e => handleChange("phone", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">Факс</Label><Input value={form.fax} onChange={e => handleChange("fax", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2 col-span-full"><Label className="text-muted-foreground ml-1">Юридический адрес</Label><Input value={form.address} onChange={e => handleChange("address", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2 col-span-full"><Label className="text-muted-foreground ml-1">Почтовый адрес</Label><Input value={form.postalAddress} onChange={e => handleChange("postalAddress", e.target.value)} className={inputCn} /></div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <SectionTitle title="Банковские реквизиты" icon={CreditCard} desc="Для генерации счетов на оплату." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 col-span-full"><Label className="text-muted-foreground ml-1">Банк</Label><Input value={form.bank} onChange={e => handleChange("bank", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2 col-span-full"><Label className="text-muted-foreground ml-1">Расчётный счёт</Label><Input value={form.raschetSchet} onChange={e => handleChange("raschetSchet", e.target.value)} className={inputCn + " font-mono"} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">Корр. счёт</Label><Input value={form.korrSchet} onChange={e => handleChange("korrSchet", e.target.value)} className={inputCn + " font-mono"} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">БИК</Label><Input value={form.bik} onChange={e => handleChange("bik", e.target.value)} className={inputCn + " font-mono"} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">ИНН Банка</Label><Input value={form.bankInn} onChange={e => handleChange("bankInn", e.target.value)} className={inputCn + " font-mono"} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">КПП Банка</Label><Input value={form.bankKpp} onChange={e => handleChange("bankKpp", e.target.value)} className={inputCn + " font-mono"} /></div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <SectionTitle title="Фирменный стиль и подписи" icon={ImageIcon} desc="Для автоматической простановки на документах." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUpload label="Логотип компании" description="PNG, до 2MB" />
          <ImageUpload label="Печать организации" description="PNG прозрачный фон" />
          <ImageUpload label="Подпись директора" description="PNG прозрачный фон" />
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <SectionTitle title="Email администраторов" icon={Mail} desc="Для уведомлений по базам." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-chunga" />Чунга-Чанга</Label>
            <Input type="email" value={form.emailChunga} onChange={e => handleChange("emailChunga", e.target.value)} className={inputCn} />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-bukhta" />Голубая Бухта</Label>
            <Input type="email" value={form.emailBukhta} onChange={e => handleChange("emailBukhta", e.target.value)} className={inputCn} />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-8 pb-4">
        <Button type="submit" className="h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-md shadow-accent/20 font-bold">
          <CheckCircle2 className="h-5 w-5 mr-2" /> Сохранить изменения
        </Button>
      </div>
    </form>
  );
}
