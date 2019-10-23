import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  
  botIcon:any;
  localBotIcon:any = "assets/images/e_hd_trans.png"
  constructor(){

    }

  ngOnInit() {
    this.botIcon =this.getParameterByName('imgsrc', window.location.href)
    // console.log("this.botIcon :",this.botIcon);
    if(this.botIcon){
      this.localBotIcon = this.botIcon;
    }
    
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

}
