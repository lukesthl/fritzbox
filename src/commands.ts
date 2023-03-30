import type { Service } from './service';

export class Commands {
  public async exec<T>(
    serviceId: string,
    actionName: string,
    services: Map<string, Service>,
    options?: unknown
  ): Promise<T> {
    let service = services.get(serviceId);

    if (!service && serviceId.split('serviceId:')[1] === 'WLANConfiguration3') {
      serviceId = 'urn:WLANConfiguration-com:serviceId:WLANConfiguration2';
      service = services.get(serviceId);
    }

    if (!service) {
      throw new Error(`service with id ${serviceId} not known`);
    }
    return await service.exec(actionName, options);
  }
}
