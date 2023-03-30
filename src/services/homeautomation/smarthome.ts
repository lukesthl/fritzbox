import type { FritzBox } from '../../fritzbox';
import { XMLClient } from '../../xml.client';

class SmartHome {
  private fritzbox: FritzBox;

  /**
   * @link https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/deviceinfoSCPD.pdf
   */
  constructor(fritzbox: FritzBox) {
    this.fritzbox = fritzbox;
  }

  public async getDevices(): Promise<{
    devices: Device[];
    deviceGroups: DeviceGroup[];
  }> {
    await this.fritzbox.init();
    const sid = await this.fritzbox.getSid();
    const url = `${this.fritzbox.url.protocol}${this.fritzbox.url.hostname}/webservices/homeautoswitch.lua?switchcmd=getdevicelistinfos&sid=${sid}`;
    console.log(url);
    const deviceResponse = await new XMLClient().request<DeviceResponse>(url);
    if (!Array.isArray(deviceResponse.devicelist.device)) {
      deviceResponse.devicelist.device = [deviceResponse.devicelist.device];
    }

    if (
      deviceResponse.devicelist.group &&
      !Array.isArray(deviceResponse.devicelist.group)
    ) {
      deviceResponse.devicelist.group = [deviceResponse.devicelist.group];
    }

    const deviceList = (deviceResponse.devicelist.device || []).filter(
      device => device['@_functionbitmask'] !== '1'
    );
    const groupList = (deviceResponse.devicelist.group || []).filter(
      device => device['@_functionbitmask'] !== '1'
    );
    const devices = this.getFormattedDevices(deviceList);
    const deviceGroups = this.getFormattedDeviceGroups(groupList, devices);
    return {
      devices,
      deviceGroups,
    };
  }

  private getFormattedDevices(deviceList: ApiDevice[]) {
    const formattedDevices = deviceList.map(device => {
      const deviceType = this.getDeviceType(device);
      let specificDevice = {} as
        | Thermostat
        | Switch
        | ContactSensor
        | Button
        | Blind
        | Powermeter
        | Light;
      if (
        deviceType === DeviceType.Thermostat &&
        device.hkr &&
        device.temperature &&
        device.battery
      ) {
        specificDevice = {
          type: deviceType,
          hkr: device.hkr,
          temperature: device.temperature,
          battery: { low: device.batterylow === 1, percentage: device.battery },
        };
      } else if (
        device.switch &&
        deviceType === DeviceType.Switch &&
        device.battery
      ) {
        specificDevice = {
          type: deviceType,
          mode: device.switch.mode,
          lock: device.switch.lock === 1,
          state: device.switch.state === 1,
          battery: { low: device.batterylow === 1, percentage: device.battery },
          devicelock: device.switch.devicelock === 1,
        };
      } else if (deviceType === DeviceType.Blind && device.levelcontrol) {
        specificDevice = {
          type: deviceType,
          level: device.levelcontrol?.level,
          percentage: device.levelcontrol?.levelpercentage,
        };
      } else if (deviceType === DeviceType.Button && device.button) {
        specificDevice = {
          type: deviceType,
          ...device.button,
        };
      } else if (
        deviceType === DeviceType.Powermeter &&
        device.powermeter &&
        device.switch
      ) {
        specificDevice = {
          type: deviceType,
          mode: device.switch.mode,
          lock: device.switch.lock === 1,
          state: device.switch.state === 1,
          energy: device.powermeter.energy,
          power: device.powermeter.power,
          voltage: device.powermeter.voltage,
          temperature: device.temperature,
          battery: device.battery
            ? { low: device.batterylow === 1, percentage: device.battery }
            : undefined,
          devicelock: device.switch.devicelock === 1,
        };
      } else if (
        deviceType === DeviceType.Light &&
        device.simpleonoff &&
        device.levelcontrol
      ) {
        specificDevice = {
          type: deviceType,
          state: device.simpleonoff.state === 1,
          level: device.levelcontrol.level,
          percentage: device.levelcontrol.levelpercentage,
          color: device.colorcontrol
            ? {
                hue: device.colorcontrol?.hue,
                saturation: device.colorcontrol?.saturation,
                temperature: device.colorcontrol?.temperature,
                supportedmodes:
                  device.colorcontrol?.['@_supported_modes'] === 0x01
                    ? 'hue_saturation'
                    : 'temperature',
                currentmode:
                  device.colorcontrol?.['@_current_mode'] === 1
                    ? 'hue_saturation'
                    : device.colorcontrol?.['@_current_mode'] === 4
                    ? 'temperature'
                    : 'none',
                fullcolorsupport:
                  device.colorcontrol?.['@_fullcolorsupport'] === 1,
                mapped: device.colorcontrol?.['@_mapped'] === 1,
              }
            : undefined,
        };
      } else if (deviceType === DeviceType.ContactSensor && device.alert) {
        specificDevice = {
          type: deviceType,
          lastalertchgtimestamp: device.alert.lastalertchgtimestamp,
          state: device.alert?.state === 1,
        };
      }
      const formattedDevice: Device = {
        id: device['@_id'],
        name: device.name,
        ain: device['@_identifier'].replace(/\s/g, ''),
        active: device.present === 1,
        bitmask: device['@_functionbitmask'],
        busy: device.txbusy === 1,
        firmwareversion: device['@_fwversion'],
        manufacturer: device['@_manufacturer'],
        productname: device['@_productname'],
        ...specificDevice,
      };
      // TODO check which devicetype this is used
      if (device.humidity) {
        Object.assign(formattedDevice, { humidity: device.humidity });
      }
      if (device.battery) {
        Object.assign(formattedDevice, {
          battery: {
            percentage: device.battery,
            low: device.batterylow,
          },
        });
      }
      return formattedDevice;
    });
    return formattedDevices;
  }

