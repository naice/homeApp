import { NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TemperatureControlComponent } from './components/temperature-control/temperature-control.component';
import { MaterialModule } from './material.module';
import { SwitchControlComponent } from './components/switch-control/switch-control.component';
import { GroupComponent } from './components/group/group.component';
import { ButtonControlComponent } from './components/button-control/button-control.component';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { GarageControlComponent } from './components/home-controls/garage-control/garage-control.component';

@NgModule({
  declarations: [
    AppComponent,
    TemperatureControlComponent,
    SwitchControlComponent,
    GroupComponent,
    ButtonControlComponent,
    GarageControlComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    iconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg')
    );
  }}
