import { Component, OnInit } from '@angular/core'
import { ServerService } from '@app/core'
import { prepareIcu } from '@app/helpers'
import { ServerConfig } from '@shared/models'

@Component({
  selector: 'my-instance-features-table',
  templateUrl: './instance-features-table.component.html',
  styleUrls: [ './instance-features-table.component.scss' ]
})
export class InstanceFeaturesTableComponent implements OnInit {
  quotaHelpIndication = ''
  serverConfig: ServerConfig

  constructor (
    private serverService: ServerService
  ) { }

  get initialUserVideoQuota () {
    return this.serverConfig.user.videoQuota
  }

  get dailyUserVideoQuota () {
    return Math.min(this.initialUserVideoQuota, this.serverConfig.user.videoQuotaDaily)
  }

  get maxInstanceLives () {
    const value = this.serverConfig.live.maxInstanceLives
    if (value === -1) return $localize`Unlimited`

    return value
  }

  get maxUserLives () {
    const value = this.serverConfig.live.maxUserLives
    if (value === -1) return $localize`Unlimited`

    return value
  }

  ngOnInit () {
    this.serverService.getConfig()
        .subscribe(config => {
          this.serverConfig = config
          this.buildQuotaHelpIndication()
        })
  }

  buildNSFWLabel () {
    const policy = this.serverConfig.instance.defaultNSFWPolicy

    if (policy === 'do_not_list') return $localize`Hidden`
    if (policy === 'blur') return $localize`Blurred with confirmation request`
    if (policy === 'display') return $localize`Displayed`
  }

  buildRegistrationLabel () {
    const config = this.serverConfig.signup

    if (config.allowed !== true) return $localize`Disabled`
    if (config.requiresApproval === true) return $localize`Requires approval by moderators`

    return $localize`Enabled`
  }

  getServerVersionAndCommit () {
    return this.serverService.getServerVersionAndCommit()
  }

  private getApproximateTime (seconds: number) {
    const hours = Math.floor(seconds / 3600)

    if (hours !== 0) {
      return prepareIcu($localize`~ {hours, plural, =1 {1 hour} other {{hours} hours}}`)(
        { hours },
        $localize`~ ${hours} hours`
      )
    }

    const minutes = Math.floor(seconds % 3600 / 60)

    return prepareIcu($localize`~ {minutes, plural, =1 {1 minute} other {{minutes} minutes}}`)(
      { minutes },
      $localize`~ ${minutes} minutes`
    )
  }

  private buildQuotaHelpIndication () {
    if (this.initialUserVideoQuota === -1) return

    const initialUserVideoQuotaBit = this.initialUserVideoQuota * 8

    // 1080p: ~ 6Mbps
    // 720p: ~ 4Mbps
    // 360p: ~ 1.5Mbps
    const fullHdSeconds = initialUserVideoQuotaBit / (6 * 1000 * 1000)
    const hdSeconds = initialUserVideoQuotaBit / (4 * 1000 * 1000)
    const normalSeconds = initialUserVideoQuotaBit / (1.5 * 1000 * 1000)

    const lines = [
      $localize`${this.getApproximateTime(fullHdSeconds)} of full HD videos`,
      $localize`${this.getApproximateTime(hdSeconds)} of HD videos`,
      $localize`${this.getApproximateTime(normalSeconds)} of average quality videos`
    ]

    this.quotaHelpIndication = lines.join('<br />')
  }
}
