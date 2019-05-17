import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service'
import { ApisService } from '../../services/apis.service'
import { DefaultMessage } from '../../classes/common-data'
import * as $ from 'jquery';
// import * as moment from "moment";
// import { NEXT } from '@angular/core/src/render3/interfaces/view';


@Component({
  selector: 'app-chat-preview',
  templateUrl: './chat-preview.component.html',
  styleUrls: ['./chat-preview.component.css']
})
export class ChatPreviewComponent implements OnInit {

  public defaultMessage: DefaultMessage = new DefaultMessage();
    carouselId:string = "sampleId";
    carouselHref:any = "#sampleId";
    botId:any;
    userid:any;
    userName:any;
    dateTime:any;
    authorizationKey:any;
    imageSrc:any;
    localImgSrc:any = "assets/images/e_hd_trans.png"
    showTypingDots:boolean = false;
     sendTypingMessage:any = {
      "isSent": 1,
      "inputType": "string",
      "icon": "field-text",
      "MessageAction":"Common",
      "BotIntentFlow": {
        "data": "assets/images/typing.gif",
        "name": "Text",
      },
    }

    message:any = "";
    messageFlow:any[] = [];
    messageFlowTemp:any[] = [];
  constructor(public dataService: DataService, 
              private apiService :ApisService,
              private route: ActivatedRoute,
              private router:Router ) {}
               
  
  ngOnInit() {
    
    // console.log("URL :", url);
    // const urlParams = new URLSearchParams(window.location.search);
    // const myParam = urlParams.get('authorizationkey');
    // console.log(myParam);
    // var url1 = new URL(window.location.href);
    // console.log(window.location.href);

    // var c = url1.searchParams.get("botid");
    // console.log("Botid :", this.getParameterByName('botid', window.location.href));
    this.botId =this.getParameterByName('botid', window.location.href)
    this.userid =this.getParameterByName('userid', window.location.href)
    // this.userName =this.getParameterByName('username', window.location.href)
    this.authorizationKey =this.getParameterByName('authorizationToken', window.location.href)
    this.imageSrc =this.getParameterByName('imgsrc', window.location.href);
    if(this.imageSrc){
      this.localImgSrc = this.imageSrc;
    }


    // let url = this.router.url;
    // var result = url.split('/');
    // this.botId =result[result.indexOf('botid') + 1]
    // this.tokenId =result[result.indexOf('tokenid') + 1]
    // this.userName =result[result.indexOf('username') + 1]
    // this.authorizationKey =result[result.indexOf('authorizationkey') + 1]
    console.log("botid :", this.botId, "userid :", this.userid, "authorizationToken :", this.authorizationKey, "localImgSrc :", this.localImgSrc)
    // this.welcomeMessage(this.userName)
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
  welcomeMessage(userName){
    let dateTime = this.getDateTimeForSendMessage()
    let FilteredMessageArray = {
      answer: "",
      class: "half",
      data: "Welcome " +userName+ ", How can I help you?",
      icon: "field-text",
      id: "4aa0e37c-bfa4-844b-4609-149df9285bc7",
      inputType: "string",
      isSent: 1,
      name: "Default"
    }
    setTimeout(() => {
      // this.showTypingDots = false;
      this.deleteTypingFromMessageFlow();
      this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray, "dateTime":dateTime });
    }, 2000);
  }
  getMessage(messageObject, type) {
    console.log("Send message :", messageObject.Label || messageObject.IntentName);
    if((messageObject.Label || messageObject.IntentName != "") && (messageObject.Label || messageObject.IntentName != null) && (messageObject.Label || messageObject.IntentName != undefined)){
    this.message = "";
    if(!this.userid){
      this.userid = "userId"
    }
    let header = {
      "botId": this.botId,
      "tokenId": this.userid
    }
    let dateTime = this.getDateTimeForSendMessage()
    var sendMessageObj = {}
    if (type == 'button') {
      sendMessageObj = {
        "MessageAction": "Send",
        "BotIntentFlow": {
          "data": messageObject.Label || messageObject.IntentName,
          "dateTime":dateTime.substr(0,dateTime.indexOf(' ')),                         // only time
          "name": "Text",
        },
        BotId: this.botId,
        // userID: userId,
        message: messageObject.IntentName,
        isLuisCall: 0,
        "dateTime":dateTime
      }
    } else {
      sendMessageObj = {
        "MessageAction": "Send",
        "BotIntentFlow": {
          "data": messageObject.IntentName,
          "dateTime": dateTime.substr(dateTime.indexOf(' ')+1),
          "name": "Text",
        },
        BotId: this.botId,
        // userID: userId,
        message: messageObject.IntentName,
        isLuisCall: 0,
        "dateTime":dateTime
      }
    }
    if(this.checkExitMessage(sendMessageObj)){
      this.showExitMessage(this.defaultMessage.EXIT)
    } else {
        if(this.messageFlowTemp.length == 0){
            //messageFlowTemp is empty
            this.startFlow(sendMessageObj, header)
        }else{
            //data is already present
            console.log("DATA FOUND IN messageFlowTemp :", this.messageFlowTemp);
              this.contineuFlow(sendMessageObj);
        }
    }
  }
  }
  onDateChange(event){
    // console.log("datechange :", event.target.value)
    this.getMessage({'IntentName':event.target.value},'other')
  }
  contineuFlow(sendMessageObj){
    this.showSendMessage(sendMessageObj);
    this.showSendMessage(this.sendTypingMessage);
    // this.showTypingDots = true;
    var result_MessageArray = this.messageFlowTemp;
    this.CheckMessageSendByUser(sendMessageObj, result_MessageArray, (ValdiationResponse) => {
      console.log("CheckMessageSendByUser:ValdiationResposne\n" + JSON.stringify(ValdiationResponse));
      if (ValdiationResponse.isValid === false) {
          let dateTime = this.getDateTimeForSendMessage()
          let sendMessageObj = {
              "data": ValdiationResponse.ReturnMessage,
              "dateTime": dateTime,
              "isSent": 1,
              "inputType": "string",
              "icon": "field-text",
              "name": "Text",
            }
            // this.showTypingDots = false;
            this.deleteTypingFromMessageFlow();
          this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": sendMessageObj, "isSend":0 });
      } else {
          this.messageFlowTemp = result_MessageArray
          this.menageFlow();
      }
  })
  }
  CheckMessageSendByUser(envelope, MessageArray, callback) {
      /*
      * CHECK IF MESSAGE SENT TO USER WAS OF TYPE PROMPTS, IF YES CHECK TEXT ENTERED BY USER 
      * RETURN "isValid" = "TRUE" IF OK ELSE  
      * RETURN "isValid" = "FALSE" AND WITH MESSAGE TO SEND TO USER "ReturnMessage"
      */
      var ResultResponse = {
        isValid: true,
        ReturnMessage: '',
        StartMenuTrigger: false,
        exitConversation: false
      }
      console.log("Last message CheckMessageSendByUser:" + JSON.stringify(MessageArray));
      this.getlastPromptSentToUser(MessageArray, (SentMessage) => {
        console.log("CheckMessageSendByUser SentMessage - " + JSON.stringify(SentMessage))
        console.log("CheckMessageSendByUser envelope - " + JSON.stringify(envelope))
        if (SentMessage) {
          console.log("Last message type is: " + SentMessage.name);
          if (SentMessage.name === 'Prompts') {
            ResultResponse = this.checkIfPromptInputIsCorrect(envelope.BotIntentFlow.data, SentMessage, ResultResponse);
            console.log("ResultResponse :", ResultResponse)
            //LOG ANSWER 
            if (ResultResponse.isValid) {
              SentMessage.answer = envelope.BotIntentFlow.data;
            }
            if (ResultResponse.exitConversation) {
              // clearUserData(envelope.sender_id);
              this.deleteTypingFromMessageFlow();
              this.messageFlowTemp = [];
              return;
            }
            callback(ResultResponse);

          } else if (SentMessage.name === 'Json API') {
            //if last message is a JSON API message
            console.log('Last message is a JSON API message :', SentMessage);
            this.bindParameterAnswerToJsonApi(envelope, SentMessage).then(transformedItems => {
              console.log("transformedItems:" + JSON.stringify(transformedItems));
              SentMessage.attribute = transformedItems;
              this.messageFlowTemp = [SentMessage];
              //Success callback
              callback(ResultResponse);
            })
          } else {
            // if last send message is of any other type
            // LAST SENT MESSAGE WAS NOT PROMPTS
            callback(ResultResponse);
          }
        }
        else {
          //NO LAST SENT MESSAGE FOUND, MAY BE FIRST MESSAGE
          console.info('NO LAST SENT MESSAGE FOUND, MAY BE FIRST MESSAGE');
          callback(ResultResponse);
        }
      });
    }
  bindParameterAnswerToJsonApi(envelope, SentMessage) {
    var attrElement = [];
    return new Promise((resolve, reject) => {
      var binded = false;
      SentMessage.attribute.forEach(element => {
        if (!binded) {
          if (element.isSent === 0) {
            //bind this answer to the question
            if (!isNaN(envelope.BotIntentFlow.data)) {
              element.answer = parseInt(envelope.BotIntentFlow.data)
            } else {
              element.answer = envelope.BotIntentFlow.data;
            }
           
            console.log("\n Question:" + element.question + "\n Answer:" + element.answer)
            this.getEntityInputIfAny(envelope).then(entityInput => {
              if (entityInput) {
                // console.log("entity response :", entityInput[0].entity);
                let entity = entityInput[0].entity
                if (!isNaN(entity)) {
                  element.answer = parseInt(entity)
                }
                else {
                  element.answer = entityInput[0].entity;
                }
              }
            }).catch(err =>{
              console.log("Error in getEntityInputIfAny :", err)
            })
            element.isSent = 1;
            binded = true;
            attrElement.push(element)
          } else {
            attrElement.push(element)
          }
        } else {
          attrElement.push(element)
        }
      })
      resolve(attrElement)
    })
  }

  getEntityInputIfAny(envelope) { 
    var data = {
      "BotId": this.botId,
      "userID": "jasd90q",
      "message": envelope.BotIntentFlow.data,
      "isLuisCall": 0
    }

    return new Promise((resolve, reject) => {
      this.apiService.getEntityFromLuis(data)
        .subscribe(res => {
          console.log("responce od get entity if any :", res)
          if (res && res.result &&res.result.length>0) {
            resolve(res.result)
          }
        }, err => {
          if (err) {
            console.log("Error is occured....");
            reject(err)
          }
        })
    })
  }
  getlastPromptSentToUser(ArrayToFilter, callback) {
    var ResultArray = [];
    if (ArrayToFilter && ArrayToFilter.length) {
      ArrayToFilter.forEach(function (element) {
        if (element.isSent === 1) {
          ResultArray.push(element);
        }
      }, this);
    }
    callback(ResultArray[0]);
  }

  startFlow(data, apiHeader) {
    this.showSendMessage(data);
    this.showSendMessage(this.sendTypingMessage);
    // this.showTypingDots = true;
    this.getFlowFromServer(data, apiHeader).then(data => {
      // console.log("responce of server :", data);
      if(data['BotIntentFlow'].length > 0 && data['IntentName'] != 'None'){
        this.messageFlowTemp = data['BotIntentFlow'];
        this.menageFlow()
      }else{
        this.showMenuTrigger(data['menutrigger'])
      }
    }).catch(err => {
      console.log("Error message startFlow :", err)
      
      this.showDefaultResponce(this.defaultMessage.SERVER_CRASH)
    })
  }

  manageReceivedMessaged(type, FilteredMessageArray){
    console.log("show send Message :", type, FilteredMessageArray)
    var interval = 0;
    let dateTime = this.getDateTimeForSendMessage()
    switch (type) {
      case 'Text':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray, "dateTime":dateTime });
        interval+=1500;
        break;

      case 'Image':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray, "dateTime":dateTime  });
        interval+=1500;
        break;

      case 'Audio':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray, "dateTime":dateTime  });
        interval+=1500;
        break;

      case 'Video':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray, "dateTime":dateTime  });
        interval+=1500;
        break;

      case 'Button':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray, "dateTime":dateTime  });
        interval+=1500;
        break;

      case 'Carousel':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        let id = this.createDynamicId();
        this.showSendMessage({ "MessageAction": "Received","dynamicId":id,"BotIntentFlow": FilteredMessageArray, "dateTime":dateTime  });
        interval+=1500;
        this.addActiveClass(interval);
        break;
      
      case 'Json API':
        // this.showTypingDots = false;
      // console.log("Json API :", FilteredMessageArray)
          var item = FilteredMessageArray;
          //check if request has parameters
          if (item.attribute && item.attribute.length > 0) {
              //parameters are associated with this url
              for (var i = 0; i < item.attribute.length; i++) {
                  var attribute = item.attribute[i];
                  if (attribute.isSent === 0) {
                      // console.log("send message :" , { "MessageAction": "Received","BotIntentFlow": item,"sendMessage": attribute, "isSend":0 });
                      // this.showTypingDots = false;
                      this.deleteTypingFromMessageFlow();
                      this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": item,"sendMessage": attribute, "isSend":0 });
                      break;
                  }
                  //check if this is a last index
                if (i === item.attribute.length - 1) {
                  //we have got all the parameters value from user
                  console.log("we have got all the parameters value from user");
                  this.sendJSONAPIResponse(item,  (result) => {
                    console.log("final callback sendJSONAPIResponse:", result)
                    //mark this message as sent,save in messageFlowTemp
                    FilteredMessageArray.answer_sent = 1;
                    FilteredMessageArray.isSent = 1;
                    // this.messageFlowTemp = FilteredMessageArray
                    this.messageFlowTemp.push(FilteredMessageArray)
                    this.menageFlow();
                  });
                }

              }

          } else {
              // no parameters are associated with this url, directly call this api
              console.log("no parameters are associated with this url, directly call this api")
              this.sendJSONAPIResponse(item, (result) => {
                console.log("final callback sendJSONAPIResponse:", result)
                  //mark this message as sent,save in messageFlowTemp
                  FilteredMessageArray.answer_sent = 1;
                  FilteredMessageArray.isSent = 1;
                  // this.messageFlowTemp = FilteredMessageArray
                  this.messageFlowTemp.push(FilteredMessageArray)
                  this.menageFlow();
              });
          }
        break;

      case 'Prompts':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray,"Button":['YES','NO'] ,"dateTime":dateTime  });
        interval+=1500;
        break;

      case 'Default':
      // this.showTypingDots = false;
      this.deleteTypingFromMessageFlow();
      this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": FilteredMessageArray, "dateTime":dateTime  });
      interval+=1500;
      break;
    }
  }
  sendJSONAPIResponse( message, callback) {
    var url = message.endpoint_url;
    var requestBody = {};
    var content_type = {};
    if (url.indexOf('weather') >= 0) {
      content_type = {
        "content_type": 'application/javascript',
        "authorizationKey": this.authorizationKey
      }
    } else {
      content_type = {
      "content_type" : 'application/json',
      "authorizationKey": this.authorizationKey
      }
    }
    // console.log("ready url :", url, "ready requestBody :", requestBody, "ready content_type :", content_type)
    if (message.attribute.length > 0) {
      if (message.api_type === 'GET') {
          //query string
          url = url + "?";
          message.attribute.forEach(attribute => {
              //get values for all the parameters
              url = url + attribute.key + "=" + attribute.answer + "&&";
          })
          //trim extra characters in url
          url = url.trimRight('&&')
          this.jsonGetRequest(message,url, requestBody, content_type, (data =>{
            callback(data)
          }));
          
      } else {
          message.attribute.forEach(attribute => {
              //get values for all the parameters
              requestBody[attribute.key] = attribute.answer;
          })
          this.jsonPostRquest(message,url, requestBody, content_type, (data =>{
            callback(data)
          }));
          // callback()
      }
  }else{
    if(message.api_type === 'GET'){
      this.jsonGetRequest(message,url, requestBody, content_type, (data)=>{
        callback(data)
      });
    }else{
      this.jsonPostRquest(message,url, requestBody, content_type,(data =>{
        callback(data)
      }));
    }
    // callback()
    
  }
}

  async jsonGetRequest(message ,url, requestBody, content_type, callback){
    try {
      let jsonApiResponse = await this.JsonGetRequest(url, requestBody, content_type);
      var obj = {
        "answer_attributes":message.answer_attributes,
        "jsonResponse" : jsonApiResponse
      }
      let parseJsonResponse:any = await this.parseJson(obj);
      // console.log("parseJsonResponse :", parseJsonResponse);

      message.answer_attributes = parseJsonResponse.answer_attributes;
      var userAnswer = message.answer
      message.answer_attributes.forEach(element => {
        userAnswer=userAnswer.replace( element.key,/*element.key +" : "+ */element.value+"\n");
      });
      console.log("final json get:", userAnswer);
      callback(userAnswer)
      this.sendJsonResultToUI(userAnswer, message);
    } catch (error) {
      this.deleteTypingFromMessageFlow();
      console.log("Error occure in get catch")
    }
  }

  async jsonPostRquest(message ,url, requestBody, content_type, callback){
    try {
      let jsonApiResponse = await this.JsonPostRequest(url, requestBody, content_type);
      var obj = {
        "answer_attributes":message.answer_attributes,
        "jsonResponse" : jsonApiResponse
      }
      let parseJsonResponse:any = await this.parseJson(obj);
      // console.log("parseJsonResponse :", parseJsonResponse);
      message.answer_attributes = parseJsonResponse.answer_attributes;
      var userAnswer = message.answer
      message.answer_attributes.forEach(element => {
        userAnswer=userAnswer.replace( element.key,/*element.key +" : "+ */element.value+"\n");
      });
      console.log("final json post:", userAnswer);
      this.sendJsonResultToUI(userAnswer, message);
      callback(userAnswer)

    } catch (error) {
      this.deleteTypingFromMessageFlow();
      console.log("Error occure in post catch")
    }
  }

  parseJson(data){
    return new Promise((resolve, reject) => {
      this.apiService.JsonParse(data)
        .subscribe(res => {
          // console.log("parseJson API call res:", res)
          if (res) {
            resolve(res)
          }
        }, err => {
          if (err) {
            // console.log("Error is occured....");
            reject(err)
          }
        })
    })
  }

  JsonPostRequest(url, data, content_type){
    return new Promise((resolve, reject) => {
      this.apiService.JsonPostRequest(url, data, content_type)
        .subscribe(res => {
          console.log("JsonPostRequest API call res :", res)
          if (res) {
            resolve(res)
          }
        }, err => {
          if (err) {
            // console.log("Error is occured....");
            reject(err)
          }
        })
    })
  }

  JsonGetRequest(url, data, content_type){
    return new Promise((resolve, reject) => {
      this.apiService.JsonGetRequest(url, data, content_type)
        .subscribe(res => {
          console.log("JsonGetRequest API call res :", res)
          if (res) {
            resolve(res)
          }
        }, err => {
          if (err) {
            // console.log("Error is occured....");
            reject(err)
          }
        })
    })
  }

  sendJsonResultToUI(userAnswer, message){
      console.log("sendJsonResultToUI :", userAnswer);
      let dateTime = this.getDateTimeForSendMessage()
      var msgChunk = userAnswer.match(/.{1,639}/g);
      // console.log("msgChunk :", msgChunk);
      msgChunk.forEach(element => {
        var attribute = {
          "question":element
        }
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received","BotIntentFlow": message,"sendMessage": attribute, "dateTime":dateTime });
      });
  }

  menageFlow() {
    // console.log("ManageFlows");
    var MessageArray = this.messageFlowTemp;
    // console.log("MessageArray :", MessageArray)
    var FilteredMessageArray = this.filterArray(MessageArray);
    if (FilteredMessageArray.length > 0) {
      console.log("FilteredMessageArray.length > 0")
      this.manageReceivedMessaged(FilteredMessageArray[0].name, FilteredMessageArray[0]);

      // UPDATE FLAG IN ARRAY
      FilteredMessageArray[0].isSent = 1;
      if (FilteredMessageArray[0].name === 'Json API' && this.checkIfAllAttribSent(FilteredMessageArray[0])) {
        // console.log("Check All attribute in array :", FilteredMessageArray[0])
        return;
      }

      // UPDATE TO CONTEXT
      this.messageFlowTemp = FilteredMessageArray
      // console.log("UPDATE MessageArray :", MessageArray)
      if (FilteredMessageArray[0].name !== 'Prompts' && FilteredMessageArray[0].name !== 'Location' && FilteredMessageArray[0].name !== 'Json API') {
        console.log("RECURSION CALLED - " + FilteredMessageArray[0].name)
        this.menageFlow();
      }
    }
    else {
      console.log("FilteredMessageArray.length <= 0");
      this.deleteTypingFromMessageFlow();
      this.messageFlowTemp = [];
    }
  }

  checkIfAllAttribSent(message) {
    //check if all attribure are set
    var allAttribSent = true;
    if (message.attribute && message.attribute.length > 0) {
      for (var i = 0; i < message.attribute.length; i++) {
        if (message.attribute[i].isSent === 0) {
          allAttribSent = false;
        }
      }
    }
    // console.log("checkIfAllAttribSent:" + allAttribSent);
    return allAttribSent;
  }
  filterArray(ArrayToFilter) {
    var ResultArray = [];
    if (ArrayToFilter && ArrayToFilter.length) {
      ArrayToFilter.forEach(function (element) {
        if (element.name === 'Json API' && element.answer_sent != 1) {
          ResultArray.push(element);
        }
        else if (element.isSent === 0) {
          ResultArray.push(element);
        }
      }, this);
    }
    return ResultArray
    // callback(ResultArray);
  }
    // send menu trigger option
  showMenuTrigger(menutrigger){
    let dateTime = this.getDateTimeForSendMessage()   
    let defaultMessage = {
      "MessageAction": "Received",
      "BotIntentFlow": {
        "data": menutrigger.MenuMessage,
        "buttonoptions": menutrigger.MenuIntent,
        "date": dateTime,                   
        "name": 'Button'
      },
      BotId: this.botId,
      message: menutrigger.MenuMessage,
      isLuisCall: 0,
      "dateTime": dateTime
    }
    this.deleteTypingFromMessageFlow();
    this.showSendMessage(defaultMessage)
    // this.messageFlow.push(defaultMessage);
    // this.scrollIntoView();
  }

