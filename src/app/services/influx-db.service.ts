import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface InfluxSerie {
  name: string,
  columns: string[],
  values: (string | number)[][],
}

export interface InfluxResult {
  statement_id: number,
  series: InfluxSerie[],
}

export interface InfluxMeasureResponse {
  results: InfluxResult[]
}

@Injectable({
  providedIn: 'root'
})
export class InfluxDBService {

  constructor(
    protected http: HttpClient
  ) { }

  public query(q: string): Observable<InfluxMeasureResponse> {
    const body = new HttpParams()
      .set("q", q);
    return this.http.post<InfluxMeasureResponse>(
      "http://192.168.178.88:8086/query",
      body.toString(),
      {
        headers: {
          ["Content-Type"]: "application/x-www-form-urlencoded",
        }
      }
    );
  }

  public getTemperatures(sensorName: string): Observable<InfluxSerie[]> {
    return this.query("select * from bmp280_sensors..temperature where \"name\" = '"+sensorName+"' AND time > now() - 6d").pipe(
      map((r) => (r?.results?.[0]?.series ?? []))
    )
  }

  public getVoltageMean(sensorName: string): Observable<number | undefined> {
    return this.query("select mean(*) from bmp280_sensors..voltage where \"name\" = '"+sensorName+"' AND time > now() - 2h ").pipe(
      map((r) => (r?.results?.[0]?.series?.[0]?.values?.[0]?.[1] as number))
    )
  }
}
