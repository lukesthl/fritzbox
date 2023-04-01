import xmlBuilder from 'xmlbuilder';
import type { IOptions } from './fritzbox';
import { XMLClient } from './xml.client';

export interface IService {
  serviceType: string;
  serviceId: string;
  controlURL: string;
  eventSubURL: string;
  SCPDURL: string;
}

interface Scpd {
  specVersion: SpecVersion;
  actionList: ActionList;
  serviceStateTable: ServiceStateTable;
  _xmlns: string;
}

interface ActionList {
  action: IAction[];
}

interface IAction {
  name: string;
  argumentList: ArgumentList;
}

interface ArgumentList {
  argument: ArgumentElement[] | ArgumentElement;
}

interface ArgumentElement {
  name: string;
  direction: Direction;
  relatedStateVariable: string;
}

enum Direction {
  In = 'in',
  Out = 'out',
}

interface ServiceStateTable {
  stateVariable: StateVariable[];
}

interface StateVariable {
  name: string;
  dataType: DataType;
  defaultValue?: string;
  _sendEvents: SendEvents;
}

enum SendEvents {
  No = 'no',
}

enum DataType {
  String = 'string',
  Ui2 = 'ui2',
  Ui4 = 'ui4',
}

interface SpecVersion {
  major: string;
  minor: string;
}

export class Service implements IService {
  public serviceType: string;
  public serviceId: string;
  public controlURL: string;
  public eventSubURL: string;
  public SCPDURL: string;

  private initialized = false;
  private url;
  private fritzboxOptions;

  private customActions = new Map<
    string,
    {
      name: string;
      parameter: string[];
      return: string[];
    }
  >();

  constructor(service: IService, url: URL, options: IOptions) {
    this.serviceType = service.serviceType;
    this.serviceId = service.serviceId;
    this.controlURL = service.controlURL;
    this.eventSubURL = service.eventSubURL;
    this.SCPDURL = service.SCPDURL;
    this.url = url;
    this.fritzboxOptions = options;
  }

  async init() {
    if (this.initialized) {
      return;
    }
    const url = this.url.origin + this.SCPDURL;

    const result = await new XMLClient().request<{ scpd: Scpd }>(url);
    if (result?.scpd) {
      this.initActions(result.scpd.actionList.action);
    }
    this.initialized = true;
  }

  initActions(actions: IAction[]) {
    actions.forEach(action => {
      const customAction = {
        name: action.name,
        parameter: this.getInArguments(action.argumentList),
        return: this.getOutArguments(action.argumentList),
      };
      this.customActions.set(action.name, customAction);
    });
  }

  public async exec<T>(actionName: string, options: unknown): Promise<T> {
    await this.init();
    const action = this.customActions.get(actionName);

    if (!action) {
      throw new Error(
        `Action "${actionName}" of "${this.serviceType}" not known!`
      );
    }
    const body = this.buildSoapMessage(
      actionName,
      this.serviceType,
      typeof options === 'object' ? options || {} : {}
    );
    const outArguments = this.customActions.get(actionName)?.return;
    const url = this.url.origin + this.controlURL;

    const headers = {
      SoapAction: this.serviceType + '#' + actionName,
      'Content-Type': 'text/xml; charset="utf-8"',
    };
    const xmlClient = new XMLClient();
    const auth =
      this.fritzboxOptions.username && this.fritzboxOptions.password
        ? {
            username: this.fritzboxOptions.username,
            password: this.fritzboxOptions.password,
          }
        : undefined;
    const response = await xmlClient.request<{
      ['s:Envelope']: {
        ['s:Body']: {
          [key: string]: {
            [key: string]: string;
          };
        };
      };
      HTML?: {
        HEAD: { TITLE: string };
      };
    }>(
      url,
      {
        method: 'POST',
        headers,
        data: body,
        auth,
      },
      true
    );
    const res: T = {} as T;
    if (response && response['s:Envelope']) {
      const env = response['s:Envelope'];

      const resultBody = env['s:Body'];
      if (resultBody['u:' + actionName + 'Response']) {
        const responseVars = resultBody['u:' + actionName + 'Response'];
        if (outArguments) {
          outArguments.forEach(
            arg =>
              ((res as Record<string, string | undefined>)[arg] =
                responseVars?.[arg])
          );
        }
      } else {
        if (resultBody['s:Fault']) {
          throw new Error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Device responded with fault ${resultBody['s:Fault']}`
          );
        }
      }
    } else {
      if (response.HTML?.HEAD?.TITLE) {
        throw new Error(response.HTML.HEAD.TITLE);
      } else {
        throw new Error(response.toString());
      }
    }
    return res;
  }

  private getInArguments = (argumentList: ArgumentList) => {
    if (argumentList && Array.isArray(argumentList.argument)) {
      return argumentList.argument
        .filter(this.isInDirection)
        .map(argument => argument.name);
    } else if (
      argumentList &&
      argumentList.argument &&
      this.isInDirection(argumentList.argument)
    ) {
      return [(argumentList.argument as ArgumentElement).name];
    } else {
      return [];
    }
  };

  private getOutArguments = (argumentList: ArgumentList) => {
    if (argumentList && Array.isArray(argumentList.argument)) {
      return argumentList.argument
        .filter(this.isOutDirection)
        .map(argument => argument.name);
    } else if (
      argumentList &&
      argumentList.argument &&
      this.isOutDirection(argumentList.argument)
    ) {
      return [(argumentList.argument as ArgumentElement).name];
    } else {
      return [];
    }
  };

  private isInDirection = (argument: ArgumentElement | ArgumentElement[]) =>
    Array.isArray(argument)
      ? argument[0]?.direction === 'in'
      : argument.direction === 'in';

  private isOutDirection = (argument: ArgumentElement | ArgumentElement[]) =>
    Array.isArray(argument)
      ? argument[0]?.direction === 'out'
      : argument.direction === 'out';

  private buildSoapMessage(
    action: string,
    serviceType: string,
    options: object
  ): string {
    const fqaction = 'u:' + action;

    const root = {
      's:Envelope': {
        '@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        '@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        's:Body': {
          [fqaction]: {
            '@xmlns:u': serviceType,
            ...options,
          },
        },
      },
    };

    const xml = xmlBuilder.create(root);

    return xml.end();
  }
}
