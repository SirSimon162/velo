"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { IconCheck, IconChevronDown, IconSearch, IconX } from "../icons";
import { Label } from "../atoms/Label";

export interface SearchableSelectOption {
  value: string;
  label: string;
  group?: string;
  hint?: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

const DROPDOWN_MAX_H = 240;

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  className,
}: SearchableSelectProps) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.group?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const updateMenuPosition = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUp = spaceBelow < DROPDOWN_MAX_H && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      DROPDOWN_MAX_H,
      openUp ? spaceAbove : spaceBelow,
    );

    setMenuStyle({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(maxHeight, 120),
      top: openUp ? rect.top - 4 : rect.bottom + 4,
    });
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && filtered[highlight]) {
      e.preventDefault();
      selectOption(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, SearchableSelectOption[]>();
    for (const opt of filtered) {
      const key = opt.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(opt);
    }
    return [...map.entries()];
  }, [filtered]);

  let optionIndex = -1;

  const dropdown =
    open &&
    menuStyle &&
    typeof document !== "undefined" &&
    createPortal(
      <ul
        ref={dropdownRef}
        id={listboxId}
        role="listbox"
        aria-label={label}
        style={{
          position: "fixed",
          top: menuStyle.top,
          left: menuStyle.left,
          width: menuStyle.width,
          maxHeight: menuStyle.maxHeight,
          transform:
            menuStyle.top < (rootRef.current?.getBoundingClientRect().top ?? 0)
              ? "translateY(-100%)"
              : undefined,
          zIndex: 200,
        }}
        className="overflow-y-auto rounded-lg border border-border-muted bg-bg-elevated py-1 shadow-xl"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-2.5 text-sm text-faint">No matches</li>
        ) : (
          grouped.map(([group, items]) => (
            <li key={group || "default"} role="presentation">
              {group && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-disabled">
                  {group}
                </p>
              )}
              <ul role="group" aria-label={group || undefined}>
                {items.map((opt) => {
                  optionIndex += 1;
                  const idx = optionIndex;
                  const active = idx === highlight;
                  const isSelected = opt.value === value;
                  return (
                    <li key={opt.value} role="presentation">
                      <button
                        id={`${id}-opt-${opt.value}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setHighlight(idx)}
                        onClick={() => selectOption(opt)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-accent-muted text-accent-text"
                            : "text-subtle hover:bg-surface-hover",
                        )}
                      >
                        <span className="min-w-0 truncate">{opt.label}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          {opt.hint && (
                            <span className="text-xs tabular-nums text-faint">
                              {opt.hint}
                            </span>
                          )}
                          {isSelected && <IconCheck size={16} />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))
        )}
      </ul>,
      document.body,
    );

  return (
    <div ref={rootRef} className={cn("relative space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>

      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-bg-elevated transition-colors",
          open
            ? "border-accent ring-2 ring-accent/20"
            : "border-border hover:border-border-dashed",
        )}
      >
        <IconSearch className="ml-3 text-faint" size={16} />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[highlight]
              ? `${id}-opt-${filtered[highlight].value}`
              : undefined
          }
          value={open ? query : selected?.label ?? ""}
          placeholder={open ? searchPlaceholder : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={onInputKeyDown}
          className="min-w-0 flex-1 bg-transparent py-2.5 pr-1 text-base text-foreground outline-none placeholder:text-disabled"
        />

        {value && value !== options[0]?.value && !open && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => onChange(options[0]?.value ?? "")}
            className="rounded-lg p-1.5 text-faint transition-colors hover:bg-surface-hover hover:text-subtle"
          >
            <IconX size={16} />
          </button>
        )}

        <button
          type="button"
          aria-label={open ? "Close options" : "Open options"}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) inputRef.current?.focus();
          }}
          className="mr-2 rounded-lg p-1.5 text-faint transition-colors hover:bg-surface-hover hover:text-subtle"
        >
          <IconChevronDown
            size={18}
            className={cn("transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      </div>

      {dropdown}
    </div>
  );
}
