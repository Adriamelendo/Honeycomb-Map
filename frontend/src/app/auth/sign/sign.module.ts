import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignPageRoutingModule } from './sign-routing.module';

import { SignPage } from './sign.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignPageRoutingModule
  ],
  declarations: [SignPage]
})
export class SignPageModule {}
