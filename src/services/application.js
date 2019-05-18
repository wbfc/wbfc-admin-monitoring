/*
 * Copyright 2014-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// application 不再负责加载逻辑
/*import axios, {redirectOn401} from '../utils/axios';*/
import waitForPolyfill from '../utils/eventsource-polyfill';
import {concat, from, ignoreElements, Observable} from '../utils/rxjs';
import uri from '../utils/uri';
import sortBy from 'lodash/sortBy';
import Instance from './instance';
import ApplicationContext from './applicationContext';

class Application {
  constructor({name, instances, ...application}) {
    Object.assign(this, application);
    this.name = name;
    // application 不再负责加载逻辑
    /*this.axios = axios.create({
      baseURL: uri`applications/${this.name}/`
    });
    this.axios.interceptors.response.use(
      response => response,
      redirectOn401()
    );*/
    this.instances = sortBy(instances.map(i => new Instance(i), [instance => instance.registration.healthUrl]));
  }

  filterInstances(predicate) {
    return new Application({
      ...this,
      instances: this.instances.filter(predicate)
    })
  }

  findInstance(instanceId) {
    return this.instances.find(instance => instance.id === instanceId);
  }

  get isUnregisterable() {
    return this.instances.findIndex(i => i.isUnregisterable) >= 0;
  }

 
 // applications的来源从自定义的配置获取
/*  async unregister() {
    return this.axios.delete('')
  }*/

 /* static async list() {
    return await axios.get('applications', {
      transformResponse: Application._transformResponse
    });
  }*/

/*  static list() {
    return Application._transformResponse('[{"name":"boot2-security","buildVersion":null,"status":"UP","statusTimestamp":"2019-03-14T06:48:07.108Z","instances":[{"id":"20d1dc816161","registration":{"name":"boot2-security","managementUrl":"http://localhost:5200/actuator","healthUrl":"http://localhost:5200/actuator/health","serviceUrl":"http://localhost:5200/","source":"discovery","metadata":{"management.context-path":"/actuator"}},"registered":true,"statusInfo":{"status":"UP","details":{"diskSpace":{"status":"UP","details":{"total":333447163904,"free":164081586176,"threshold":10485760}},"db":{"status":"UP","details":{"database":"MySQL","hello":1}}}},"statusTimestamp":"2019-03-14T06:48:07.108Z","info":{},"endpoints":[{"id":"sessions","url":"http://localhost:5200/actuator/sessions"},{"id":"httptrace","url":"http://localhost:5200/actuator/httptrace"},{"id":"caches","url":"http://localhost:5200/actuator/caches"},{"id":"loggers","url":"http://localhost:5200/actuator/loggers"},{"id":"health","url":"http://localhost:5200/actuator/health"},{"id":"env","url":"http://localhost:5200/actuator/env"},{"id":"heapdump","url":"http://localhost:5200/actuator/heapdump"},{"id":"features","url":"http://localhost:5200/actuator/features"},{"id":"scheduledtasks","url":"http://localhost:5200/actuator/scheduledtasks"},{"id":"mappings","url":"http://localhost:5200/actuator/mappings"},{"id":"beans","url":"http://localhost:5200/actuator/beans"},{"id":"configprops","url":"http://localhost:5200/actuator/configprops"},{"id":"threaddump","url":"http://localhost:5200/actuator/threaddump"},{"id":"metrics","url":"http://localhost:5200/actuator/metrics"},{"id":"conditions","url":"http://localhost:5200/actuator/conditions"},{"id":"auditevents","url":"http://localhost:5200/actuator/auditevents"},{"id":"info","url":"http://localhost:5200/actuator/info"},{"id":"jolokia","url":"http://localhost:5200/actuator/jolokia"}],"buildVersion":null,"tags":{}}]}]');
  }*/

  static async list() {
    return await ApplicationContext.getApplicationActuatorList(Application._transformResponse);
  }
  static getStream() {
    return concat(
      from(waitForPolyfill()).pipe(ignoreElements())/*,
      Observable.create(observer => {
        const eventSource = new EventSource('applications');
        eventSource.onmessage = message => observer.next({
          ...message,
          data: Application._transformResponse(message.data)
        });

        eventSource.onerror = err => observer.error(err);
        return () => {
          eventSource.close();
        };
      })*/
    );
  }

  static _transformResponse(data) {
    if (!data) {
      return data;
    }
    const json = JSON.parse(data);
    if (json instanceof Array) {
      const applications = json.map(j => new Application(j));
      return sortBy(applications, [item => item.name]);
    }
    return new Application(json);
  }
}

export default Application;
