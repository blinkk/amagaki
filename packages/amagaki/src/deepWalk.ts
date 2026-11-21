/**
 * Recursively walks plain objects and arrays, transforming values via `callback`.
 * Class instances and functions are passed directly to `callback` without recursing
 * into their properties.
 */
export class DeepWalk {
  async walk(
    value: any,
    callback: (value: any) => Promise<any> | any
  ): Promise<any> {
    if (Array.isArray(value)) {
      const out = new Array(value.length);
      for (let i = 0; i < value.length; i++) {
        out[i] = await this.walk(value[i], callback);
      }
      return out;
    }
    if (
      value !== null &&
      typeof value === 'object' &&
      (value.constructor === Object || Object.getPrototypeOf(value) === null)
    ) {
      const out: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        out[key] = await this.walk(value[key], callback);
      }
      return out;
    }
    return await callback(value);
  }
}
