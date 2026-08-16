import { useEffect, useState } from "react";
import { X, Settings, Mic, Volume2, MessageCircle } from "lucide-react";

const selectClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12.5px] text-slate-800 outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-200";

const Field = ({ icon: Icon, label, hint, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="mb-2 flex items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 border border-slate-200">
        <Icon size={14} />
      </div>
      <div>
        <label className="text-[12px] font-semibold text-slate-800">{label}</label>
        {hint && <p className="mt-0.5 text-[10.5px] leading-snug text-slate-400">{hint}</p>}
      </div>
    </div>
    {children}
  </div>
);

const VoiceConfigModal = ({ isOpen, onClose, config, onSave }) => {
  const [tempConfig, setTempConfig] = useState(config);

  useEffect(() => {
    if (isOpen) setTempConfig(config);
  }, [isOpen, config]);

  if (!isOpen) return null;

  const ttsProviders = ["piper", "openai", "elevenlabs", "wellsaid"];
  const sttProviders = ["whisper", "google", "deepgram", "assemblyai"];
  const modes = [
    { value: "voice_in_text_out", label: "Voice In, Text Out" },
    { value: "text_in_voice_out", label: "Text In, Voice Out" },
    { value: "voice_in_voice_out", label: "Voice In, Voice Out" },
    { value: "text", label: "Plain Text (No Voice)" },
  ];

  const handleChange = (field, value) => {
    setTempConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.65)]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Settings size={17} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Voice Configuration</h3>
              <p className="mt-0.5 text-[11.5px] text-slate-400">Configure speech input and response playback for this flow.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 bg-slate-50/50 p-5">
          <Field icon={Volume2} label="TTS Provider" hint="Converts text responses into spoken audio.">
            <select value={tempConfig.tts_provider} onChange={(e) => handleChange("tts_provider", e.target.value)} className={selectClass}>
              {ttsProviders.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </Field>

          <Field icon={Mic} label="STT Provider" hint="Converts user voice input into text.">
            <select value={tempConfig.stt_provider} onChange={(e) => handleChange("stt_provider", e.target.value)} className={selectClass}>
              {sttProviders.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </Field>

          <Field icon={MessageCircle} label="Interaction Mode" hint="Choose how users interact with the agent.">
            <select value={tempConfig.mode} onChange={(e) => handleChange("mode", e.target.value)} className={selectClass}>
              {modes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3.5">
          <button onClick={onClose} className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={() => { onSave(tempConfig); onClose(); }} className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceConfigModal;
