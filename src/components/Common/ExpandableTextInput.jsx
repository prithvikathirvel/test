"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog, Tooltip } from "@mui/material";
import {
  Check,
  Copy,
  Maximize2,
  Minimize2,
  WrapText,
  Braces,
  AlertCircle,
  X,
} from "lucide-react";
import { isTemplateRef, looksLikeJson } from "@/utils/templateRef";

/**
 * Auto-growing, expandable text editor for large free-form payloads
 * (JSON / Markdown / HTML / prompts).
 *
 * Why this exists: the "Use Text Input" toggles in the node parameter panel
 * rendered a single-line `InputBox`, so anything longer than ~60 characters was
 * unreadable and un-editable. This component keeps the compact inline footprint
 * of a small field but:
 *   - grows with its content between `minRows` and `maxRows` (never pushes the
 *     surrounding panel around unpredictably — it caps and scrolls instead),
 *   - can be popped out into a distraction-free full-screen editor,
 *   - shows live JSON validity, line/char counts, and a Beautify action,
 *   - supports soft-wrap toggling for long single-line payloads,
 *   - inserts real tabs instead of moving focus (Tab key),
 *   - is fully controlled, so no existing save/update logic changes.
 */
const LINE_HEIGHT = 20; // px, matches text-[12.5px]/leading-5
const VERTICAL_PADDING = 20; // py-2.5 top + bottom

