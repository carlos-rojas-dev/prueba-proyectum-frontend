
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
 
@NgModule({ 
   
  imports: [BrowserModule, FormsModule, CommonModule],
  providers: [provideHttpClient(withFetch())]
})
export class AppModule {}
