"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface WelcomeContextType {
  showWelcome: boolean;
  userInfo: {
    username?: string;
    email?: string;
  };
  setWelcomeInfo: (show: boolean, username?: string, email?: string) => void;
  dismissWelcome: () => void;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

export function WelcomeProvider({ children }: { children: ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string }>({});

  const setWelcomeInfo = (show: boolean, username?: string, email?: string) => {
    setShowWelcome(show);
    setUserInfo({ username, email });
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <WelcomeContext.Provider value={{ showWelcome, userInfo, setWelcomeInfo, dismissWelcome }}>
      {children}
    </WelcomeContext.Provider>
  );
}

export function useWelcome() {
  const context = useContext(WelcomeContext);
  if (context === undefined) {
    throw new Error("useWelcome must be used within a WelcomeProvider");
  }
  return context;
}
