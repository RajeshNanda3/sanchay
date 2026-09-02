import { useState, useRef, useCallback, useEffect } from "react";
import api from "../apiInterceptor";

const CACHE_TTL_MS = 30_000;
const cache = new Map();

const getCacheKey = ({ location, filters, page, limit, radiusKm, useLocationScope }) => {
  const parts = [];
  if (useLocationScope && location?.latitude != null && location?.longitude != null) {
    parts.push(
      `loc:${location.latitude.toFixed(4)},${location.longitude.toFixed(4)},${location.radiusKm ?? 2}`,
    );
  }
  const filterKeys = Object.keys(filters || {}).sort();
  for (const key of filterKeys) {
    const value = filters[key];
    if (value !== null && value !== undefined && value.toString().trim() !== "") {
      parts.push(`${key}:${String(value).trim().toLowerCase()}`);
    }
  }
  parts.push(`p:${page}`);
  parts.push(`l:${limit}`);
  parts.push(`r:${radiusKm ?? 2}`);
  return parts.join("|");
};

export const useVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchVendors = useCallback(
    async ({
      location = null,
      filters = {},
      page = 1,
      limit = 50,
      radiusKm = 2,
      useLocationScope = false,
      signal,
    } = {}) => {
      const normalizedFilters = Object.fromEntries(
        Object.entries(filters || {}).filter(([, value]) => {
          if (value === null || value === undefined) return false;
          return value.toString().trim() !== "";
        }),
      );

      const params = {
        ...normalizedFilters,
        page,
        limit,
        radiusKm,
      };

      if (useLocationScope && location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
        params.radiusKm = 2;
      }

      const { data } = await api.get("/api/v1/users/vendors", { params, signal });
      return data.vendors || [];
    },
    [],
  );

  const refetch = useCallback(
    async ({
      location = null,
      filters = {},
      page = 1,
      limit = 50,
      radiusKm = 2,
      useLocationScope = false,
    } = {}) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const cacheKey = getCacheKey({
        location,
        filters,
        page,
        limit,
        radiusKm,
        useLocationScope,
      });
      const cached = cache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        setVendors(cached.data);
        setError(null);
        if (now - cached.timestamp > CACHE_TTL_MS / 2) {
          fetchVendors({
            location,
            filters,
            page,
            limit,
            radiusKm,
            useLocationScope,
            signal: controller.signal,
          }).then((data) => {
            if (mountedRef.current && !controller.signal.aborted) {
              cache.set(cacheKey, { data, timestamp: Date.now() });
              setVendors(data);
            }
          }).catch(() => {});
        }
        return;
      }

      try {
        setLoading(true);
        const data = await fetchVendors({
          location,
          filters,
          page,
          limit,
          radiusKm,
          useLocationScope,
          signal: controller.signal,
        });
        if (mountedRef.current && !controller.signal.aborted) {
          cache.set(cacheKey, { data, timestamp: Date.now() });
          setVendors(data);
          setError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted && mountedRef.current) {
          setError(err.message || "Failed to fetch vendors");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchVendors],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { vendors, loading, error, refetch };
};
