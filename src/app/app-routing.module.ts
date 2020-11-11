import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MainLayoutComponent} from './shared/main-layout/main-layout.component';
import {MainPageComponent} from './main-page/main-page.component';
import {DriverPageComponent} from './driver-page/driver-page.component';
import {PassengerPageComponent} from './passenger-page/passenger-page.component';
import {SettingsPageComponent} from './settings-page/settings-page.component';

const routes: Routes = [
  {
    path: '', component: MainLayoutComponent, children: [
      {path: '', redirectTo: '/', pathMatch: 'full'},
      {path: '', component: MainPageComponent},
      {path: 'driver', component: DriverPageComponent},
      {path: 'passenger', component: PassengerPageComponent},
      {path: 'settings', component: SettingsPageComponent}
    ]
  },
  {
    // path: 'admin', loadChildren: './admin/admin.module#AdminModule'
    path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
