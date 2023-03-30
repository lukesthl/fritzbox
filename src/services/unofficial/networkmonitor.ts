import axios from 'axios';
import type { FritzBox } from '../../fritzbox';

class NetworkMonitor {
  private fritzbox: FritzBox;

  constructor(fritzbox: FritzBox) {
    this.fritzbox = fritzbox;
  }

  async getNetworkStats(): Promise<Response | undefined> {
    await this.fritzbox.init();
    const sid = await this.fritzbox.getSid();
    const params = new URLSearchParams({
      xhr: '1',
      sid,
      lang: 'de',
      page: 'netMoni',
      xhrId: 'all',
    });
    const response = await axios.post<Response>(
      `${this.fritzbox.url.protocol}//${this.fritzbox.url.hostname}/data.lua`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  }

  public getNetworkTrafficBySyncGroup(syncGroup: Syncgroup): NetworkTraffic[] {
    return syncGroup?.ds_bps_curr
      .map((currentBytes, index) => {
        const uploadDefaultBytes = syncGroup?.us_default_bps_curr[index] || 0;
        const uploadImportantBytes =
          syncGroup?.us_important_bps_curr[index] || 0;
        const uploadRealtimeBytes = syncGroup?.us_realtime_bps_curr[index] || 0;
        const dateCollected = new Date();
        dateCollected.setSeconds(dateCollected.getSeconds() - (index + 1) * 5);
        return {
          downBytes: currentBytes,
          uploadDefaultBytes,
          uploadImportantBytes,
          uploadRealtimeBytes,
          date: dateCollected,
        };
      })
      .reverse();
  }
}

export { NetworkMonitor };
export type { Data as NetworkStats, NetworkTraffic };

interface NetworkTraffic {
  downBytes: number;
  uploadDefaultBytes: number;
  uploadImportantBytes: number;
  uploadRealtimeBytes: number;
  date: Date;
}

interface Response {
  pid: string;
  hide: Hide;
  timeTillLogout: string;
  time: unknown[];
  data: Data;
  sid: string;
}

interface Data {
  other: Other;
  connections: Connection[];
  show_guest: boolean;
  sampling_interval: number;
  box_type: string;
  sync_groups: Syncgroup[];
  ip_client: boolean;
}

interface Syncgroup {
  us_bps_curr_max: number;
  us_default_bps_curr: number[];
  ds_bps_max: number;
  _node: string;
  mode: string;
  ds_mc_bps_curr: number[];
  ds_bps_curr: number[];
  us_bps_max: number;
  dynamic: boolean;
  us_realtime_bps_curr: number[];
  downstream: number;
  upstream: number;
  name: string;
  guest_us_bps: number[];
  ds_guest_bps_curr: number[];
  us_background_bps_curr: number[];
  ds_bps_curr_max: number;
  us_important_bps_curr: number[];
}

interface Connection {
  dsl_diagnosis: boolean;
  medium_upstream: number;
  downstream: number;
  role: string;
  provider: string;
  ipv4: Ipv4;
  connected: boolean;
  shapedrate: boolean;
  ready_for_fallback: boolean;
  medium_downstream: number;
  state: string;
  upstream: number;
  name: string;
  type: string;
  active: boolean;
  ipv6: Ipv6;
  speed_manual: boolean;
  medium: string;
}

interface Ipv6 {
  ip_lifetime: Iplifetime;
  connected: boolean;
  dns: Dn2[];
  ip: string;
  prefix: string;
  prefix_lifetime: Iplifetime;
  since: number;
}

interface Dn2 {
  type: string;
  ip: string;
}

interface Iplifetime {
  valid: number;
  preferred: number;
}

interface Ipv4 {
  connected: boolean;
  dns: Dn[];
  dslite: boolean;
  ip: string;
  since: number;
}

interface Dn {
  type: string;
  purpose?: string;
  ip: string;
}

interface Other {
  port_releases: Portreleases;
  myfritz: Myfritz;
  remote: Remote;
  vpn: Vpn[];
}

interface Vpn {
  state: string;
  connected: boolean;
  name: string;
}

interface Remote {
  ftps: boolean;
  https: boolean;
  ftp: boolean;
}

interface Myfritz {
  url: string;
  connected: boolean;
  user: string;
}

interface Portreleases {
  ports: Ports;
}

interface Ports {
  count: number;
}

interface Hide {
  mobile: boolean;
  liveTv: boolean;
  faxSet: boolean;
  ssoSet: boolean;
  shareUsb: boolean;
  rrd: boolean;
}
