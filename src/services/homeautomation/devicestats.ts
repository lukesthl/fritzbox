import type { FritzBox } from '../../fritzbox';
import { XMLClient } from '../../xml.client';

class DeviceStats {
  private fritzbox: FritzBox;

  /**
   * @link https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/deviceinfoSCPD.pdf
   */
  constructor(fritzbox: FritzBox) {
    this.fritzbox = fritzbox;
  }

  public async getBasicDeviceStats(ain: string): Promise<IDeviceStats> {
    await this.fritzbox.init();
    const sid = await this.fritzbox.getSid();
    const xmlClient = new XMLClient();
    const url = `${this.fritzbox.url.protocol}${this.fritzbox.url.hostname}/webservices/homeautoswitch.lua?switchcmd=getbasicdevicestats&sid=${sid}&ain=${ain}`;
    const response = await xmlClient.request<Response>(url);
    return response.devicestats;
  }
}

export { DeviceStats };
export type { IDeviceStats, Stats };

interface Response {
  devicestats: IDeviceStats;
}

interface IDeviceStats {
  temperature?: { stats: Stats };
  energy?: { stats: Stats[] };
  power?: { stats: Stats };
  voltage?: { stats: Stats };
}

interface Stats {
  '@_count': string;
  '@_grid': string;
  '@_datatime': string;
  '#text': string;
}
