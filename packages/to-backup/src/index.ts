import { Context, z, Service, Dict, Awaitable } from 'koishi'
import { relative } from 'path'
import { readdir, lstat, readFile } from 'fs/promises'
import pMap from 'p-map'
import AdmZip from 'adm-zip'
import { BackupService } from "./service";
import { Zip } from "./zip";

export * from './service'
export * from './zip'

export const name = 'to-backup'

declare module 'koishi' {
  export interface Context {
    backup: Backup
  }

  export interface Events {
    'backup/before-backup'(root: string): Awaitable<boolean | void>

    'backup/add'(entry: string, file: string): Awaitable<void | boolean>
  }
}
type NestedServices = {
  [K in keyof Backup.Services as `backup.${K}`]: Backup.Services[K]
}

export class Backup extends Service {
  constructor(protected ctx: Context, protected options: Backup.Config) {
    super(ctx, 'backup', true);

  }

  async backup() {
    const AppDir = this.ctx.baseDir
    if (await this.ctx.serial("backup/before-backup", AppDir))
      return

    const zip = new AdmZip() as Zip
    await this.addFolder(zip, AppDir, AppDir)

    return await pMap(this.getBackupServices(), service => {
      return service.backup(zip)
    })
  }

  getBackupServices() {
    return Object.keys(this.ctx.root[Context.internal])
      .filter(name => name.startsWith('backup.'))
      .map(name => {
        const key = name.slice(7)
        const service = this.ctx.root.get(key)! as BackupService
        if (!service.ctx.scope.isActive) return
        return service
      })
      .filter(Boolean)
  }

  protected async addFolder(zip: Zip, root: string, folder?: string) {
    folder ??= root
    const files = await readdir(folder)
    await Promise.all(files.map(async (path: string) => {
      const entry = relative(root, path)
      if (await this.ctx.serial("backup/add", entry, path))
        return
      const stats = await lstat(path)
      if (stats.isFile()) return zip.addFile(entry, await readFile(path))
      return await this.addFolder(zip, root, path)
    }))
  }
}

export namespace Backup {
  export interface Config {
    allowBackup: boolean
    serialAdd: boolean
  }

  export const Config: z<Dict> = z.intersect([{
    allowBackup: z.boolean()
      .default(true)
      .description("允许备份"),
    serialAdd: z.boolean()
      .default(true)
      .description("允许(包括其他插件)控制哪些文件被添加仅备份中")
  }, z.union([
    z.object({
      serialAdd: z.const(true).required(),
      ignores: z.array(String)
        .role('table')
        .default(["**/node_modules", '**/.*', 'cache'])
    }),
    z.object({
      serialAdd: z.const(false).required()
    })
  ])])

  export interface Services {
  }
}
