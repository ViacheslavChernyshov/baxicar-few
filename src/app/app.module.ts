import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';
import { MainPageComponent } from './main-page/main-page.component';
import { DriverPageComponent } from './driver-page/driver-page.component';
import { PassengerPageComponent } from './passenger-page/passenger-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import {HttpClientModule} from '@angular/common/http';
import { RegistrationPageComponent } from './registration-page/registration-page.component';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    MainPageComponent,
    DriverPageComponent,
    PassengerPageComponent,
    SettingsPageComponent,
    LoginPageComponent,
    RegistrationPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
