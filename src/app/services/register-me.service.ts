import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface RegisterResponse {
  register: Register;
}

export interface RegisterObject {
    name: string;
    created: number;
    updated: number;
    endpoints: Record<string, string>;
    ip: string;
}

export type Register = RegisterObject[];

@Injectable({
  providedIn: 'root'
})
export class RegisterMeService {
  constructor(
    protected readonly http: HttpClient
  ) { }

  public getRegister(): Observable<Register> {
    return this.http.get<RegisterResponse>("http://192.168.178.88:4711/register")
      .pipe(map((response) => response.register));
  }
  public getRegisterObjects(names: string[]): Observable<(RegisterObject | undefined)[]> {
    return this.getRegister().pipe(
      map((register) =>
        names.map((name) => register?.find((obj) => name === obj.name))
      )
    );
  }

  public getRegisterObject(name: string): Observable<RegisterObject | undefined> {
    return this.getRegister().pipe(
      map((register) => {
        console.log(register)
        return register?.find((obj) => obj.name === name)
      })
    );
  }

  public request<ResultType>(obj: RegisterObject, key: string, payload?: unknown): Observable<ResultType | undefined> {
    const endpoint = obj.endpoints[key];
    if (!endpoint) {
      return of(undefined);
    }
    const method = key.split("_")[0]?.toLowerCase();
    if (!method) {
      return of(undefined);
    }
    const target = `http://${obj.ip}${endpoint}`;
    if (method == "post") {
      console.log("post");
      return this.http.post<ResultType>(
        "http://192.168.178.88:4711/proxy", {
          method: "post",  target, payload
        }
      );
    }
    if (method == "get") {
      return this.http.post<ResultType>(
        "http://192.168.178.88:4711/proxy", {
          method: "get", target
        }
      );
    }

    throw Error("UNKNOWN METHOD " + method);
  }
}
