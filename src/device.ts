import type { IService } from './service';

export interface IDevice {
  deviceType: string;
  friendlyName: string;
  manufacturer: string;
  manufacturerURL: string;
  modelDescription: string;
  modelName: string;
  modelNumber: string;
  modelURL: string;
  UDN: string;
  serviceList: ServiceList;
  deviceList: PurpleDeviceList;
}

interface ServiceList {
  service: IService[];
}

interface PurpleDeviceList {
  device: IDevice[];
}

export class Device implements IDevice {
  public deviceType: string;
  public friendlyName: string;
  public manufacturer: string;
  public manufacturerURL: string;
  public modelDescription: string;
  public modelName: string;
  public modelNumber: string;
  public modelURL: string;
  public UDN: string;
  public serviceList: ServiceList;
  public deviceList: PurpleDeviceList;

  constructor(device: IDevice) {
    this.deviceType = device.deviceType;
    this.friendlyName = device.friendlyName;
    this.manufacturer = device.manufacturer;
    this.manufacturerURL = device.manufacturerURL;
    this.modelDescription = device.modelDescription;
    this.modelName = device.modelName;
    this.modelNumber = device.modelNumber;
    this.modelURL = device.modelURL;
    this.UDN = device.UDN;
    this.serviceList = device.serviceList;
    this.deviceList = device.deviceList;
  }
}
