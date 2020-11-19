import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainLayoutComponent} from './shared/main-layout/main-layout.component';
import {MainPageComponent} from './main-page/main-page.component';
import {DriverPageComponent} from './driver-page/driver-page.component';
import {PassengerPageComponent} from './passenger-page/passenger-page.component';
import {SettingsPageComponent} from './settings-page/settings-page.component';
import {LoginPageComponent} from './login-page/login-page.component';
// import { LoginPageComponent } from './admin/login-page/login-page.component';
import {HttpClientModule} from '@angular/common/http';
import {RegistrationPageComponent} from './registration-page/registration-page.component';
import {ReactiveFormsModule} from '@angular/forms';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    MainPageComponent,
    DriverPageComponent,
    PassengerPageComponent,
    SettingsPageComponent,
    // LoginPageComponent,
    RegistrationPageComponent,
    LoginPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BsDatepickerModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
