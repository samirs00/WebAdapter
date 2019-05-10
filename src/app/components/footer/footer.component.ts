import { Component, OnInit, ViewChild } from '@angular/core';

import { DataService } from '../../services/data.service';

// import { AppComponent } from 'src/app/app.component'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  // @ViewChild('chatPreviewComponent') chatPreviewComponent: ChatPreviewComponent;

  message:any = "";

  constructor(public dataService: DataService){
    }
  ngOnInit() {
  }
  // sendMessage(message){
  //   this.message = "";
  //   var obj = {
  //     "MessageAction": "Send",
  //     "BotIntentFlow": {
  //       "message": message,
  //       "date": "22/7/2019"
  //     }
  //   }
  //  this.appComponent.get(obj)
    // this.dataService.addmessageInArray(obj);

    // this.chatPreviewComponent.getMessageFromFooter(obj)
  // }
}
