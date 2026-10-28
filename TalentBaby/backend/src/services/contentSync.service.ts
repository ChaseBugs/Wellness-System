import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { ContentSyncRepository, SyncTableDelta, SyncTableStatus } from '../repositories/contentSync.repository';

export interface AssetDelta {
  path: string;
  url: string;
  checksum: string;
  size: number;
  updatedAt: string;
}

export interface ContentManifest {
  contentVersion: string;
  assetVersion: string;
  serverTime: string;
  tables: SyncTableStatus[];
  assets: {
    count: number;
    totalBytes: number;
  };
  endpoints: {
    delta: string;
  };
}

export interface ContentDelta {
  fromVersion: string | null;
  fromAssetVersion: string | null;
  toVersion: string;
  toAssetVersion: string;
  serverTime: string;
  tables: SyncTableDelta[];
  assets: AssetDelta[];
}

export class ContentSyncService {
  private repository = new ContentSyncRepository();
  private publicImagesRoot = path.join(__dirname, '..', '..', 'public', 'images');

  async getManifest(): Promise<ContentManifest> {
    const tables = await this.repository.getTableStatuses();
    const assetStats = await this.getAssetStats();
    const contentVersion = this.maxIso(tables.map((table) => table.version));

    return {
      contentVersion,
      assetVersion: assetStats.version,
      serverTime: new Date().toISOString(),
      tables,
      assets: {
        count: assetStats.count,
        totalBytes: assetStats.totalBytes,
      },
      endpoints: {
        delta: '/api/v1/content-sync/delta',
      },
    };
  }

  async getDelta(
    since: Date | null,
    assetSince: Date | null,
    requestedTables?: string[],
    includeAssets = true
  ): Promise<ContentDelta> {
    const manifest = await this.getManifest();
    const tables = await this.repository.getTableDeltas(since, requestedTables);
    const assets = includeAssets ? await this.getChangedAssets(assetSince) : [];

    return {
      fromVersion: since ? since.toISOString() : null,
      fromAssetVersion: assetSince ? assetSince.toISOString() : null,
      toVersion: manifest.contentVersion,
      toAssetVersion: manifest.assetVersion,
      serverTime: new Date().toISOString(),
      tables,
      assets,
    };
  }

  parseSince(value: unknown): Date | null {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      const error = new Error('since must be an ISO timestamp');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }
    return date;
  }

  private async getAssetStats(): Promise<{ count: number; totalBytes: number; version: string }> {
    const files = await this.listImageFiles();
    let totalBytes = 0;
    let maxMtime = new Date(0);
    for (const file of files) {
      totalBytes += file.size;
      if (file.mtime > maxMtime) maxMtime = file.mtime;
    }
    return {
      count: files.length,
      totalBytes,
      version: maxMtime.toISOString(),
    };
  }

  private async getChangedAssets(since: Date | null): Promise<AssetDelta[]> {
    const files = await this.listImageFiles();
    const changed = since ? files.filter((file) => file.mtime > since) : files;
    const assets: AssetDelta[] = [];

    for (const file of changed) {
      const buffer = await fs.readFile(file.absolutePath);
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
      assets.push({
        path: file.relativePath,
        url: `/images/${file.relativePath.replace(/\\/g, '/')}`,
        checksum,
        size: file.size,
        updatedAt: file.mtime.toISOString(),
      });
    }

    return assets.sort((a, b) => a.path.localeCompare(b.path));
  }

  private async listImageFiles(): Promise<Array<{ absolutePath: string; relativePath: string; size: number; mtime: Date }>> {
    const files: Array<{ absolutePath: string; relativePath: string; size: number; mtime: Date }> = [];

    async function walk(root: string, current: string): Promise<void> {
      let entries;
      try {
        entries = await fs.readdir(current, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const absolutePath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          await walk(root, absolutePath);
          continue;
        }
        if (!/\.(png|jpe?g|webp)$/i.test(entry.name)) continue;

        const stat = await fs.stat(absolutePath);
        files.push({
          absolutePath,
          relativePath: path.relative(root, absolutePath).replace(/\\/g, '/'),
          size: stat.size,
          mtime: stat.mtime,
        });
      }
    }

    await walk(this.publicImagesRoot, this.publicImagesRoot);
    return files;
  }

  private maxIso(values: Array<string | null>): string {
    let max = new Date(0);
    for (const value of values) {
      if (!value) continue;
      const date = new Date(value);
      if (!Number.isNaN(date.getTime()) && date > max) max = date;
    }
    return max.toISOString();
  }
}
