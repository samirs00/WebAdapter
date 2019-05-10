import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ChatPreviewComponent } from '../app/components/chat-preview/chat-preview.component'

const routes: Routes = [
  { path: '**', component: ChatPreviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
