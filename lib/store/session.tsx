"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import type { CustomerDto } from "../api/types";

interface SessionContextProps {
  customer: CustomerDto | null;
  error: string | null;
  revision: number;
  refresh: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision(prev => prev + 1), []);

  useEffect(() => {
    let cancelled = false;

    api
      .getCurrentCustomer()
      .then(loaded => {
        if (!cancelled) setCustomer(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to reach the server");
      });

    return () => {
      cancelled = true;
    };
  }, [revision]);

  return (
    <SessionContext.Provider value={{ customer, error, revision, refresh }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
};
