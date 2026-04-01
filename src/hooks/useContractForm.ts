import { useEffect, useState, useMemo, useCallback } from "react";
import { format, differenceInDays, addHours, parse } from "date-fns";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { CHUNGA_CHANGA_COTTAGES, GB_COTTAGES } from "@/lib/chess-data";
import { Client, Contract, Template } from "@/types/crm";

interface UseContractFormProps {
  open: boolean;
  contract?: Contract;
  onSaved: () => void;
  onClose: () => void;
}

export function useContractForm({ open, contract, onSaved, onClose }: UseContractFormProps) {
  const isEditing = !!contract?.id;

  const [form, setForm] = useState({
    contract_number: "",
    contract_date: format(new Date(), "yyyy-MM-dd"),
    client_id: "",
    client_name: "",
    client_phone: "",
    property: "chunga_changa" as "chunga_changa" | "golubaya_bukhta",
    cottage_id: "",
    bath_included: false,
    bath_date: "",
    bath_time_from: "",
    bath_time_to: "",
    checkin_at_date: "",
    checkin_at_time: "14:00",
    checkout_at_date: "",
    checkout_at_time: "12:00",
    guest_count: "" as string | number,
    rent_price: "",
    prepayment: "",
    payment_date: "",
    payment_amount: "",
    extra_info: "",
    status: "not_paid",
    is_prebooking: false,
    is_full_day: false,
    cottage_included: true,
    sauna_included: false,
    hot_tub_included: false,
    sauna_date: "",
    sauna_time_from: "",
    sauna_time_to: "",
    sauna_price: "",
    sauna_guests: "",
    hot_tub_date: "",
    hot_tub_time_from: "",
    hot_tub_time_to: "",
    hot_tub_price: "",
    hot_tub_guests: "",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/templates`);
      const data = await res.json();
      if (data.success) setTemplates(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!open) return;
    
    fetchClients();
    fetchTemplates();

    if (contract) {
      setForm(prev => ({
        ...prev, 
        contract_number: contract.contract_number || "",
        contract_date: contract.contract_date || format(new Date(), "yyyy-MM-dd"),
        client_id: contract.client_id || "",
        client_name: contract.client_name || "",
        client_phone: contract.client_phone || "",
        property: contract.property || "chunga_changa",
        cottage_id: contract.cottage_id || "",
        bath_included: !!contract.bath_included,
        bath_date: contract.bath_date || "",
        bath_time_from: contract.bath_time_from || "",
        bath_time_to: contract.bath_time_to || "",
        checkin_at_date: contract.checkin_at ? format(new Date(contract.checkin_at), "yyyy-MM-dd") : (contract.check_in_date || ""),
        checkin_at_time: contract.checkin_at ? format(new Date(contract.checkin_at), "HH:mm") : (contract.check_in_hour ? `${contract.check_in_hour}:00` : "14:00"),
        checkout_at_date: contract.checkout_at ? format(new Date(contract.checkout_at), "yyyy-MM-dd") : (contract.check_out_date || ""),
        checkout_at_time: contract.checkout_at ? format(new Date(contract.checkout_at), "HH:mm") : (contract.check_out_hour ? `${contract.check_out_hour}:00` : "12:00"),
        guest_count: contract.guest_count || "",
        rent_price: (contract.rent_price || 0).toString(),
        prepayment: (contract.prepayment || 0).toString(),
        payment_date: contract.payment_date || "",
        payment_amount: (contract.payment_amount || 0).toString(),
        extra_info: contract.extra_info || contract.notes || "",
        status: contract.status || "not_paid",
        is_prebooking: contract.status === "pre_booking",
        is_full_day: !!contract.is_full_day,
        cottage_included: contract.cottage_included !== undefined ? !!contract.cottage_included : true,
        sauna_included: !!contract.sauna_included,
        hot_tub_included: !!contract.hot_tub_included,
        sauna_date: contract.sauna_date || "",
        sauna_time_from: contract.sauna_time_from || "",
        sauna_time_to: contract.sauna_time_to || "",
        sauna_price: contract.sauna_price?.toString() || "",
        sauna_guests: contract.sauna_guests?.toString() || "",
        hot_tub_date: contract.hot_tub_date || "",
        hot_tub_time_from: contract.hot_tub_time_from || "",
        hot_tub_time_to: contract.hot_tub_time_to || "",
        hot_tub_price: contract.hot_tub_price?.toString() || "",
        hot_tub_guests: contract.hot_tub_guests?.toString() || "",
      }));
    } else {
      // Initialize with base state and then fetch next number
      setForm(prev => ({ 
        ...prev, 
        contract_number: "Загрузка...",
        contract_date: format(new Date(), "yyyy-MM-dd"),
        client_id: "", client_name: "", client_phone: "",
        property: "chunga_changa",
        cottage_id: "",
        bath_included: false,
        checkin_at_date: "",
        checkout_at_date: "",
      }));

      fetch(`${API_URL}/contracts/next-number`)
        .then(r => r.json())
        .then(d => {
          setForm(prev => ({ ...prev, contract_number: d.next_number || "Новый" }));
        })
        .catch(() => setForm(prev => ({ ...prev, contract_number: "Новый" })));
    }
  }, [open, contract]);

  const setF = useCallback((k: string, v: string | number | boolean) => setForm(p => {
    const next = { ...p, [k]: v } as typeof p;
    
    if (k === "property" && v === "golubaya_bukhta") {
      next.checkin_at_time = "17:00";
      next.checkout_at_time = "14:00";
      if (next.checkin_at_date) {
        const d = new Date(next.checkin_at_date);
        d.setDate(d.getDate() + 1);
        next.checkout_at_date = format(d, "yyyy-MM-dd");
      }
    } else if (k === "checkin_at_date" && next.property === "golubaya_bukhta") {
      const d = new Date(v as string);
      d.setDate(d.getDate() + 1);
      next.checkin_at_time = "17:00";
      next.checkout_at_time = "14:00";
      next.checkout_at_date = format(d, "yyyy-MM-dd");
    }
    
    if (next.property === "chunga_changa") {
      if (k === "is_full_day" && v === true) {
        next.checkin_at_time = "13:00";
        next.checkout_at_time = "12:00";
        if (next.checkin_at_date) {
          const d = new Date(next.checkin_at_date);
          d.setDate(d.getDate() + 1);
          next.checkout_at_date = format(d, "yyyy-MM-dd");
        }
      } else if (!next.is_full_day && (k === "checkin_at_date" || k === "checkin_at_time")) {
        if (next.checkin_at_date && next.checkin_at_time) {
          try {
            const currentCheckin = parse(`${next.checkin_at_date} ${next.checkin_at_time}`, "yyyy-MM-dd HH:mm", new Date());
            const threeHoursLater = addHours(currentCheckin, 3);
            next.checkout_at_date = format(threeHoursLater, "yyyy-MM-dd");
            next.checkout_at_time = format(threeHoursLater, "HH:mm");
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    return next;
  }), []);

  const daysCalc = useMemo(() => {
    if (!form.checkin_at_date || !form.checkout_at_date) return 0;
    const d1 = new Date(form.checkin_at_date);
    const d2 = new Date(form.checkout_at_date);
    return Math.max(0, differenceInDays(d2, d1));
  }, [form.checkin_at_date, form.checkout_at_date]);

  const totalRentSum = useMemo(() => {
    let sum = parseFloat(form.rent_price) || 0;
    if (form.property === "golubaya_bukhta") {
      if (form.sauna_included) sum += (parseFloat(form.sauna_price as string) || 0);
      if (form.hot_tub_included) sum += (parseFloat(form.hot_tub_price as string) || 0);
    }
    return sum;
  }, [form.rent_price, form.property, form.sauna_included, form.sauna_price, form.hot_tub_included, form.hot_tub_price]);

  const totalToPay = useMemo(() => {
    const prepay = parseFloat(form.prepayment) || 0;
    return Math.max(0, totalRentSum - prepay);
  }, [totalRentSum, form.prepayment]);

  useEffect(() => {
    if (form.status === "cancelled") return;
    if (form.is_prebooking) {
      if (form.status !== "pre_booking") setF("status", "pre_booking");
      return;
    }
    const rent = totalRentSum;
    const prepay = parseFloat(form.prepayment.toString()) || 0;
    let newStatus = "not_paid";
    if (prepay === 0) newStatus = "not_paid";
    else {
      const remains = Math.max(0, rent - prepay);
      if (remains === 0) newStatus = "paid";
      else if (remains > 0 && remains < rent) newStatus = "partial_paid";
      else newStatus = "not_paid"; 
    }
    if (form.status !== newStatus) setF("status", newStatus);
  }, [totalRentSum, form.prepayment, form.status, form.is_prebooking, setF]);

  const handleSave = async (closeAfter = true) => {
    if (!form.client_name || !form.cottage_id) {
      toast.error("Заполните арендатора и коттедж");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        days: daysCalc,
        total: totalRentSum,
        checkin_at: form.checkin_at_date ? `${form.checkin_at_date}T${form.checkin_at_time}:00` : null,
        checkout_at: form.checkout_at_date ? `${form.checkout_at_date}T${form.checkout_at_time}:00` : null,
      };
      if (isEditing && contract) {
        await fetch(`${API_URL}/contracts/${contract.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Договор обновлён");
      } else {
        await fetch(`${API_URL}/contracts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Договор создан");
      }
      onSaved();
      if (closeAfter) onClose();
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(error.message || "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    if (!q && !clientSearchOpen) return [];
    return clients.filter(c => {
      const fullName = [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ").toLowerCase();
      const orgName = (c.org_name || "").toLowerCase();
      const phone = (c.phone || c.contact_phone || "").toLowerCase();
      return fullName.includes(q) || orgName.includes(q) || phone.includes(q);
    }).slice(0, 10);
  }, [clients, clientSearch, clientSearchOpen]);

  return {
    form, setF,
    clients, templates, clientSearch, setClientSearch, clientSearchOpen, setClientSearchOpen,
    clientDrawerOpen, setClientDrawerOpen, saving, showExtraInfo, setShowExtraInfo,
    isEditing, daysCalc, totalRentSum, totalToPay, filteredClients,
    handleSave, fetchClients
  };
}
