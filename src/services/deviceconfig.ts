import { Commands } from '../commands';
import type { FritzBox } from '../fritzbox';

class DeviceConfig extends Commands {
  private readonly serviceId = 'urn:DeviceConfig-com:serviceId:DeviceConfig1';

  private fritzbox: FritzBox;

  /**
   * @link https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/deviceinfoSCPD.pdf
   */
  constructor(fritzbox: FritzBox) {
    super();
    this.fritzbox = fritzbox;
  }

  public async getUrlSID() {
    await this.fritzbox.init();
    return this.exec<UrlSIDResponse>(
      this.serviceId,
      'X_AVM-DE_CreateUrlSID',
      this.fritzbox.services
    );
  }

  public async reboot() {
    await this.fritzbox.init();
    return this.exec(this.serviceId, 'Reboot', this.fritzbox.services);
  }
}

interface UrlSIDResponse {
  'NewX_AVM-DE_UrlSID': string;
}

export { DeviceConfig };
export type { UrlSIDResponse };
