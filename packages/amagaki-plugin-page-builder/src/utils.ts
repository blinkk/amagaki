import nunjucks from 'nunjucks';

const SafeString = nunjucks.runtime.SafeString;

// @ts-ignore `escape` type not defined on `nunjucks.lib`.
const escape = nunjucks.lib.escape;

/** Template tag function for escaping values used with Nunjucks templates. */
export const html = (literals: TemplateStringsArray, ...substitutions: unknown[]) => {
  const result = [];
  for (const [i, value] of substitutions.entries()) {
    result.push(literals[i]);
    // Avoid double-escaping when using ternary or nested expressions.
    result.push(value instanceof SafeString ? value : escape((value as string).toString()));
  }
  result.push(literals[literals.length - 1]);
  return safeString(result.join('').trim());
};

/** Wrapper for returning a Nunjucks `SafeString`. */
export const safeString = (value: string) => {
  return new SafeString(value);
};
