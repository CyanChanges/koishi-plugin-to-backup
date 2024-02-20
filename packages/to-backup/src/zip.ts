export interface IZipEntry {
  /**
   * Represents the full name and path of the file
   */
  entryName: string;
  /**
   * Extra data associated with this entry.
   */
  extra?: Buffer;
  /**
   * Entry comment.
   */
  comment?: string;
  readonly name: string;
  /**
   * Read-Only property that indicates the type of the entry.
   */
  readonly isDirectory: boolean;
  attr: number;

  /**
   * Retrieve the compressed data for this entry. Note that this may trigger
   * compression if any properties were modified.
   */
  getCompressedData(): Buffer;

  /**
   * Asynchronously retrieve the compressed data for this entry. Note that
   * this may trigger compression if any properties were modified.
   */
  getCompressedDataAsync(callback: (data: Buffer) => void): void;

  /**
   * Set the (uncompressed) data to be associated with this entry.
   */
  setData(value: string | Buffer): void;

  /**
   * Get the decompressed data associated with this entry.
   */
  getData(): Buffer;

  /**
   * Asynchronously get the decompressed data associated with this entry.
   */
  getDataAsync(callback: (data: Buffer, err: string) => void): void;

  /**
   * Returns the CEN Entry Header to be written to the output zip file, plus
   * the extra data and the entry comment.
   */
  packHeader(): Buffer;

  /**
   * Returns a nicely formatted string with the most important properties of
   * the ZipEntry.
   */
  toString(): string;
}

export interface Zip {
  /**
   * Allows you to create a entry (file or directory) in the zip file.
   * If you want to create a directory, the `entryName` must end in `"/"` and a `null`
   * buffer should be provided.
   * @param entryName Entry path.
   * @param content Content to add to the entry; must be a 0-length buffer
   *   for a directory.
   */
  addFile(entryName: string, content: Buffer): void;

  /**
   * Returns an array of `IZipEntry` objects representing the files and folders
   * inside the archive.
   */
  getEntries(): IZipEntry[];

  /**
   * Returns a `IZipEntry` object representing the file or folder specified by `name`.
   * @param name Name of the file or folder to retrieve.
   * @return The entry corresponding to the `name`.
   */
  getEntry(name: string): IZipEntry | null;

  /**
   * Returns the number of entries in the ZIP
   * @return The amount of entries in the ZIP
   */
  getEntryCount(): number;

  toBuffer(): Buffer;

  /**
   * Asynchronously convert the promise to a Buffer
   */
  toBufferPromise(): Promise<Buffer>;

  /**
   * Writes the newly created zip file to disk at the specified location or
   * if a zip was opened and no `targetFileName` is provided, it will
   * overwrite the opened zip.
   */
  writeZip(targetFileName?: string, callback?: (error: Error | null) => void): void;
}
