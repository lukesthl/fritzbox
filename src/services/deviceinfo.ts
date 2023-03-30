import { Commands } from '../commands';
import type { FritzBox } from '../fritzbox';
class DeviceInfo extends Commands {
  private readonly serviceId = 'urn:DeviceInfo-com:serviceId:DeviceInfo1';

  private fritzbox: FritzBox;

  /**
   * @link https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/deviceinfoSCPD.pdf
   */
  constructor(fritzbox: FritzBox) {
    super();
    this.fritzbox = fritzbox;
  }

  public async getDeviceLog() {
    await this.fritzbox.init();
    return this.exec<DeviceLog>(
      this.serviceId,
      'GetDeviceLog',
      this.fritzbox.services
    );
  }

  public async getInfo() {
    await this.fritzbox.init();
    return this.exec<Info>(this.serviceId, 'GetInfo', this.fritzbox.services);
  }

  public async getSecurityPort() {
    await this.fritzbox.init();
    return this.exec<SecurityPort>(
      this.serviceId,
      'GetSecurityPort',
      this.fritzbox.services
    );
  }

  public async setProvisioningCode(options: ProvisioningCode) {
    await this.fritzbox.init();
    return this.exec(
      this.serviceId,
      'SetProvisioningCode',
      this.fritzbox.services,
      options
    );
  }
}

interface ProvisioningCode {
  NewProvisioningCode: string;
}

interface DeviceLog {
  NewDeviceLog: string;
}

interface SecurityPort {
  NewSecurityPort: string;
}

interface Info {
  NewManufacturerName: string;
  NewManufacturerOUI: string;
  NewModelName: string;
  NewDescription: string;
  NewProductClass: string;
  NewSerialNumber: string;
  NewSoftwareVersion: string;
  NewHardwareVersion: string;
  NewSpecVersion: string;
  NewProvisioningCode: string;
  NewUpTime: number;
  NewDeviceLog: string;
}

export { DeviceInfo };
export type { DeviceLog, SecurityPort, Info };
