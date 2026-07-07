import { JSX as JSX_2 } from 'react/jsx-runtime';

export declare function HandoffContextBar({ storage, endpoint, storageKey }?: HandoffContextBarProps): JSX_2.Element;

export declare type HandoffContextBarProps = UseAnnotationsOptions;

export declare interface Pin {
    id: string;
    selector: string;
    offsetXPercent: number;
    offsetYPercent: number;
    note: string;
    createdAt: string;
}

export declare type StorageMode = 'auto' | 'local' | 'file';

export declare interface UseAnnotationsOptions {
    /** Persistence mode. 'auto' (default) uses the dev-server file endpoint when present, else localStorage. */
    storage?: StorageMode;
    /** Dev-server endpoint served by the optional Vite plugin. */
    endpoint?: string;
    /** localStorage key used by the local adapter. */
    storageKey?: string;
}

export { }
