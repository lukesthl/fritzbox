import type { IDevice } from './device';

export interface ITr64Desc {
  specVersion: SpecVersion;
  systemVersion: SystemVersion;
  device: RootDevice;
  _xmlns: string;
}

interface RootDevice extends IDevice {
  presentationURL: string;
  iconList: IconList;
  originUDN: string;
  serialNumber: string;
}

interface IconList {
  icon: Icon;
}

interface Icon {
  mimetype: string;
  width: string;
  height: string;
  depth: string;
  url: string;
}

interface SpecVersion {
  major: string;
  minor: string;
}

interface SystemVersion {
  HW: string;
  Major: string;
  Minor: string;
  Patch: string;
  Buildnumber: string;
  Display: string;
}

export class Tr64Desc implements ITr64Desc {
  specVersion: SpecVersion;
  systemVersion: SystemVersion;
  device: RootDevice;
  _xmlns: string;

  constructor(tr64desc: ITr64Desc) {
    this._xmlns = tr64desc._xmlns;
    this.device = tr64desc.device;
    this.specVersion = tr64desc.specVersion;
    this.systemVersion = tr64desc.systemVersion;
  }
}
