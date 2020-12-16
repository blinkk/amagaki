export const MIN_NODE_VERSION = 10;

export function isNodeVersionSupported(): boolean {
  const version = Number(process.version.slice(1).split('.')[0]);
  if (version < MIN_NODE_VERSION) {
    console.error(
      `Amagaki requires Node.js 10.x or higher. You are currently running ${process.version}, which is not supported.`
    );
    return false;
  }
  return true;
}
