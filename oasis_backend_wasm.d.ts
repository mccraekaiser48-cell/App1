/* tslint:disable */
/* eslint-disable */

/**
 * OASIS_OS instance for the browser.
 *
 * Create with `OasisWasm::new("canvas_id")`, then call `tick()` from
 * `requestAnimationFrame`.
 */
export class OasisWasm {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Add a file to the in-memory VFS.
     */
    add_vfs_file(path: string, data: Uint8Array): void;
    /**
     * Launch an app by title (e.g. "TV Guide", "Browser", "File Manager";
     * ASCII case-insensitive): any registered app, with or without a
     * dashboard tile, or the Browser.
     */
    launch_app(title: string): void;
    /**
     * Create a new OASIS_OS instance attached to a canvas element.
     *
     * `canvas_id` is the DOM `id` of the target `<canvas>`.
     * `skin_name` is an optional built-in skin name (e.g. "classic", "modern").
     */
    constructor(canvas_id: string, skin_name?: string | null);
    /**
     * Read the current framebuffer as RGBA pixel data.
     *
     * Returns a flat `Vec<u8>` of length `width * height * 4` in RGBA order.
     * Useful for screenshot capture from JavaScript (e.g. Playwright tests).
     */
    read_pixels(): Uint8Array;
    /**
     * Get the current screen height.
     */
    screen_height(): number;
    /**
     * Get the current screen width.
     */
    screen_width(): number;
    /**
     * Execute a terminal command and return the output.
     *
     * Also pushes output to the in-canvas terminal display.
     */
    send_command(cmd: string): string;
    /**
     * Advance the OS state by one frame.
     *
     * Call this from `requestAnimationFrame`. Processes input events,
     * updates the scene graph, and renders to the canvas.
     */
    tick(delta_seconds: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_oasiswasm_free: (a: number, b: number) => void;
    readonly oasiswasm_add_vfs_file: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly oasiswasm_launch_app: (a: number, b: number, c: number) => void;
    readonly oasiswasm_new: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly oasiswasm_read_pixels: (a: number, b: number) => void;
    readonly oasiswasm_screen_height: (a: number) => number;
    readonly oasiswasm_screen_width: (a: number) => number;
    readonly oasiswasm_send_command: (a: number, b: number, c: number, d: number) => void;
    readonly oasiswasm_tick: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_322: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_2714: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_2716: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_5875: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_329: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_331: (a: number, b: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number) => void;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