const ExpandableTextInput = ({
  value = "",
  onChange,
  placeholder = "Enter value...",
  minRows = 4,
  maxRows = 14,
  language = "auto", // "auto" | "json" | "text"
  title = "Value",
  disabled = false,
  error = null,
  className = "",
  /**
   * `compact` keeps the utility bar hidden until the field is focused, hovered,
   * or actually holds a large value — so a one-line string parameter still
   * looks like a plain input and the surrounding panel keeps its density.
   */
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inlineRef = useRef(null);
  const modalRef = useRef(null);

  const text = value ?? "";

  const isJsonMode = language === "json" || (language === "auto" && looksLikeJson(text));

  const jsonError = useMemo(() => {
    if (!isJsonMode || !text.trim()) return null;
    // Template refs (`{{KEY}}`) are resolved at runtime — never JSON.
    if (isTemplateRef(text)) return null;
    try {
      JSON.parse(text);
      return null;
    } catch (e) {
      return e.message;
    }
  }, [isJsonMode, text]);

  const stats = useMemo(() => {
    const lines = text ? text.split("\n").length : 0;
    return { lines, chars: text.length };
  }, [text]);

  /** Grows the textarea to fit its content, clamped to [minRows, maxRows]. */
  const autoSize = useCallback(
    (el) => {
      if (!el) return;
      el.style.height = "auto";
      const min = minRows * LINE_HEIGHT + VERTICAL_PADDING;
      const max = maxRows * LINE_HEIGHT + VERTICAL_PADDING;
      const next = Math.min(Math.max(el.scrollHeight, min), max);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    },
    [minRows, maxRows]
  );

  useLayoutEffect(() => {
    autoSize(inlineRef.current);
  }, [text, autoSize, wrap]);

  useEffect(() => {
    if (!copied) return undefined;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  const emit = useCallback(
    (next) => {
      if (typeof onChange === "function") onChange(next);
    },
    [onChange]
  );

  const handleChange = useCallback(
    (event) => {
      autoSize(event.target);
      emit(event.target.value);
    },
    [autoSize, emit]
  );

  /** Tab should indent, not tab out of a code editor. */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key !== "Tab" || event.shiftKey) return;
      event.preventDefault();
      const el = event.target;
      const { selectionStart, selectionEnd } = el;
      const next = `${text.slice(0, selectionStart)}  ${text.slice(selectionEnd)}`;
      emit(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 2;
      });
    },
    [text, emit]
  );

  const handleBeautify = useCallback(() => {
    try {
      emit(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      /* invalid JSON – the inline error banner already explains why */
    }
  }, [text, emit]);

  const handleCopy = useCallback(() => {
    try {
      navigator.clipboard?.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard unavailable (insecure context) – silently ignore */
    }
  }, [text]);

  const toolbar = (inModal) => (
    <div className="flex items-center gap-1">
      {isJsonMode && (
        <Tooltip title="Beautify JSON" placement="top" arrow>
          <span>
            <button
              type="button"
              onClick={handleBeautify}
              disabled={disabled || Boolean(jsonError)}
              className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Braces size={13} />
            </button>
          </span>
        </Tooltip>
      )}

      <Tooltip title={wrap ? "Disable soft wrap" : "Enable soft wrap"} placement="top" arrow>
        <button
          type="button"
          onClick={() => setWrap((w) => !w)}
          className={`h-6 w-6 rounded-md flex items-center justify-center transition-colors ${
            wrap
              ? "text-indigo-600 bg-indigo-50"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          }`}
        >
          <WrapText size={13} />
        </button>
      </Tooltip>

      <Tooltip title={copied ? "Copied" : "Copy content"} placement="top" arrow>
        <button
          type="button"
          onClick={handleCopy}
          className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>
      </Tooltip>

      <Tooltip title={inModal ? "Exit full screen" : "Expand editor"} placement="top" arrow>
        <button
          type="button"
          onClick={() => setExpanded(!inModal)}
          className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {inModal ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </Tooltip>
    </div>
  );

  const statusBar = (
    <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-400">
      <span>{stats.lines} ln</span>
      <span className="text-slate-300">•</span>
      <span>{stats.chars} ch</span>
      {isJsonMode && !isTemplateRef(text) && (
        <>
          <span className="text-slate-300">•</span>
          <span className={jsonError ? "text-red-500" : "text-emerald-600"}>
            {jsonError ? "invalid json" : "valid json"}
          </span>
        </>
      )}
    </div>
  );

  // In compact mode the chrome only appears when it is actually useful.
  const isLargeValue = stats.lines > 1 || stats.chars > 60;
  const showChrome = !compact || focused || hovered || isLargeValue;

  const textareaClasses = `w-full resize-none bg-transparent px-3 py-2.5 text-[12.5px] leading-5 font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none ${
    wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
  }`;

  return (
    <div
      className={`w-full min-w-0 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`rounded-lg border bg-white transition-colors focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-500/15 ${
          error || jsonError ? "border-red-300" : "border-slate-200"
        }`}
      >
        {/* Utility bar keeps controls out of the text area itself */}
        {showChrome && (
          <div className="flex items-center justify-between gap-2 px-2 py-1 border-b border-slate-100 bg-slate-50/70 rounded-t-lg">
            {statusBar}
            {toolbar(false)}
          </div>
        )}

        <textarea
          ref={inlineRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          spellCheck={false}
          wrap={wrap ? "soft" : "off"}
          rows={minRows}
          className={textareaClasses}
        />
      </div>

      {(error || jsonError) && (
        <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-red-600">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span className="break-words">{error || `Invalid JSON: ${jsonError}`}</span>
        </div>
      )}

      {/* Full-screen editing surface for very large payloads */}
      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.3)",
            overflow: "hidden",
            height: "82vh",
          },
        }}
      >
        <div className="flex h-full flex-col bg-white">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50/70">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{title}</p>
              <div className="mt-0.5">{statusBar}</div>
            </div>
            <div className="flex items-center gap-1">
              {toolbar(true)}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close editor"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <textarea
            ref={modalRef}
            value={text}
            onChange={(event) => emit(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            spellCheck={false}
            wrap={wrap ? "soft" : "off"}
            autoFocus
            className={`flex-1 w-full resize-none bg-white px-4 py-3 text-[13px] leading-6 font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none ${
              wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
            }`}
          />

          {(error || jsonError) && (
            <div className="flex items-start gap-1.5 px-4 py-2 border-t border-red-100 bg-red-50 text-[11.5px] text-red-600">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span className="break-words">{error || `Invalid JSON: ${jsonError}`}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-slate-200 bg-slate-50/70">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ExpandableTextInput;
