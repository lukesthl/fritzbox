import type { IDevice } from './device';
import { Device } from './device';
import { Service } from './service';
import { DeviceConfig } from './services/deviceconfig';
import { DeviceInfo } from './services/deviceinfo';
import { LanDeviceHosts } from './services/landdevicehosts';
import { SmartHome } from './services/homeautomation/smarthome';
import { Speedtest } from './services/speedtest';
import { EcoStat } from './services/unofficial/ecostat';
import { NetworkMonitor } from './services/unofficial/networkmonitor';
import type { ITr64Desc } from './tr64desc';
import { Tr64Desc } from './tr64desc';
import { XMLClient } from './xml.client';
import { DeviceStats } from './services/homeautomation/devicestats';
import { Commands } from './commands';

interface IOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tr064: boolean;
  ssl: boolean;
}

class FritzBox {
  public unofficial = {
    ecoStat: new EcoStat(this),
    networkMonitor: new NetworkMonitor(this),
  };

  public homeautomation = {
    deviceStats: new DeviceStats(this),
  };

  public deviceInfo = new DeviceInfo(this);
  public smartHome = new SmartHome(this);
  public deviceConfig = new DeviceConfig(this);
  public speedTest = new Speedtest(this);
  public lanDeviceHosts = new LanDeviceHosts(this);

  private initialized = false;

  public readonly url: URL;

  private options: IOptions;

  public services = new Map<string, Service>();

  private devices = new Map<string, Device>();

  private sid?: string;

  private lastSidGeneration: Date | null = null;

  constructor(options?: Partial<IOptions>) {
    this.options = {
      host: 'fritz.box',
      port: 49000,
      tr064: true,
      ssl: false,
      ...options,
    };
    this.url = new URL(`http://${this.options.host}:${this.options.port}`);
  }

  public async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (this.options.tr064) {
      await this.parseDesc('/tr64desc.xml');
    }
    // if (this.options.igd) {
    //   await this.parseDesc(IGD_DESC_URL);
    // }
    if (this.options.ssl) {
      await this.upgradeSsl();
    }
    //  void this.getSid();
    this.initialized = true;
  }

  private async parseDesc(url: string): Promise<void> {
    const requestUrl = new URL(url, this.url.toString()).toString();
    const result = await new XMLClient().request<{ root: ITr64Desc }>(
      requestUrl
    );
    if (result) {
      const tr64desc = new Tr64Desc(result.root);
      this.initServicesByDevice(tr64desc.device);
      this.devices.set(tr64desc.device.UDN, new Device(tr64desc.device));
      tr64desc.device.deviceList?.device.forEach(device => {
        this.devices.set(device.UDN, new Device(device));
      });
    }
  }

  private initServicesByDevice(device: IDevice): void {
    device.serviceList.service.forEach(service => {
      this.services.set(
        service.serviceId,
        new Service(service, this.url, this.options)
      );
    });
    if (device.deviceList?.device && device.deviceList.device.length > 0) {
      device.deviceList.device.forEach(device => {
        if (device.serviceList) {
          this.initServicesByDevice(device);
        }
      });
    }
  }

  public async getSid(): Promise<string> {
    if (this.lastSidGeneration && this.sid) {
      const now = new Date();
      const diff = now.getTime() - this.lastSidGeneration.getTime();
      const ONE_HOUR = 1000 * 60 * 60;
      if (diff < ONE_HOUR) {
        return this.sid;
      }
    }
    const response = await this.deviceConfig.getUrlSID();
    const sid = response['NewX_AVM-DE_UrlSID']?.split('sid=')?.[1];
    if (!sid) {
      throw new Error('No SID found');
    }
    this.sid = sid;
    this.lastSidGeneration = new Date();
    return sid;
  }

  public async exec<T>({
    actionName,
    serviceId,
    options,
  }: {
    serviceId: string;
    actionName: string;
    options?: unknown;
  }): Promise<T> {
    const command = new Commands();
    return await command.exec<T>(serviceId, actionName, this.services, options);
  }

  private async upgradeSsl(): Promise<void> {
    const port = (await this.deviceInfo.getSecurityPort()).NewSecurityPort;
    this.url.protocol = 'https:';
    this.url.port = port;
  }
}

export { FritzBox, IOptions };
