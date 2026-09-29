"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { textSpec, type TextField } from "@/lib/site-content/fields";
import { useSiteEditor, type SiteEditorApi } from "./context";
import { FloatingPanel } from "./FloatingPanel";
import { RichText } from "./RichText";

type Props = {
  field: TextField;
  /** Valor ya resuelto (publicado o default), el que se ve en la tienda. */
  value: string;
  accentClassName?: string;
  /**
   * Editar en un panel aparte en vez de sobre el texto. Para textos que están
   * dentro de un botón o link, donde el cursor de edición no anda bien.
   */
  popover?: boolean;
};

/**
 * Texto del home. En la tienda es solo el texto; dentro de /admin/preview se
 * puede editar ahí mismo haciendo click.
 *
 * Los campos que son URL no se muestran como texto: en la tienda no
 * renderizan nada y en el editor aparecen como un botón "Editar link".
 */
export function EditableText({ field, value, accentClassName, popover }: Props) {
  const editor = useSiteEditor();
  const isUrl = Boolean(textSpec(field).url);

  if (!editor) {
    return isUrl ? null : <RichText value={value} accentClassName={accentClassName} />;
  }

  const props = { field, editor, accentClassName, value: editor.content.text[field] };
  return popover || isUrl ? <PopoverText {...props} /> : <InlineText {...props} />;
}

type EditorProps = {
  field: TextField;
  editor: SiteEditorApi;
  value: string;
  accentClassName?: string;
};

/** Normaliza lo que sale del contentEditable o del input. */
function cleanText(raw: string, multiline: boolean): string {
  const text = raw.replace(/\r/g, "").replace(/ /g, " ");
  return (multiline ? text.replace(/\n{3,}/g, "\n\n") : text.replace(/\n+/g, " ")).trim();
}

const markClass =
  "cursor-text rounded-xs outline-1 outline-offset-4 outline-dashed outline-accent/60 transition-[outline-color] hover:outline-accent";

function stop(e: React.SyntheticEvent) {
  // Muchos textos están dentro de links: que el click edite, no navegue.
  e.preventDefault();
  e.stopPropagation();
}