  private getDeviceType(device: ApiDevice): DeviceType {
    if (device.temperature && device.hkr) {
      return DeviceType.Thermostat;
    }
    if (device.simpleonoff && !device.switch) {
      return DeviceType.Light;
    }
    if (device.switch && device.powermeter) {
      return DeviceType.Powermeter;
    }
    if (device.switch) {
      return DeviceType.Switch;
    }
    if (device.etsiunitinfo && device.etsiunitinfo.unittype === 281) {
      return DeviceType.Blind;
    }
    return DeviceType.ContactSensor;
  }

  private getFormattedDeviceGroups(groupList: Group[], devices: Device[]) {
    const formattedDeviceGroups = groupList.map(group => {
      const formattedGroup: DeviceGroup = {
        name: group.name,
        id: group['@_id'],
        ain: group['@_identifier'].replace(/\s/g, ''),
        online: group.present,
        bitmask: group['@_functionbitmask'],
        busy: group.txbusy,
        associated: [],
        average: {
          thermostat: group.hkr,
        },
      };

      let associated: string[] = [];
      if (group.groupinfo && group.groupinfo.members) {
        if (group.groupinfo.members.includes(',')) {
          associated = group.groupinfo.members.split(',');
        } else {
          associated = [group.groupinfo.members];
        }

        formattedGroup.associated = associated
          .map(id => devices.find(deviceTmp => deviceTmp.id === id))
          .filter((deviceTmp): deviceTmp is Device => !!deviceTmp);

        const batteryPercentages = formattedGroup.associated
          .map(device => {
            if ('battery' in device) {
              return device.battery?.percentage;
            }
          })
          .filter(
            (batteryPercentage): batteryPercentage is number =>
              !!batteryPercentage
          );

        const oneBatteryLow = formattedGroup.associated
          .map(device => {
            if ('battery' in device) {
              return device.battery;
            }
          })
          .find(battery => battery?.low)?.low;

        formattedGroup.average.battery = {
          percentage:
            batteryPercentages.reduce((p, c) => p + c, 0) /
            batteryPercentages.length,
          low: !!oneBatteryLow,
        };
      }

      const temps = formattedGroup.associated
        .map(device => {
          if ('temperature' in device) {
            return device.temperature?.celsius;
          }
        })
        .filter(
          (temperatureValue): temperatureValue is number => !!temperatureValue
        );

      const offs = formattedGroup.associated
        .map(device => {
          if ('temperature' in device) {
            return device.temperature?.offset;
          }
        })
        .filter(
          (temperatureValue): temperatureValue is number => !!temperatureValue
        );

      const humids = formattedGroup.associated
        .map(device => {
          if ('humidity' in device) {
            return device.humidity;
          }
        })
        .filter((humidityValue): humidityValue is number => !!humidityValue);

      if (temps.length && offs.length) {
        formattedGroup.average.temperature = {
          celsius: temps.reduce((p, c) => p + c, 0) / temps.length,
          offset: offs.reduce((p, c) => p + c, 0) / offs.length,
        };
      }

      if (humids.length) {
        formattedGroup.average.humidity = {
          value: humids.reduce((p, c) => p + c, 0) / humids.length,
        };
      }
      return formattedGroup;
    });
    return formattedDeviceGroups;
  }
}

export { SmartHome, DeviceType };
export type {
  Device,
  DeviceGroup,
  Switch,
  Thermostat,
  Light,
  Blind,
  Button,
  Powermeter,
  ContactSensor,
  Hkr,
  Battery,
  Temperature,
};

enum DeviceType {
  Switch = 'switch',
  Light = 'light',
  Thermostat = 'thermostat',
  Blind = 'blind',
  Button = 'button',
  Powermeter = 'powermeter',
  ContactSensor = 'contactsensor',
}

