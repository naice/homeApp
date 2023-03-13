import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest, from, fromEvent, interval, merge, of } from 'rxjs';
import { distinctUntilChanged, map, mergeMap, shareReplay, takeUntil, throttleTime, timeout } from 'rxjs/operators';
import * as oboe from 'oboe';

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

export interface GarageESP {
  distance: number,
  garageClosed: number,
}

export interface WallboxVitals {
  vehicle_connected: boolean,
  contactor_closed: boolean,
  session_energy_wh: number,
  uptime_s: number,
}

export interface WallboxLifeTime {
  energy_wh: number,
  charge_starts: number,
  uptime_s: number,
  charging_time_s: number,
}

export interface GarageFrameData {
  garageESP?: GarageESP,
  wallboxVitals?: WallboxVitals,
  wallboxLifetime?: WallboxLifeTime,
}

export interface GarageStreamFrame {
  timestamp: string,
  data?: GarageFrameData,
}

export interface  StreamRequest {
  delayInMilliseconds: number;
}


export type Register = RegisterObject[];

@Injectable({
  providedIn: 'root'
})
export class RegisterMeService implements OnDestroy {

  newApi = "http://localhost:5083";

  private destory = new Subject();
  private destroy$ = this.destory.asObservable();

  private oboeGarageService: oboe.Oboe | undefined;
  private garageStreamSubject : Subject<GarageStreamFrame> | undefined;
  public get garageStream$(): Observable<GarageStreamFrame> {
    if (!this.garageStreamSubject)
    {
      this.garageStreamSubject = new Subject<GarageStreamFrame>();
      this.oboeGarageService = this.createGarageStream();
    }
    return this.garageStreamSubject!.asObservable();
  }

  constructor(
    protected readonly userActiveService: UserActiveService,
    protected readonly http: HttpClient
  ) {
    userActiveService.userActiveState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isActive) => {
        if (isActive && !this.oboeGarageService) {
          this.oboeGarageService = this.createGarageStream();
        }
        if (!isActive && this.oboeGarageService) {
          this.stopGarageStream();
        }
      });
  }
  public ngOnDestroy(): void {
    this.destory.next();
    this.destory.complete();
  }

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
      return this.http.post<ResultType>(
        "http://192.168.178.88:4711/proxy", {
          method: "post",  target, payload,
        }
      ).pipe(timeout(2000));
    }
    if (method == "get") {
      return this.http.post<ResultType>(
        "http://192.168.178.88:4711/proxy", {
          method: "get", target
        }
      ).pipe(timeout(2000));
    }

    throw Error("UNKNOWN METHOD " + method);
  }

  private stopGarageStream()
  {
    if (!this.oboeGarageService) {
      return;
    }
    this.oboeGarageService.abort();
    delete this.oboeGarageService;
  }

  private createGarageStream(request: StreamRequest | undefined = undefined) : oboe.Oboe {
    request ??= {
      delayInMilliseconds: 1000,
    };
    var config: oboe.Options = {
      url: `${this.newApi}/GarageStream`,
      method: "POST",
      cached: false,
      body: request,
    }
    const oboeService = oboe(config);
    var that = this;
    oboeService.node('!.*', function (frame: GarageStreamFrame) {
      that.garageStreamSubject?.next(frame);
      console.log("DATA");
    });
    return oboeService;
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserActiveService {
  private timeoutMs: number = 500;
  private events: string[] = ['keydown', 'click', 'wheel', 'mousemove'];

  public lastActive$ = merge(
    of(new Date()),
    from(this.events)
      .pipe(
        mergeMap(event => fromEvent(document, event)),
        map(() => new Date()))
  ).pipe(
    throttleTime(this.timeoutMs, undefined, { leading: true, trailing: true }),
    shareReplay(1)
  );

  public userActiveState$ = combineLatest([
    this.lastActive$,
    interval(this.timeoutMs)
  ]).pipe(map(([lastActive]) => {
    const nowSec = Math.round(Date.now() / 1000);
    const lastActiveSec = Math.round(lastActive.getTime() / 1000);
    const isAbsent =
      nowSec - lastActiveSec >
      this.userAbsentThreshold;
    return !isAbsent;
  }),
  shareReplay(1),
  distinctUntilChanged());

  /**
   * in seconds.
   */
  public userAbsentThreshold: number = 60;
}
