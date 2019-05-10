import { Component, ViewChild } from '@angular/core';
// import { FooterComponent } from  "../app/components/footer/footer.component"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ConveeWebChat'; 
  // @ViewChild(FooterComponent) child;

  // get(obj){
  //   console.log("get in app :", this.child.obj)
  // }
}
