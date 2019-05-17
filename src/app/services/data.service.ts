import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  data:any = [];
  botDetails:any;
  constructor() { }
  addmessageInArray(obj){
    console.log("addmessageInArray :", obj)
    this.data.push(obj)
  }
  getMessageFromArray(){
    return this.data;
  }
  setBotDetails(botDetails){
    this.botDetails = botDetails
  }
  getBotDetails(){
    return this.botDetails;
  }
}
