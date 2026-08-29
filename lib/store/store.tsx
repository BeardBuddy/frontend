"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initExtents } from "./extentsInit";
import { ApiPayload } from "../../business-objects/ApiPayload";
import { initGraph } from "./graphInit";
import { apiUrl } from "../apiBase";

interface MemoryContextProps {
  revision: number;
  triggerUpdate: () => void;
  revalidate: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const MemoryContext = createContext<MemoryContextProps | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [revision, setRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const triggerUpdate = useCallback(() => {
    setRevision(prev => prev + 1);
  }, []);

  const revalidate = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(apiUrl("/api/data"));
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      const payload: ApiPayload = await response.json();
      initExtents(payload);
      initGraph(payload.appointmentExtras ?? {});
      setRevision(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    revalidate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MemoryContext.Provider value={{ revision, triggerUpdate, revalidate, isLoading, error }}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = (): MemoryContextProps => {
  const context = useContext(MemoryContext);
  if (!context) throw new Error("useMemory must be used inside MemoryProvider");
  return context;
};
