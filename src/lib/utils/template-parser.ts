import type { PromptVariable, VariableValues } from '@/types';

// Regex to match {{variable_name}}
const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

/**
 * Extract variable names from template content
 */
export function extractVariables(content: string): string[] {
  const matches = content.match(VARIABLE_REGEX);
  if (!matches) return [];

  // Extract unique variable names
  const variables = new Set<string>();
  for (const match of matches) {
    const name = match.slice(2, -2); // Remove {{ and }}
    variables.add(name);
  }

  return Array.from(variables);
}

/**
 * Check if content has any variables
 */
export function hasVariables(content: string): boolean {
  return VARIABLE_REGEX.test(content);
}

/**
 * Count number of variables in content
 */
export function countVariables(content: string): number {
  return extractVariables(content).length;
}

/**
 * Fill template with variable values
 */
export function fillTemplate(content: string, values: VariableValues): string {
  return content.replace(VARIABLE_REGEX, (match, variableName) => {
    if (variableName in values) {
      return String(values[variableName]);
    }
    return match; // Keep original if no value provided
  });
}

/**
 * Create PromptVariable objects from detected variable names
 */
export function createVariablesFromNames(
  names: string[],
  existingVariables?: PromptVariable[]
): PromptVariable[] {
  return names.map((name) => {
    // Check if there's an existing variable with this name
    const existing = existingVariables?.find((v) => v.name === name);
    if (existing) {
      return existing;
    }

    // Create new variable with defaults
    return {
      name,
      description: '',
      defaultValue: '',
      placeholder: `Enter ${name.replace(/_/g, ' ')}...`,
      required: false,
    };
  });
}

/**
 * Sync variables with content - add new, keep existing, remove unused
 */
export function syncVariablesWithContent(
  content: string,
  existingVariables: PromptVariable[]
): PromptVariable[] {
  const detectedNames = extractVariables(content);

  // Keep existing variables that are still in content
  const kept = existingVariables.filter((v) => detectedNames.includes(v.name));

  // Add new variables for names not in existing
  const existingNames = new Set(kept.map((v) => v.name));
  const newVars = detectedNames
    .filter((name) => !existingNames.has(name))
    .map((name) => ({
      name,
      description: '',
      defaultValue: '',
      placeholder: `Enter ${name.replace(/_/g, ' ')}...`,
      required: false,
    }));

  return [...kept, ...newVars];
}

/**
 * Validate that all required variables have values
 */
export function validateVariableValues(
  variables: PromptVariable[],
  values: VariableValues
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const variable of variables) {
    if (variable.required) {
      const value = values[variable.name];
      if (value === undefined || value === null || value === '') {
        missing.push(variable.name);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get default values object from variables
 */
export function getDefaultValues(variables: PromptVariable[]): VariableValues {
  const defaults: VariableValues = {};
  for (const variable of variables) {
    if (variable.defaultValue) {
      defaults[variable.name] = variable.defaultValue;
    }
  }
  return defaults;
}

/**
 * Highlight variables in content for display (returns HTML string)
 */
export function highlightVariables(content: string): string {
  return content.replace(
    VARIABLE_REGEX,
    '<span class="bg-primary/20 text-primary px-1 rounded">{{$1}}</span>'
  );
}

/**
 * Format variable name for display
 */
export function formatVariableName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}
