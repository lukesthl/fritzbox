import { Commands } from '../commands';
import type { FritzBox } from '../fritzbox';
import { XMLClient } from '../xml.client';

class LanDeviceHosts extends Commands {
  private readonly serviceId = 'urn:LanDeviceHosts-com:serviceId:Hosts1';

  private fritzbox: FritzBox;

  /**
   * @link https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/x_speedtestSCPD.pdf
   */
  constructor(fritzbox: FritzBox) {
    super();
    this.fritzbox = fritzbox;
  }

  public async getHostListPath() {
    await this.fritzbox.init();
    return this.exec<Record<'NewX_AVM-DE_HostListPath', string>>(
      this.serviceId,
      'X_AVM-DE_GetHostListPath',
      this.fritzbox.services
    );
  }

  public async getHosts() {
    await this.fritzbox.init();
    const hostListPath = await this.getHostListPath();
    const fritzboxUrl = this.fritzbox.url;
    const url = new URL(
      `${fritzboxUrl.protocol}//${fritzboxUrl.hostname}:${fritzboxUrl.port}${hostListPath['NewX_AVM-DE_HostListPath']}`
    );
    const hosts = await new XMLClient().request<{
      List: {
        Item: {
          MACAddress: string;
          IPAddress: string;
          Active: number;
          HostName: string;
          InterfaceType: string;
        }[];
      };
    }>(url.toString());
    return hosts.List.Item.map(entry => ({
      mac: entry.MACAddress,
      ip: entry.IPAddress,
      active: entry.Active === 1,
      name: entry.HostName,
      interface: entry.InterfaceType,
    }));
  }
}

interface Host {
  mac: string;
  ip: string;
  active: boolean;
  name: string;
  interface: string;
}

export { LanDeviceHosts };
export type { Host };
