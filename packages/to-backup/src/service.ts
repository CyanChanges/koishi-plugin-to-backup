import { Awaitable, Context, Service } from "koishi";
import {Zip} from './zip'
import type {Backup} from '.'

export abstract class BackupService extends Service {
  static inject = ['backup']

  protected constructor(public ctx: Context, protected key: keyof Backup.Services, options: BackupService.Config) {
    super(ctx, `backup.${key}`, options.immediately);
  }

  abstract backup(zip: Zip): Awaitable<boolean>
}

export namespace BackupService {
  export interface Config {
    immediately?: boolean,
  }
}

export default BackupService
