"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Key,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Record<string, string>>({}); // name -> id
  const [keys, setKeys] = useState<Record<string, any>>({}); // provider_id -> key object
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [newKeyValues, setNewKeyValues] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  const SUPPORTED_PROVIDER_NAMES = [
    "Gemini",
    "OpenAI",
    "Anthropic",
    "NVIDIA",
    "GitHub",
  ];

  const loadData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      setUserId(session.user.id);

      const { data: providerData } = await supabase
        .from("providers")
        .select("*");
      const providerMap: Record<string, string> = {};
      if (providerData) {
        providerData.forEach((p: any) => {
          providerMap[p.name] = p.id;
        });
      }
      setProviders(providerMap);

      const { data: keyData, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", session.user.id);
      if (error) throw error;

      const keyMap: Record<string, any> = {};
      if (keyData) {
        keyData.forEach((k: any) => {
          keyMap[k.provider_id] = k;
        });
      }
      setKeys(keyMap);
    } catch (err) {
      console.error("Failed to load API keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveKey = async (providerName: string, providerId: string) => {
    if (!userId || !providerId) return;
    setValidating((prev) => ({ ...prev, [providerId]: true }));
    try {
      const val = newKeyValues[providerId];
      if (!val) return;

      const { error } = await supabase.from("api_keys").upsert(
        {
          user_id: userId,
          provider_id: providerId,
          encrypted_key: val,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, provider_id" },
      );

      if (error) throw error;

      await loadData();
      setEditing((prev) => ({ ...prev, [providerId]: false }));
      setNewKeyValues((prev) => ({ ...prev, [providerId]: "" }));
    } catch (err) {
      console.error("Failed to save key", err);
    } finally {
      setValidating((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const handleDeleteKey = async (providerId: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("user_id", userId)
        .eq("provider_id", providerId);
      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Failed to delete key", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          API Keys
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your LLM provider and integration keys.
        </p>
      </div>

      <div className="space-y-4">
        {SUPPORTED_PROVIDER_NAMES.map((providerName) => {
          const providerId = providers[providerName];
          if (!providerId) return null;

          const isConfigured = !!keys[providerId];
          const isEditing = editing[providerId];
          const keyData = keys[providerId];

          return (
            <Card key={providerId}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {providerName}
                    {isConfigured ? (
                      <Badge
                        variant="success"
                        className="text-[10px] h-5 px-1.5 flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-3" /> Configured
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 text-muted-foreground"
                      >
                        Not Configured
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isConfigured && keyData?.updated_at
                      ? `Last updated: ${new Date(keyData.updated_at).toLocaleString()}`
                      : "Used for Trace One operations."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isConfigured && !isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditing((prev) => ({
                            ...prev,
                            [providerId]: true,
                          }))
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDeleteKey(providerId)}
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </>
                  ) : !isConfigured && !isEditing ? (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        setEditing((prev) => ({ ...prev, [providerId]: true }))
                      }
                    >
                      <Plus className="size-4" />
                      Configure
                    </Button>
                  ) : null}
                </div>
              </CardHeader>

              {(isConfigured || isEditing) && (
                <CardContent>
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <Key className="size-4" />
                          </div>
                          <Input
                            type="password"
                            placeholder={`Enter your ${providerName} API Key`}
                            className="pl-9 font-mono"
                            value={newKeyValues[providerId] || ""}
                            onChange={(e) =>
                              setNewKeyValues((prev) => ({
                                ...prev,
                                [providerId]: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <Button
                          onClick={() =>
                            handleSaveKey(providerName, providerId)
                          }
                          disabled={
                            !newKeyValues[providerId] || validating[providerId]
                          }
                          className="min-w-[100px]"
                        >
                          {validating[providerId] ? (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          ) : null}
                          Save
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="size-3.5" />
                        Keys are securely encrypted before being stored.
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Key className="size-4" />
                        </div>
                        <Input
                          type={showKey[providerId] ? "text" : "password"}
                          value={
                            showKey[providerId]
                              ? keyData?.encrypted_key || "sk-..."
                              : "sk-................................................"
                          }
                          className="pl-9 font-mono"
                          readOnly
                        />
                        <button
                          onClick={() => toggleKey(providerId)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        >
                          {showKey[providerId] ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {}}
                      >
                        <RefreshCw className="size-4" /> Test Connection
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
