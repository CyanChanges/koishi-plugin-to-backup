import { Context, Schema, Service } from "koishi";
import { Notifier } from '@koishijs/plugin-notifier'

declare module 'koishi' {
  export interface Context {
    'backup.notifier': BackupNotifier
  }
}

export class BackupNotifier extends Service {
  static inject = ['backup', 'notifier']
  private notifier: Notifier;

  constructor(protected ctx: Context) {
    super(ctx, 'backup.notifier');
    this.notifier = ctx.notifier.create({ type: 'primary' })
    ctx.on('backup/before-backup', ()=>this.notify())
  }

  async start() {
    this.notify()
  }

  handle() {
    this.ctx.backup.backup().then(r => this.notify())
    this.notify()
  }


  notify() {
    if (!this.ctx.backup.isInBackup)
      this.notifier.update(<>
        <p>备份你的 Koishi!</p>
        <button onClick={()=>this.handle()}>立即备份</button>
      </>)
    else {
      const results = []
      this.ctx.backup.curTasks?.forEach(([name, result], idx) => {
        results[idx] = false
        result.then(() => results[idx] = true)
      })
      const data = results.map((val, idx)=>{
        const t = this.ctx.backup.curTasks[idx]
        return `${t[0]} ` + val ? '已完成' : '正在执行'
      })
      this.notifier.update(<>
        <p>正在备份...</p>
        <ul>{data}</ul>
      </>)
    }
  }
}

export namespace BackupNotifier {
  export const Config = Schema.object({}).description("Notifier 配置")
  export interface Config {}
}
