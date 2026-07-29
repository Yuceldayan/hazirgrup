import { useCallback, useEffect, useState } from 'react';
import { userMessageOf } from '@hazirgrup/core';

/**
 * Veri yükleme kancası.
 *
 * Her ekranda loading / error / empty / ready hallerinin tutarlı yönetilmesini
 * sağlar (docs/DESIGN_SYSTEM.md §7). Hata mesajı her zaman kullanıcı dostudur.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
): {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(userMessageOf(cause));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
     
  }, [...deps, nonce]);

  return { data, error, isLoading, reload };
}
