import axios from 'axios';
import type { FritzBox } from '../../fritzbox';

class EcoStat {
  private fritzbox: FritzBox;

  constructor(fritzbox: FritzBox) {
    this.fritzbox = fritzbox;
  }

  async getEcoStat(): Promise<Response | undefined> {
    await this.fritzbox.init();
    const sid = await this.fritzbox.getSid();
    const response = await axios.post<Response>(
      `${this.fritzbox.url.protocol}//${this.fritzbox.url.hostname}/data.lua`,
      `xhr=1&sid=${sid}&lang=de&page=ecoStat&xhrId=all`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  }
}

export { EcoStat };

interface Response {
  pid: string;
  hide: Hide;
  timeTillLogout: string;
  time: any[];
  data: Data;
  sid: string;
}

interface Data {
  cputemp: Cputemp;
  cpuutil: Cputemp;
  ramusage: Ramusage;
}

interface Ramusage {
  series: number[][];
  labels: number[];
}

interface Cputemp {
  series: string[][];
  labels: (boolean | number)[];
}

interface Hide {
  mobile: boolean;
  liveTv: boolean;
  faxSet: boolean;
  ssoSet: boolean;
  shareUsb: boolean;
  rrd: boolean;
}