// send message when server get crash and user say exit
  showDefaultResponce(message){
    let dateTime = this.getDateTimeForSendMessage()
    let defaultMessage = {
      "MessageAction": "Received",
      "BotIntentFlow": {
        "data": message,
        "date": dateTime,                   
        "name": 'Default'
      },
      BotId: this.botId,
      message: message,
      isLuisCall: 0,
      "dateTime": dateTime
    }
    this.deleteTypingFromMessageFlow();
    this.showSendMessage(defaultMessage)
    // this.messageFlow.push(defaultMessage);
    // this.scrollIntoView();
  }
  getFlowFromServer(data, header) {
    return new Promise((resolve, reject) => {
      this.apiService.getResponseFlow(data, header)
        .subscribe(res => {
          if (res.result) {
            resolve(res.result)
          }
        }, err => {
          if (err) {
            console.log("Error is occured....: ", err);
            reject(err)
          }
        })
    })
  }

  //show exit message 
  showExitMessage(message) {
    let dateTime = this.getDateTimeForSendMessage()
    let obj = {
      "MessageAction": "Received",
      "BotIntentFlow": {
        "data": message,
        "date": dateTime,
        "name": "Default",
      },
      BotId: this.botId,
      message: message,
      isLuisCall: 0,
      "dateTime": dateTime
    }
    this.deleteTypingFromMessageFlow();
    this.showSendMessage(obj);
    // this.messageFlow.push(obj);
    // this.scrollIntoView();
    this.messageFlowTemp = [];
    // this.showTypingDots = true;
  }

  checkExitMessage(messageObj){
    if(messageObj.message == 'Exit' || messageObj.message == 'exit'){
      // this.showTypingDots = false;
      this.deleteTypingFromMessageFlow();
      this.showSendMessage(messageObj);
      return true
    }else{
      return false
    }
  }

  // push message to messageflow send and received message
