declare module 'magicmouse.js' {
  export type MagicMouseOptions = {
    outerWidth?: number;
    outerHeight?: number;
    outerStyle?: 'circle' | 'square' | 'diamond' | 'disable';
    hoverEffect?: 'circle-move' | 'pointer-blur' | 'pointer-overlay';
    hoverItemMove?: boolean;
    defaultCursor?: boolean;
  };

  export function magicMouse(options?: MagicMouseOptions): void;
  const defaultExport: unknown;
  export default defaultExport;
}