function InlineText({ field, editor, value, accentClassName }: EditorProps) {
  const spec = textSpec(field);
  const multiline = Boolean(spec.multiline);
  // El ref es para tocar el DOM; el estado, para que el panel se ancle al montarse.
  const elRef = useRef<HTMLSpanElement | null>(null);
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  const setEl = useCallback((node: HTMLSpanElement | null) => {
    elRef.current = node;
    setAnchor(node);
  }, []);
  const cancelledRef = useRef(false);
  const [editing, setEditing] = useState(false);
  const [length, setLength] = useState(0);

  // Al entrar en edición: texto crudo (con los *asteriscos*), foco y cursor al final.
  useLayoutEffect(() => {
    const el = elRef.current;
    if (!editing || !el) return;
    el.textContent = value;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Tope de caracteres: se frena la escritura antes de que entre.
    const onBeforeInput = (event: InputEvent) => {
      const collapsed = window.getSelection()?.isCollapsed ?? true;
      if (event.inputType.startsWith("insert") && collapsed && el.innerText.length >= spec.max) {
        event.preventDefault();
      }
    };
    el.addEventListener("beforeinput", onBeforeInput);
    return () => el.removeEventListener("beforeinput", onBeforeInput);
    // `value` solo se lee al entrar: mientras se edita no cambia.
  }, [editing, anchor, value, spec.max]);

  function startEditing() {
    setLength(value.length);
    setEditing(true);
  }

  function commit() {
    const el = elRef.current;
    setEditing(false);
    if (!el || cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    const next = cleanText(el.innerText, multiline);
    if (!next) {
      toast.error("El texto no puede quedar vacío: se dejó el anterior.");
      return;
    }
    if (next !== value) editor.setText(field, next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    e.stopPropagation();
    if (e.key === "Escape") {
      cancelledRef.current = true;
      e.currentTarget.blur();
    } else if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLSpanElement>) {
    // Solo texto plano, y recortado al lugar que queda.
    e.preventDefault();
    const selected = window.getSelection()?.toString().length ?? 0;
    const room = spec.max - (e.currentTarget.innerText.length - selected);
    const text = e.clipboardData.getData("text/plain").slice(0, Math.max(room, 0));
    document.execCommand("insertText", false, multiline ? text : text.replace(/\s*\n\s*/g, " "));
  }

  if (!editing) {
    return (
      // Keys distintas: React tiene que descartar el nodo que se editó a mano
      // (su texto no lo maneja React) en vez de reutilizarlo.
      <span
        key="view"
        role="button"
        tabIndex={0}
        title="Click para editar"
        className={editor.showMarks ? markClass : "cursor-text"}
        onClick={(e) => {
          stop(e);
          startEditing();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            stop(e);
            startEditing();
          }
        }}
      >
        <RichText value={value} accentClassName={accentClassName} />
      </span>
    );
  }

  return (
    <>
      <span
        key="edit"
        ref={setEl}
        role="textbox"
        aria-multiline={multiline}
        aria-label="Editar texto"
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        className="cursor-text rounded-xs whitespace-pre-wrap outline-2 outline-offset-4 outline-accent"
        onClick={stop}
        onBlur={commit}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onInput={(e) => setLength(e.currentTarget.innerText.replace(/\n$/, "").length)}
      />
      <FloatingPanel anchor={anchor} className="flex items-center gap-3 px-3 py-2">
        <span className={length >= spec.max ? "text-amber-300" : "text-white/60"}>
          {length}/{spec.max}
        </span>
        <span className="hidden text-white/60 sm:inline">
          {multiline ? "Enter: salto de línea · *texto*: color · " : "Enter: listo · "}
          Esc: cancelar
        </span>
        {value !== spec.default && (
          <button
            type="button"
            className="rounded bg-white/10 px-2 py-1 font-medium hover:bg-white/20"
            onClick={() => {
              cancelledRef.current = true;
              editor.resetText(field);
              elRef.current?.blur();
            }}
          >
            Restaurar original
          </button>
        )}
      </FloatingPanel>
    </>
  );
}

function PopoverText({ field, editor, value, accentClassName }: EditorProps) {
  const spec = textSpec(field);
  const multiline = Boolean(spec.multiline);
  const isUrl = Boolean(spec.url);
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);

  function openEditor() {
    setDraft(value);
    setError(null);
    setOpen(true);
  }

  function apply() {
    const next = cleanText(draft, multiline);
    if (!next) return setError("No puede quedar vacío");
    if (isUrl && !/^https:\/\/\S+$/.test(next)) {
      return setError("Tiene que ser un link que empiece con https://");
    }
    if (next !== value) editor.setText(field, next);
    setOpen(false);
  }

  const Input = multiline ? "textarea" : "input";

  return (
    <>
      <span
        ref={setAnchor}
        role="button"
        tabIndex={0}
        title={isUrl ? value : "Click para editar"}
        className={
          isUrl
            ? "ml-2 inline-flex cursor-pointer items-center rounded bg-accent px-1.5 py-0.5 font-sans text-[0.65rem] font-medium tracking-normal text-white normal-case"
            : editor.showMarks || open
              ? markClass
              : "cursor-text"
        }
        onClick={(e) => {
          stop(e);
          if (!open) openEditor();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !open) {
            stop(e);
            openEditor();
          }
        }}
      >
        {isUrl ? "Editar link" : <RichText value={value} accentClassName={accentClassName} />}
      </span>

      {open && (
        <FloatingPanel anchor={anchor} className="w-80 p-3" onDismiss={() => setOpen(false)}>
          <label className="block">
            <span className="mb-1.5 block text-white/60">
              {isUrl ? "Link" : "Texto"} · {draft.length}/{spec.max}
            </span>
            <Input
              autoFocus
              value={draft}
              maxLength={spec.max}
              rows={multiline ? 3 : undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  apply();
                }
              }}
              className="w-full rounded-md bg-white px-2.5 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          {error && <p className="mt-1.5 text-red-300">{error}</p>}
          <div className="mt-3 flex items-center justify-between gap-2">
            {value !== spec.default ? (
              <button
                type="button"
                className="text-white/60 underline-offset-2 hover:text-white hover:underline"
                onClick={() => {
                  editor.resetText(field);
                  setOpen(false);
                }}
              >
                Restaurar original
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md px-2.5 py-1.5 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-md bg-white px-2.5 py-1.5 font-medium text-neutral-900 hover:bg-white/90"
                onClick={apply}
              >
                Aplicar
              </button>
            </div>
          </div>
        </FloatingPanel>
      )}
    </>
  );
}
