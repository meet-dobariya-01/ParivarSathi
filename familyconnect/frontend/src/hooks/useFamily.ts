import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export type FamilyMember = {
  _id?: string;
  person?: {
    _id?: string;
    name?: string;
    gender?: string;
    mobile?: string;
    occupation?: string;
    education?: string;
    dateOfBirth?: string;
  };
  relationship?: string;
  isHead?: boolean;
  status?: string;
};

export type FamilyRecord = {
  _id?: string;
  familyId?: string;
  familyHeadPersonId?: {
    _id?: string;
    name?: string;
  };
  annualIncome?: number;
  address?: string;
  district?: string;
  taluka?: string;
  village?: string;
  members?: FamilyMember[];
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

export const useFamily = () => {
  const [family, setFamily] = useState<FamilyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/families/me");
      setFamily(data || null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setFamily(null);
        return;
      }

      setError(getErrorMessage(err));
      setFamily(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = async (payload: Record<string, unknown>) => {
    const { data } = await api.post("/families", payload);
    setFamily(data);
    return data;
  };

  const update = async (payload: Record<string, unknown>) => {
    const familyId = family?.familyId;
    if (!familyId) {
      throw new Error("No family found to update.");
    }

    const { data } = await api.put(`/families/${familyId}`, payload);
    setFamily(data);
    return data;
  };

  const addMember = async (payload: Record<string, unknown>) => {
    const familyId = family?.familyId;
    if (!familyId) {
      throw new Error("No family found to add a member.");
    }

    const { data } = await api.post(`/families/${familyId}/members`, payload);
    await refresh();
    return data;
  };

  const updateMember = async (memberId: string, payload: Record<string, unknown>) => {
    const familyId = family?.familyId;
    if (!familyId) {
      throw new Error("No family found to update a member.");
    }

    const { data } = await api.put(`/families/${familyId}/members/${memberId}`, payload);
    await refresh();
    return data;
  };

  const deactivateMember = async (memberId: string) => {
    const familyId = family?.familyId;
    if (!familyId) {
      throw new Error("No family found to deactivate a member.");
    }

    const { data } = await api.delete(`/families/${familyId}/members/${memberId}`);
    await refresh();
    return data;
  };

  return { family, loading, error, refresh, create, update, addMember, updateMember, deactivateMember };
};
