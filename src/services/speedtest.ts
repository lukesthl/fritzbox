import { Commands } from '../commands';
import type { FritzBox } from '../fritzbox';

class Speedtest extends Commands {
  private readonly serviceId =
    'urn:X_AVM-DE_Speedtest-com:serviceId:X_AVMDE_Speedtest 1';

  private fritzbox: FritzBox;

  /**
   * @link https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/x_speedtestSCPD.pdf
   */
  constructor(fritzbox: FritzBox) {
    super();
    this.fritzbox = fritzbox;
  }

  public async getInfo() {
    await this.fritzbox.init();
    return this.exec<Info>(this.serviceId, 'GetInfo', this.fritzbox.services);
  }
}

interface Info {
  NewEnableTcp: boolean;
  NewEnableUdp: boolean;
  NewEnableUdpBidirect: boolean;
  NewWANEnableTcp: boolean;
  NewWANEnableUdp: boolean;
  NewPortTcp: number;
  NewPortUdp: number;
  NewPortUdpBidirect: number;
}

export { Speedtest };
export type { Info };
