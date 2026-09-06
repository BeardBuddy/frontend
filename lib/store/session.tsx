"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import type { CustomerDto } from "../api/types";

interface SessionContextProps {
  customer: CustomerDto | null;
  /** False until the first /customers/current probe settles, so we don't flash the login form. */
  resolved: boolean;
  signIn: (customer: CustomerDto) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // A valid cookie from a previous visit means we are already signed in.
    api
      .getCurrentCustomer()
      .then(loaded => {
        if (!cancelled) setCustomer(loaded);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      })
      .finally(() => {
        if (!cancelled) setResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = () => {
    api.logout().catch(() => undefined);
    setCustomer(null);
  };

  return (
    <SessionContext.Provider value={{ customer, resolved, signIn: setCustomer, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
};
