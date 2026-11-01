/** Where uploaded files live. Local disk today; an object-storage/CDN adapter can replace it later. */
export interface IMediaStorage {
  /** Stores the bytes and returns the public URL path clients should use. */
  save(folder: string, fileName: string, content: Buffer): Promise<string>;
}
