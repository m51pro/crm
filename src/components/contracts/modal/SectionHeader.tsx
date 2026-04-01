import React from "react";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-4 mt-2">
      <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-accent/80 whitespace-nowrap">
        {title}
      </h3>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}
