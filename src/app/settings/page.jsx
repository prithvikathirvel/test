"use client";

import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import {
  Settings,
  Key,
  Cpu,
  Users,
  Copy,
  Check,
  Plus,
  RefreshCw
} from "lucide-react";
import InputBox from "@/components/Common/InputBox";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey, setApiKey] = useState("aurora_live_99a8b1c4e7f3400d8b671a92e10a24b5");
  const [workspaceName, setWorkspaceName] = useState("Sify Aurora Workspace");
  const [orgId, setOrgId] = useState("org-8832a-prod");
  const [webhookUrl, setWebhookUrl] = useState("https://api.sify.com/v1/aurora/webhooks");

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    setApiKey(`aurora_live_${randomHex}a92e10a24b5`);
  };

  return (
    <Box className="min-h-screen bg-[#fafafa] px-6 py-8">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/80">
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
          Settings
        </h1>

        <button
          onClick={() => alert("Saved")}
          className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors"
        >
          Save changes
        </button>
      </div>

      {/* Minimal Tabs */}
      <Box className="border-b border-zinc-200 mb-8">
        <Tabs
          value={activeTab}
          onChange={(_, newVal) => setActiveTab(newVal)}
          TabIndicatorProps={{ style: { backgroundColor: "#18181b", height: "2px" } }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 500,
              color: "#71717a",
              minHeight: "40px",
              "&.Mui-selected": { color: "#18181b", fontWeight: 600 },
            },
          }}
        >
          <Tab icon={<Settings size={14} className="mr-1.5" />} iconPosition="start" label="General" />
          <Tab icon={<Key size={14} className="mr-1.5" />} iconPosition="start" label="API keys" />
          <Tab icon={<Cpu size={14} className="mr-1.5" />} iconPosition="start" label="Models" />
          <Tab icon={<Users size={14} className="mr-1.5" />} iconPosition="start" label="Team" />
        </Tabs>
      </Box>

      {/* Tab 0: General */}
      {activeTab === 0 && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">
              Workspace details
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Configure your organization name and region.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Workspace name
                </label>
                <InputBox
                  isShowLabel={false}
                  value={workspaceName}
                  onChange={setWorkspaceName}
                  height="38px"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Organization ID
                </label>
                <InputBox
                  isShowLabel={false}
                  value={orgId}
                  onChange={setOrgId}
                  height="38px"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: API keys */}
      {activeTab === 1 && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  API key
                </h3>
                <p className="text-xs text-zinc-500">
                  Use this key to run workflows from your backend.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors"
              >
                <RefreshCw size={12} />
                <span>Reset key</span>
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-zinc-800 truncate">
                {apiKey}
              </span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors shrink-0"
              >
                {copiedKey ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">
              Webhook URL
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Send workflow outputs to this URL.
            </p>
            <InputBox
              isShowLabel={false}
              value={webhookUrl}
              onChange={setWebhookUrl}
              height="38px"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Models */}
      {activeTab === 2 && (
        <div className="max-w-2xl space-y-4">
          {[
            { name: "OpenAI", model: "gpt-4o", status: "Connected" },
            { name: "Anthropic", model: "claude-3-7-sonnet", status: "Connected" },
            { name: "Google Gemini", model: "gemini-2.0-pro", status: "Connected" },
            { name: "Local Voice (Piper/Whisper)", model: "piper-v1 / whisper-v3", status: "Active" },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900">{m.name}</div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">{m.model}</div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Team */}
      {activeTab === 3 && (
        <div className="max-w-2xl bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900">Members</span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
            >
              <Plus size={13} />
              <span>Invite</span>
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {[
              { name: "Prithvi Kathirvel", email: "prithvi@sify.com", role: "Admin" },
              { name: "Demo User", email: "demo@sify.com", role: "Developer" },
            ].map((user, idx) => (
              <div key={idx} className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-900">{user.name}</div>
                  <div className="text-xs text-zinc-500">{user.email}</div>
                </div>
                <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Box>
  );
}