interface DeviceGroup {
  name: string;
  id: string;
  ain: string;
  online: number;
  bitmask: string;
  busy: number;
  associated: Device[];
  average: {
    battery?: Battery;
    temperature?: Temperature;
    humidity?: unknown;
    thermostat?: Hkr;
  };
}

type Device = {
  id: string;
  active: boolean;
  ain: string;
  bitmask: string;
  busy: boolean;
  name: string;
  firmwareversion: string;
  manufacturer: string;
  productname: string;
} & (Thermostat | Switch | ContactSensor | Button | Blind | Powermeter | Light);

interface Light {
  type: DeviceType.Light;
  state: boolean;
  level: number; // 0 - 255
  percentage: number; // 0 - 100
  color?: {
    supportedmodes: 'hue_saturation' | 'temperature';
    currentmode: 'hue_saturation' | 'temperature' | 'none';
    fullcolorsupport: boolean;
    mapped: boolean;
    hue: number; // 0 - 359
    saturation: number; // 0 - 100 (if current_mode === 1)
    temperature: number; // 2700 - 6500 Kelvin
  };
}

// TODO
interface Button {
  type: DeviceType.Button;
}

interface ContactSensor {
  type: DeviceType.ContactSensor;
  state: boolean;
  lastalertchgtimestamp: number;
}

interface Blind {
  type: DeviceType.Blind;
  level: number; // 0 - 255
  percentage: number;
}

interface Switch {
  type: DeviceType.Switch;
  state: boolean;
  mode: 'auto' | 'manuell';
  lock: boolean;
  devicelock: boolean;
  battery: Battery;
}

interface Powermeter {
  type: DeviceType.Powermeter;
  state: boolean;
  mode: 'auto' | 'manuell';
  lock: boolean;
  devicelock: boolean;
  battery?: Battery;
  temperature?: Temperature;
  voltage: number;
  power: number;
  energy: number;
}

interface Thermostat {
  type: DeviceType.Thermostat;
  temperature: Temperature;
  hkr: Hkr;
  battery: Battery;
}

interface Battery {
  percentage: number;
  low: boolean;
}

interface DeviceResponse {
  devicelist: Devicelist;
}

interface Devicelist {
  device: ApiDevice[];
  group: Group[];
  '@_version': string;
  '@_fwversion': string;
}

interface Group extends ApiDevice {
  present: number;
  txbusy: number;
  name: string;
  groupinfo: Groupinfo;
  '@_synchronized': string;
  '@_identifier': string;
  '@_id': string;
  '@_functionbitmask': string;
  '@_fwversion': string;
  '@_manufacturer': string;
  '@_productname': string;
}

interface Groupinfo {
  masterdeviceid: number;
  members: string;
}

interface ApiDevice {
  present: number;
  txbusy: number;
  name: string;
  battery?: number;
  batterylow?: number;
  temperature?: Temperature;
  hkr?: Hkr;
  '@_identifier': string;
  '@_id': string;
  '@_functionbitmask': string;
  '@_fwversion': string;
  '@_manufacturer': string;
  '@_productname': string;
  switch?: Switch2;
  simpleonoff?: Simpleonoff;
  powermeter?: ApiPowermeter;
  etsiunitinfo?: Etsiunitinfo;
  alert?: Alert;
  humidity?: { rel_humidity: number };
  button: unknown | unknown[]; // TODO: Figure out what this is
  levelcontrol?: {
    level: number;
    levelpercentage: number;
  };
  colorcontrol?: {
    '@_supported_modes': number;
    '@_current_mode': number;
    '@_mapped': number;
    '@_fullcolorsupport': number;
    hue: number; // 0 - 359
    saturation: number; // 0 - 100 (if current_mode === 1)
    temperature: number;
  };
}

interface ApiPowermeter {
  voltage: number;
  power: number;
  energy: number;
}

interface Alert {
  state: number;
  lastalertchgtimestamp: number;
}

interface Etsiunitinfo {
  etsideviceid: number;
  unittype: number;
  interfaces: number;
}

interface Simpleonoff {
  state: number;
}

interface Switch2 {
  state: number;
  mode: 'auto' | 'manuell';
  lock: number;
  devicelock: number;
}

interface Hkr {
  tist: number;
  tsoll: number;
  absenk: number;
  komfort: number;
  lock: number;
  devicelock: number;
  errorcode: number;
  windowopenactiv: number;
  windowopenactiveendtime: number;
  boostactive: number;
  boostactiveendtime: number;
  batterylow: number;
  battery: number;
  nextchange: Nextchange;
  summeractive: number;
  holidayactive: number;
  adaptiveHeatingActive: number;
  adaptiveHeatingRunning: number;
}

interface Nextchange {
  endperiod: number;
  tchange: number;
}

interface Temperature {
  celsius: number;
  offset: number;
}
