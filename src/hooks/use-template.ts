'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  extractVariables,
  fillTemplate,
  validateVariableValues,
  getDefaultValues,
  hasVariables,
  syncVariablesWithContent,
} from '@/lib/utils/template-parser';
import type { Prompt, PromptVariable, VariableValues } from '@/types';

const STORAGE_KEY = 'promptvault_template_values';

interface StoredValues {
  [promptId: string]: VariableValues;
}

// Load stored values from localStorage
function loadStoredValues(): StoredValues {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save values to localStorage
function saveStoredValues(values: StoredValues): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Ignore storage errors
  }
}

export function useTemplate(prompt: Prompt | null) {
  const [values, setValues] = useState<VariableValues>({});

  // Check if prompt has variables
  const isTemplate = useMemo(() => {
    if (!prompt) return false;
    return hasVariables(prompt.content);
  }, [prompt]);

  // Get variables from prompt content
  const detectedVariables = useMemo(() => {
    if (!prompt) return [];
    return extractVariables(prompt.content);
  }, [prompt]);

  // Get variable definitions (with metadata)
  const variables = useMemo(() => {
    if (!prompt) return [];
    return prompt.variables || syncVariablesWithContent(prompt.content, []);
  }, [prompt]);

  // Load stored values when prompt changes
  useEffect(() => {
    if (!prompt?.id) return;

    const stored = loadStoredValues();
    const promptValues = stored[prompt.id] || {};
    const defaults = getDefaultValues(variables);

    setValues({ ...defaults, ...promptValues });
  }, [prompt?.id, variables]);

  // Update a single value
  const setValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Update multiple values
  const setMultipleValues = useCallback((newValues: VariableValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Reset to default values
  const resetValues = useCallback(() => {
    const defaults = getDefaultValues(variables);
    setValues(defaults);
  }, [variables]);

  // Clear all values
  const clearValues = useCallback(() => {
    setValues({});
  }, []);

  // Save current values to localStorage
  const saveValues = useCallback(() => {
    if (!prompt?.id) return;

    const stored = loadStoredValues();
    stored[prompt.id] = values;
    saveStoredValues(stored);
  }, [prompt?.id, values]);

  // Generate filled content
  const filledContent = useMemo(() => {
    if (!prompt) return '';
    return fillTemplate(prompt.content, values);
  }, [prompt, values]);

  // Validate current values
  const validation = useMemo(() => {
    return validateVariableValues(variables, values);
  }, [variables, values]);

  // Check if all required fields are filled
  const isComplete = validation.valid;

  // Get unfilled variables
  const unfilledVariables = useMemo(() => {
    return variables.filter((v) => {
      const value = values[v.name];
      return value === undefined || value === null || value === '';
    });
  }, [variables, values]);

  return {
    isTemplate,
    variables,
    detectedVariables,
    values,
    setValue,
    setMultipleValues,
    resetValues,
    clearValues,
    saveValues,
    filledContent,
    validation,
    isComplete,
    unfilledVariables,
  };
}

// Hook for detecting variables in content (for form use)
export function useVariableDetection(content: string) {
  const detectedVariables = useMemo(() => {
    return extractVariables(content);
  }, [content]);

  const hasVars = useMemo(() => {
    return hasVariables(content);
  }, [content]);

  const variableCount = detectedVariables.length;

  return {
    detectedVariables,
    hasVariables: hasVars,
    variableCount,
  };
}
