import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Send, Server, ShieldCheck, MailWarning } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SmtpSettings() {
  const [form, setForm] = useState({
    host: "smtp.yandex.ru", port: "465", login: "robot@chunga-changa.ru",
    password: "•••••••••••••", encryption: "ssl"
  });
  const [testing, setTesting] = useState(false);

  const handleChange = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); toast.success("Настройки SMTP сохранены!"); };

  const handleTest = () => {
    setTesting(true);
    toast.info("Подключение к SMTP-серверу...");
    setTimeout(() => { setTesting(false); toast.success("Тестовое письмо отправлено!"); }, 2000);
  };

  const SectionTitle = ({ title, icon: Icon, desc }: { title: string, icon: React.ElementType, desc: string }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1.5">
        <div className="p-2 rounded-xl bg-accent/10 text-accent"><Icon size={18} strokeWidth={2.5} /></div>
        <h3 className="font-heading text-xl font-bold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground pl-11">{desc}</p>
    </div>
  );

  const inputCn = "h-12 bg-muted/30 border-border rounded-2xl focus-visible:ring-accent/30 focus-visible:border-accent";

  return (
    <form onSubmit={handleSubmit} className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <SectionTitle title="Параметры сервера" icon={Server} desc="Настройки почтового провайдера." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <div className="col-span-2 space-y-2"><Label className="text-muted-foreground ml-1">SMTP Хост</Label><Input value={form.host} onChange={e => handleChange("host", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">Порт</Label><Input value={form.port} onChange={e => handleChange("port", e.target.value)} className={inputCn + " font-mono"} type="number" /></div>
          <div className="space-y-2"><Label className="text-muted-foreground ml-1">Логин</Label><Input value={form.login} onChange={e => handleChange("login", e.target.value)} className={inputCn} /></div>
          <div className="space-y-2 col-span-2"><Label className="text-muted-foreground ml-1">Пароль</Label><Input value={form.password} onChange={e => handleChange("password", e.target.value)} type="password" className={inputCn + " font-mono tracking-widest"} /></div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <SectionTitle title="Безопасность" icon={ShieldCheck} desc="Тип шифрования соединения." />
        <div className="bg-muted/30 p-6 rounded-3xl border border-border">
          <RadioGroup value={form.encryption} onValueChange={v => handleChange("encryption", v)} className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            {[
              { id: "ssl", label: "SSL (порт 465)" },
              { id: "tls", label: "TLS (порт 587)" },
              { id: "none", label: "Без шифрования" },
            ].map(enc => (
              <div key={enc.id} className="flex items-center space-x-3 cursor-pointer">
                <RadioGroupItem value={enc.id} id={enc.id} className="text-accent border-border" />
                <Label htmlFor={enc.id} className="cursor-pointer">{enc.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </section>

      <section>
        <SectionTitle title="Проверка связи" icon={MailWarning} desc="Отправка тестового письма." />
        <div className="group relative overflow-hidden bg-card border border-border p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-accent/50 transition-colors">
          <div>
            <h4 className="font-bold text-lg mb-1">Протестируйте почту</h4>
            <p className="text-muted-foreground text-sm">Отправим письмо на <span className="font-mono bg-muted px-1.5 py-0.5 rounded-lg text-accent">{form.login}</span></p>
          </div>
          <Button type="button" variant="outline" onClick={handleTest} disabled={testing} className="h-12 px-8 rounded-2xl font-semibold shrink-0">
            <Send className={cn("h-4 w-4 mr-2", testing && "animate-ping")} /> {testing ? "Отправляем..." : "Отправить тестовое письмо"}
          </Button>
        </div>
      </section>

      <div className="flex justify-end pt-8 pb-4">
        <Button type="submit" className="h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-md shadow-accent/20 font-bold">
          <CheckCircle2 className="h-5 w-5 mr-2" /> Сохранить настройки
        </Button>
      </div>
    </form>
  );
}