showSendMessage(messageObj){
  // console.log("Send message :", sendMessageObj)
  this.messageFlow.push(messageObj);
  this.scrollIntoView();
  this.logMessage(messageObj)
}
// scroll to new added message
scrollIntoView() {         
  setTimeout(() => {
    document.getElementById('ChatView').scrollTo(0, document.getElementById('ChatView').scrollHeight);
  });
}
getDateTimeForSendMessage(){
  var today = new Date();
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + ' ' + time;
  return dateTime
  // callback(time)
}
imgLoad(item){
  console.log("image is load:", item)
  this.scrollIntoView();
}

checkIfPromptInputIsCorrect(text, SentMessage, ResultResponse) {

  /*
   * CHECK IF MESSAGE SENT TO USER WAS OF TYPE PROMPTS, IF YES CHECK TEXT ENTERED BY USER 
   * RETURN "isValid" = "TRUE" IF OK ELSE  
   * RETURN "isValid" = "FALSE" AND WITH MESSAGE TO SEND TO USER "ReturnMessage"
   */
  switch (SentMessage.entityType) {
    case '@sys.date':
      {
          var today = new Date(text);
          // console.log("today: ", JSON.stringify(today))
          var tday = JSON.stringify(today)
          if(tday != "null"){
            ResultResponse.isValid = true
          }else{
            ResultResponse.isValid = false;
            ResultResponse.ReturnMessage = "Please enter valid date";
          }
      }
      break;
    case '@sys.number':
      {
        if (isNaN(text)) {
          ResultResponse.isValid = false;
          ResultResponse.ReturnMessage = "Please enter valid number";
        }
        else {
          ResultResponse.isValid = true;
        }
      }
      break;
    case '@sys.email':
      {
        if (text.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/) != null) {
          ResultResponse.isValid = true;
        }
        else {
          ResultResponse.isValid = false;
          ResultResponse.ReturnMessage = "Please enter valid email";
        }

      }
      break;
    case '@sys.duration':
      {
        ResultResponse.isValid = true;
        ResultResponse.ReturnMessage = "Please enter valid duration";
      }
      break;
    case '@sys.string':
      {
        ResultResponse.isValid = true;
        ResultResponse.ReturnMessage = "";
      }
      break;
    case '@sys.percentage':
      {
        var text = text;
        //remove unwanted keywards,expressions,symbols
        text = text.replace('%', '');
        text = text.replace('percentage', '');
        text = text.replace('percentile', '');

        if (parseInt(text) <= 0 || parseInt(text) > 100 || isNaN(text)) {
          ResultResponse.isValid = false;
          ResultResponse.ReturnMessage = "Please enter valid percentage";
        }
        else {
          ResultResponse.isValid = true;
        }
      }
      break;
    case '@sys.age':
      {
        if (parseInt(text) >= 120||isNaN(parseInt(text))) {
          ResultResponse.isValid = false;
          ResultResponse.ReturnMessage = "Please enter valid age";
        }
        else {
          ResultResponse.isValid = true;
        }
      }
      break;
    case '@sys.confirm':
      {
        if (
          text.toLowerCase() === 'yes' || text.toLowerCase() === 'yup' ||
          text.toLowerCase() === 'yea' || text.toLowerCase() === 'y' ||
          text.toLowerCase() === '1' || text.toLowerCase() === 'no' ||
          text.toLowerCase() === 'nope' || text.toLowerCase() === 'na' ||
          text.toLowerCase() === 'n' || text.toLowerCase() === '0') {

          // SET VALID FLAG
          ResultResponse.isValid = true;
          if (
            text.toLowerCase() === 'yes' || text.toLowerCase() === 'yup' ||
            text.toLowerCase() === 'yea' || text.toLowerCase() === 'y' ||
            text.toLowerCase() === '1') {

            // SET IF WE NEED MENU TRIGGER
            ResultResponse.StartMenuTrigger = false;
            ResultResponse.ReturnMessage = "Please enter valid option as yes or no";
          }
          else {
            // SET IF WE NEED MENU TRIGGER
            //user has confirmed 'No' as an answer, so exit current conversation

            ResultResponse.exitConversation=true;
            ResultResponse.StartMenuTrigger = false;
          }
        }
        else {
          ResultResponse.ReturnMessage = "Please type 'yes' or 'no'";
          ResultResponse.isValid = false;
          //ResultResponse.ReturnMessage = SentMessage.data + ", Please enter valid option Yes or No?";
          ResultResponse.StartMenuTrigger = false;

        }
      }
      break;

      case '@sys.choice':
      {
        if (
          text.toLowerCase() === 'yes' || text.toLowerCase() === 'yup' ||
          text.toLowerCase() === 'yea' || text.toLowerCase() === 'y' ||
          text.toLowerCase() === '1' || text.toLowerCase() === 'no' ||
          text.toLowerCase() === 'nope' || text.toLowerCase() === 'na' ||
          text.toLowerCase() === 'n' || text.toLowerCase() === '0') {

          // SET VALID FLAG
          ResultResponse.isValid = true;
          ResultResponse.StartMenuTrigger = false;
          ResultResponse.ReturnMessage = "Ok";

        }
        else {
          ResultResponse.ReturnMessage = "Please type 'yes' or 'no'";
          ResultResponse.isValid = false;
          ResultResponse.StartMenuTrigger = false;

        }
      }
      break;

    default:
      console.log("Entity type not found..");
  }

  return ResultResponse;
}

 // activate first image in carousel
 addActiveClass(interval) {
  setTimeout(() => {
    $(document).ready(function () {
      $('.carousel').each(function () {
        $(this).find('.carousel-item').eq(0).addClass('active');
      });
    });
  }, 1500);

}
// create dynamic Id for carousel card
createDynamicId(){
  var today = new Date();
  var date = today.getFullYear()+'y'+(today.getMonth()+1)+'m'+today.getDate();
  var time = today.getHours() + "h" + today.getMinutes() + "s" + today.getSeconds() + today.getMilliseconds();
  var id = 'id'+date+time;
  return id
}

