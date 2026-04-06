import { useState } from "react"
import { X, Settings } from "lucide-react"

const VoiceConfigModal = ({ isOpen, onClose, config, onSave }) => {
  const [tempConfig, setTempConfig] = useState(config);

  if (!isOpen) return null;

  const ttsProviders = ["piper", "openai", "elevenlabs", "wellsaid"];
  const sttProviders = ["whisper", "google", "deepgram", "assemblyai"];
  const modes = [
    { value: "voice_in_text_out", label: "Voice In, Text Out" },
    { value: "text_in_voice_out", label: "Text In, Voice Out" },
    { value: "voice_in_voice_out", label: "Voice In, Voice Out" },
    { value: "text", label: "Plain Text (No Voice)" }
  ];  

  const handleChange = (field, value) => {
    setTempConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Voice Configuration
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TTS Provider</label>
            <select
              value={tempConfig.tts_provider}
              onChange={(e) => handleChange('tts_provider', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 transition-all"
            >
              {ttsProviders.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">STT Provider</label>
            <select
              value={tempConfig.stt_provider}
              onChange={(e) => handleChange('stt_provider', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 transition-all"
            >
              {sttProviders.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interaction Mode</label>
            <select
              value={tempConfig.mode}
              onChange={(e) => handleChange('mode', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 transition-all"
            >
              {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(tempConfig); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceConfigModal;
