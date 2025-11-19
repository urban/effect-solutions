"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DocSearchDocument } from "@/lib/doc-search";

export function CommandPalette({
  documents,
}: {
  documents: DocSearchDocument[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-20 bg-black/50 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-2xl overflow-hidden bg-background border border-border shadow-2xl">
        <Command.Input
          placeholder="Search docs..."
          className="w-full px-4 py-3 text-lg bg-transparent border-none outline-none text-foreground placeholder:text-zinc-500"
        />
        <Command.List className="max-h-[60vh] overflow-y-auto border-t border-border p-2">
          <Command.Empty className="py-6 text-center text-zinc-500">
            No results found.
          </Command.Empty>

          {documents.map((doc) => (
            <Command.Item
              key={doc.slug}
              value={`${doc.title} ${doc.description} ${doc.keywords.join(" ")}`}
              onSelect={() => {
                setOpen(false);
                router.push(`/${doc.slug}`);
              }}
              className="flex flex-col gap-1 px-3 py-2 cursor-pointer data-[selected='true']:bg-zinc-800/50 text-foreground rounded-sm"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-medium font-mono text-sm">
                  {doc.title}
                </span>
                {doc.description && (
                  <span className="text-xs text-zinc-400 truncate">
                    {doc.description}
                  </span>
                )}
              </div>
            </Command.Item>
          ))}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