logMessage(messageObj){

  var logBody =
  {
    UserId: this.userid,
    BotId: this.botId,
    MessageAction: messageObj.MessageAction,
    EndUserId: "userId",
    Platform: 'Web chat',
    MessageType: messageObj.BotIntentFlow.name,
    Message: messageObj,
    PlatformType: "TEXT"
  }
  this.apiService.logMessage(logBody)
    .subscribe(res => {
      if (res.result) {
        console.log("Succssfully save log")
      }
    }, err => {
      if (err) {
        console.log("Error is occured to save log");
      }
    })
}

deleteTypingFromMessageFlow(){
  var removeIndex = this.messageFlow.map(function(item) { return item.MessageAction; }).indexOf("Common");
  // console.log("remove index :", removeIndex);
  if(removeIndex != -1){
    this.messageFlow.splice(removeIndex, 1);
  }
  
  // console.log("in delete typing from messageflow :", this.messageFlow);
  // callback();
}



  // sendJsonApiPrompt(messageObject, date){
  //   console.log("BotIntentFlow of JSON or prompt :", messageObject);
  //   if(messageObject.BotIntentFlow.name == "Prompts"){
  //       this.sendMessageToUI(messageObject)
  //   }else{
  //   }
  // }
  // send message when server get crash and user say exit
  // defaultResponce(message, timeNow){
  //   let defaultMessage = {
  //     "MessageAction": "Received",
  //     "BotIntentFlow": {
  //       "data": message,
  //       "date": timeNow,                   
  //       "name": 'Default'
  //     }
  //   }
  //   this.setTimeIntervalBetweenFlow(defaultMessage, 1500)
  // }
  // this is for time interval between message flow
  // setTimeIntervalBetweenFlow(messageObj, time) {  
  //     this.sendMessageToUI(messageObj);
  //     // setTimeout(() => {
  //     //   this.sendMessageToUI(messageObj)
  //     // }, time);
  // }
  // checkLastAddedMessage() {
  //   var val = this.messageFlow[this.messageFlow.length - 1];
  //   console.log("last added message in checkLastAddedMessage :", val);
  //   if (val == undefined) {
  //     return true
  //   } else {
  //     if (val.BotIntentFlow.name == 'Prompts' || val.BotIntentFlow.name == 'Json API' ) {
  //       return false
  //     } else {
  //       return true
  //     }
  //   }
  // }
  // manage message flow
  // showResponceToUI(){
  //   // this.messageFlowTemp
  //   let interval = 1500;
  //   for(var a = 0; a< this.messageFlowTemp.length; a++){
  //     switch (this.messageFlowTemp[a].name) {
  //       case 'Text':
  //         console.log("text message")
  //         this.setTimeIntervalBetweenFlow({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0 }, interval);
  //         interval+=1500;
  //         break;

  //       case 'Image':
  //         this.setTimeIntervalBetweenFlow({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //         interval+=1500;
  //         break;

  //       case 'Audio':
  //         this.setTimeIntervalBetweenFlow({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //         interval+=1500;
  //         break;

  //       case 'Video':
  //         this.setTimeIntervalBetweenFlow({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //         interval+=1500;
  //         break;

  //       case 'Button':
  //         this.setTimeIntervalBetweenFlow({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //         interval+=1500;
  //         break;

  //       case 'Carousel':
  //         let id = this.createDynamicId();
  //         this.setTimeIntervalBetweenFlow({ "MessageAction": "Received","dynamicId":id,"BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //         interval+=1500;
  //         this.addActiveClass(interval);
  //         break;
        
  //       case 'Json API':
  //         this.sendJsonApiPrompt({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //         interval+=1500;
  //         break;

  //       case 'Prompts':
  //         this.sendJsonApiPrompt({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //         interval+=1500;
  //         break;

  //       case 'Default':
  //       this.setTimeIntervalBetweenFlow({ "MessageAction": "Received","BotIntentFlow": this.messageFlowTemp[a], "isSend":0  }, interval);
  //       interval+=1500;
  //       break;
  //     }
  //   }
  // }
  // sendMessageToUI(messageObj){
  //   if(this.checkLastAddedMessage()){
  //     messageObj['isSend'] = 1
  //     this.messageFlow.push(messageObj);
  //     this.scrollIntoView();
  //     console.log("to be deleted :", messageObj);
  //     // console.log("to be deleted messageFlowTemp:", this.messageFlowTemp);
  //   }else if(messageObj.isSend === 1){
  //     console.log("last message is prompt");
  //     this.messageFlow.push(messageObj);
  //     this.scrollIntoView();
  //   }
  //     // this.messageFlow.push(messageObj);
  //     // this.scrollIntoView();
  // }

}
 




  

