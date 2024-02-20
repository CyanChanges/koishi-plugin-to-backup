import { Context, z } from 'koishi'
import { BackupService, Zip } from 'koishi-plugin-to-backup'
import { toDataURL } from "./utils";
import format from 'string-format'
import type {} from 'koishi-plugin-assets-local'
import type {} from '@koishijs/plugin-market'

declare module 'koishi-plugin-to-backup' {
  export namespace Backup {
    export interface Services {
      assets: AssetsBackupProvider
    }
  }
}

export class AssetsBackupProvider extends BackupService {
  static inject = [...BackupService.inject, 'assets']

  constructor(ctx: Context, private options: AssetsBackupProvider.Config) {
    super(ctx, 'assets', {});
  }

  private async createSafeData(zip: Zip) {
    const obj = Object.create(null)
    obj['date'] = new Date()
    const pkg = (await this.ctx.installer.getDeps())['koishi']
    obj['koishiVersion'] = pkg.resolved ?? 'unknown'
    return obj
  }

  async backup(zip: Zip): Promise<boolean> {
    await this.ctx.assets.upload(
      toDataURL(await zip.toBufferPromise()),
      format(this.options.filenameFormat, await this.createSafeData(zip))
    )
    return true
  }
}

export namespace AssetsBackupProvider {
  export interface Config {
    filenameFormat: string
  }

  export const Config: z<Config> = z.object({
    filenameFormat: z.string()
      .default("KoishiBackup-k{koishiVersion}-{date}.zip")
      .description("备份文件名")
  })
}

