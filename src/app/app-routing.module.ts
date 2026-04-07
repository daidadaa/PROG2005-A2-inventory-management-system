import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import { ItemSearchComponent } from './pages/item-search/item-search.component';
import { PrivacySecurityComponent } from './pages/privacy-security/privacy-security.component';
import { HelpComponent } from './pages/help/help.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'manage', component: InventoryManagementComponent },
  { path: 'search', component: ItemSearchComponent },
  { path: 'privacy-security', component: PrivacySecurityComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
