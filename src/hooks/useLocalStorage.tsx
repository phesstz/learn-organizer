
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Tenta obter do localStorage
      const item = window.localStorage.getItem(key);
      // Analisa o JSON armazenado ou retorna initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se erro, retorna initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Função para atualizar localStorage e estado
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que value seja uma função
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Salva no estado
      setStoredValue(valueToStore);
      // Salva no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
