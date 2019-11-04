import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service'
import { ApisService } from '../../services/apis.service';
import { DefaultMessage } from '../../classes/common-data';
import { MessageType } from '../../classes/common-data';
import * as $ from 'jquery';
import { PaymentOption } from '../../services/custom-option'
import { IMyDpOptions } from 'mydatepicker';

import * as jsonpath from "jsonpath";
import * as each from "sync-each";

// import { CreditCardValidator } from 'angular-cc-library';
// import * as moment from "moment";
// import { NEXT } from '@angular/core/src/render3/interfaces/view';


@Component({
  selector: 'app-chat-preview',
  templateUrl: './chat-preview.component.html',
  styleUrls: ['./chat-preview.component.css']
})
export class ChatPreviewComponent implements OnInit {

  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'mm.dd.yyyy',
    selectorWidth: ''
  };
  public paymentOption: PaymentOption = {};

  public defaultMessage: DefaultMessage = new DefaultMessage();
  public messageType = MessageType
  carouselId: string = "sampleId";
  carouselHref: any = "#sampleId";
  botId: any;
  userId: any;
  userName: any;
  dateTime: any;
  authorizationKey: any;
  imageSrc: any;
  localImgSrc: any = "assets/images/e_hd_trans.png"
  showTypingDots: boolean = false;
  sendTypingMessage: any = {
    "isSent": 1,
    "inputType": "string",
    "icon": "field-text",
    "MessageAction": "Common",
    "textFlow": {
      "data": "assets/images/typing.gif",
      "name": "Text",
    },
  }

  message: any = "";
  messageFlow: any[] = [];
  messageFlowTemp: any[] = [];
  dynamicStyle: any = {
    'receivedMessageBackground': '#fff9d1',
    'sendMessageTextColor': "#030f09",
    'sendMessageBackground': '#FFE01B',
    'receivedMessageTextColor': "#030f09",
    'headerBackground': '#FFFFFF',
    'headerTextColor': "#000000",
    'buttonBorderColor': "#ffe01b",
    'buttonHoverColor': "#ffe01b",
    'buttonTextColor': "#000"
  }
  constructor(public dataService: DataService,
    private apiService: ApisService,
    private route: ActivatedRoute,
    private router: Router) { }


  ngOnInit() {

    this.botId = this.getParameterByName('dialogid', window.location.href)
    this.userId = this.getParameterByName('userid', window.location.href)
    this.imageSrc = this.getParameterByName('dialogimg', window.location.href);
    if (this.imageSrc) {
      this.localImgSrc = this.imageSrc;
    }
    console.log("botid :", this.botId, "userid :", this.userId, "authorizationtoken :", this.authorizationKey, "localImgSrc :", this.localImgSrc)
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
  welcomeMessage(userName) {
    let dateTime = this.getDateTimeForSendMessage()
    let FilteredMessageArray = {
      answer: "",
      class: "half",
      data: "Welcome " + userName + ", How can I help you?",
      icon: "field-text",
      id: "4aa0e37c-bfa4-844b-4609-149df9285bc7",
      inputType: "string",
      isSent: 1,
      name: "Default"
    }
    setTimeout(() => {
      // this.showTypingDots = false;
      this.deleteTypingFromMessageFlow();
      this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
    }, 2000);
  }
  getMessage(messageObject, type) {
    if (messageObject.title && messageObject.title != "" && messageObject.title != undefined) {
      this.message = "";
      if (!this.userId) {
        this.userId = "userId"
      }
      let header = {
        "botId": this.botId,
        "tokenId": this.userId
      }
      let dateTime = this.getDateTimeForSendMessage()
      var sendMessageObj = {}
      if (type == 'button') {
        sendMessageObj = {
          "MessageAction": "Send",
          "textFlow": {
            "data": messageObject.selectedBlock || messageObject.title,
            "title": messageObject.title,
            "dateTime": dateTime.substr(dateTime.indexOf(' ') + 1),                         // only time
            "name": "Text",
          },
          BotId: this.botId,
          userID: this.userId,
          message: messageObject.selectedBlock,
          isLuisCall: 0,
          "dateTime": dateTime
        }
      } else {
        sendMessageObj = {
          "MessageAction": "Send",
          "textFlow": {
            "data": messageObject.title,
            "title": messageObject.title,
            "dateTime": dateTime.substr(dateTime.indexOf(' ') + 1),
            "name": "Text",
          },
          BotId: this.botId,
          userID: this.userId,
          message: messageObject.title,
          isLuisCall: 0,
          "dateTime": dateTime
        }
      }
      if (this.checkExitMessage(sendMessageObj)) {
        this.showExitMessage(this.defaultMessage.EXIT)
      } else {
        if (this.messageFlowTemp.length == 0) {
          //messageFlowTemp is empty
          this.startFlow(sendMessageObj, header, 'other')
        } else {
          //data is already present
          // console.log("DATA FOUND IN messageFlowTemp :", this.messageFlowTemp);
          this.contineuFlow(sendMessageObj);
        }
      }
    }
  }
  // getMessage2(messageObject, type){

  // }
  onDateChange(event) {
    // console.log("datechange :", event.formatted)
    this.getMessage({ 'title': event.formatted }, 'other')
  }
  handleAddressChange(event) {
    // // console.log("handleAddressChange :", event);
    this.getMessage({ 'IntentName': event.formatted_address }, 'other')
  }
  contineuFlow(sendMessageObj) {
    this.showSendMessage(sendMessageObj);
    this.showSendMessage(this.sendTypingMessage);
    var result_MessageArray = this.messageFlowTemp;
    this.CheckMessageSendByUser(sendMessageObj, result_MessageArray, (ValdiationResponse) => {
      // console.log("CheckMessageSendByUser:ValdiationResposne\n" + JSON.stringify(ValdiationResponse));

      if (ValdiationResponse.StartMenuTrigger) {
        // SendMenuTrigger(envelope.sender_id, result_MenuTrigger);
      } else if (ValdiationResponse.isValid === false) {
        let dateTime = this.getDateTimeForSendMessage()
        let sendMessageObj = {
          "data": ValdiationResponse.ReturnMessage,
          "title": ValdiationResponse.ReturnMessage,
          "dateTime": dateTime,
          "isSent": 1,
          "inputType": "string",
          "icon": "field-text",
          "name": "Text",
        }
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": sendMessageObj, "isSend": 0 });
      }
      else {
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
    // // console.log("Last message CheckMessageSendByUser:" + JSON.stringify(MessageArray));
    this.getlastPromptSentToUser(MessageArray, (SentMessage) => {
      if (SentMessage) {
        // console.log("Last message type is: " + SentMessage.name);
        if (SentMessage.name == this.messageType.USER_INPUT) {
          this.deleteTypingFromMessageFlow();
          ResultResponse = this.checkIfPromptInputIsCorrect(envelope.textFlow.data, SentMessage, ResultResponse);
          // // console.log("ResultResponse :", ResultResponse)
          //LOG ANSWER 
          if (ResultResponse.isValid) {
            SentMessage.answer = envelope.textFlow.data;
          }
          if (ResultResponse.exitConversation) {
            // clearUserData(envelope.sender_id);
            this.deleteTypingFromMessageFlow();
            this.messageFlowTemp = [];
            return;
          }
          callback(ResultResponse);

        } else if (SentMessage.name == this.messageType.JSON_API) {
          //if last message is a JSON API message
          // console.log('Last message is a JSON API message :', SentMessage);
          this.bindParameterAnswerToJsonApi(envelope, SentMessage).then(transformedItems => {
            // console.log("transformedItems:" + JSON.stringify(transformedItems));
            SentMessage.attribute = transformedItems;
            this.messageFlowTemp = [SentMessage];
            //Success callback
            callback(ResultResponse);
          })
        } else if (SentMessage.name === this.messageType.QUICK_REPLIES) {
          ResultResponse = this.checkIfQuickRepliesIsCorrect(envelope.textFlow.data, SentMessage, ResultResponse)
          if (ResultResponse.isValid) {
            SentMessage.answer = envelope.textFlow.data;
          }
          if (ResultResponse.exitConversation) {
            this.deleteTypingFromMessageFlow();
            this.messageFlowTemp = [];
            return;
          }
          callback(ResultResponse);
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
            if (!isNaN(envelope.textFlow.data)) {
              element.answer = parseInt(envelope.textFlow.data)
            } else {
              element.answer = envelope.textFlow.data;
            }
            // // console.log("\n Question:" + element.question + "\n Answer:" + element.answer)
            // this.getEntityInputIfAny(envelope).then(entityInput => {
            //   if (entityInput) {
            //     // // // console.log("entity response :", entityInput[0].entity);
            //     let entity = entityInput[0].entity
            //     if (!isNaN(entity)) {
            //       element.answer = parseInt(entity)
            //     }
            //     else {
            //       element.answer = entityInput[0].entity;
            //     }
            //   }
            // }).catch(err => {
            //   console.log("Error in getEntityInputIfAny :", err)
            // })
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
      "message": envelope.textFlow.data,
      "isLuisCall": 0
    }

    return new Promise((resolve, reject) => {
      this.apiService.getEntityFromLuis(data)
        .subscribe(res => {
          // // console.log("responce od get entity if any :", res)
          if (res && res.result && res.result.length > 0) {
            resolve(res.result)
          }
        }, err => {
          if (err) {
            // // console.log("Error is occured....");
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
  /**
   * Find user input object and return separate array of user inputs
   * work for bot-text and voice
   * @param {*} flow 
   */
  getSeparatedUserInputs(flow) {
    for (let i = 0; i < flow.length; i++) {
      var flowElement = flow[i];
      if (flowElement.name == this.messageType.USER_INPUT) {
        for (let j = 0; j < flowElement.data.length; j++) {
          flowElement.data[j].name = flowElement.name;
        }
        //add this at position i
        flow.splice(i, 1, ...flowElement.data)
        i = i + flowElement.data.length - 1;
      }

    }
    return flow;
  }
  startFlow(data, apiHeader, type) {
    if (type === 'other') {
      this.showSendMessage(data);
      this.showSendMessage(this.sendTypingMessage);
    }
    // this.showSendMessage(this.sendTypingMessage);
    // this.showTypingDots = true;
    this.getFlowFromServer(data, apiHeader).then(res => {

      // console.log("responce of server :", data);
      if (res['block'] || res['defaultResponse']) {
        var data = {};
        if (res['block']) {
          data['textFlow'] = res['block'].textFlowTemp
        }
        if (res['entities']) {
          data['entities'] = res['entities']
        }
        if (res['defaultResponse']) {
          data['defaultResponse'] = res['defaultResponse']
        }


        if (data['textFlow'] && data['textFlow'].length > 0) {
          //we  get array of user input, separate these user input from array and add it to conversation flow
          //this will require little coding and provide more readability and flexibility.
          this.messageFlowTemp = this.getSeparatedUserInputs(data['textFlow']);
          this.menageFlow();
        } else {
          if (data['defaultResponse']) {
            this.showMenuTrigger(data['defaultResponse'])
          } else {
            console.log("no data for user input");
            this.showDefaultResponce(this.defaultMessage.NOT_SURE)
          }
        }
      } else {
        console.log("getFlowForMessage  -- NO DATA FROM API FOR MEESAGE ARRAY");
        this.showDefaultResponce(this.defaultMessage.NOT_SURE)
      }
    }).catch(err => {
      console.log("Error message startFlow :", err)
      this.showDefaultResponce(this.defaultMessage.SERVER_CRASH)
    })
  }

  manageReceivedMessaged(type, FilteredMessageArray) {
    // console.log("manageReceivedMessaged :", type, FilteredMessageArray)
    var interval = 0;
    let dateTime = this.getDateTimeForSendMessage()
    switch (type) {
      case this.messageType.TEXT:
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;

      case this.messageType.IMAGE:
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;

      case this.messageType.AUDIO:
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;

      case this.messageType.VIDEO:
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;

      case this.messageType.USER_INPUT:
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "Button": ['YES', 'NO'], "dateTime": dateTime });
        interval += 1500;
        break;

      case this.messageType.QUICK_REPLIES:
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;

      case this.messageType.CAROUSEL:
        this.deleteTypingFromMessageFlow();
        let id = this.createDynamicId();
        this.showSendMessage({ "MessageAction": "Received", "dynamicId": id, "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        this.addActiveClass(interval);
        break;

      case this.messageType.REDIRECT:
        this.deleteTypingFromMessageFlow();
        this.redirectFlow(FilteredMessageArray, dateTime)
        interval += 1500;
        break;

      case this.messageType.JSON_API:
        // console.log("Json API :", FilteredMessageArray)
        var item = FilteredMessageArray;
        //check if request has parameters
        if (item.attribute && item.attribute.length > 0) {
          //parameters are associated with this url
          for (var i = 0; i < item.attribute.length; i++) {
            var attribute = item.attribute[i];
            if (attribute.isSent === 0) {
              // console.log("send message :" , { "MessageAction": "Received","textFlow": item,"sendMessage": attribute, "isSend":0 });
              this.deleteTypingFromMessageFlow();
              this.showSendMessage({ "MessageAction": "Received", "textFlow": item, "sendMessage": attribute, "isSend": 0 });
              break;
            }
            //check if this is a last index
            if (i === item.attribute.length - 1) {
              //we have got all the parameters value from user
              // // console.log("we have got all the parameters value from user");
              this.sendJSONAPIResponse(item, (result) => {
                // // console.log("final callback sendJSONAPIResponse:", result)
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
          // // console.log("no parameters are associated with this url, directly call this api")
          this.sendJSONAPIResponse(item, (result) => {
            // // console.log("final callback sendJSONAPIResponse:", result)
            //mark this message as sent,save in messageFlowTemp
            FilteredMessageArray.answer_sent = 1;
            FilteredMessageArray.isSent = 1;
            // this.messageFlowTemp = FilteredMessageArray
            this.messageFlowTemp.push(FilteredMessageArray)
            this.menageFlow();
          });
        }
        break;

      case 'Button':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;

      case 'Payment':
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;

      case 'Default':
        // this.showTypingDots = false;
        this.deleteTypingFromMessageFlow();
        this.showSendMessage({ "MessageAction": "Received", "textFlow": FilteredMessageArray, "dateTime": dateTime });
        interval += 1500;
        break;
    }
  }
  sendJSONAPIResponse(message, callback) {
    var url = message.endpoint_url;
    var requestBody = {};
    var content_type = {};
    var header = false;
    // if (!this.authorizationKey) {
    //   this.authorizationKey = "authorizationKey"
    // }
    if (url.indexOf('weather') >= 0) {
      content_type = {
        "content_type": 'application/javascript',
        "key": message.authorizationKey,
        "value": message.authorization
      }
      if (content_type['key'] != "" && content_type['value'] != "") {
        header = true
      }
    } else {
      content_type = {
        "content_type": 'application/json',
        "key": message.authorizationKey,
        "value": message.authorization
      }
      if (content_type['key'] != "" && content_type['value'] != "") {
        header = true
      }
    }
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
        console.log("get url :", url)
        this.jsonGetRequest(message, url, requestBody, content_type, header, (data => {
          callback(data)
        }));
      } else {
        message.attribute.forEach(attribute => {
          //get values for all the parameters
          requestBody[attribute.key] = attribute.answer;
        })
        this.jsonPostRquest(message, url, requestBody, content_type, header, (data => {
          callback(data)
        }));
      }
    } else {
      if (message.api_type === 'GET') {
        //query string
        url = url + "?";
        message.attribute.forEach(attribute => {
          //get values for all the parameters
          url = url + attribute.key + "=" + attribute.answer + "&&";
        })
        //trim extra characters in url
        url = url.trimRight('&&')
        console.log("get url :", url)
        this.jsonGetRequest(message, url, requestBody, content_type, header, (data) => {
          callback(data)
        });
      } else {
        this.jsonPostRquest(message, url, requestBody, content_type, header, (data => {
          callback(data)
        }));
      }
    }
  }

  redirectFlow(messageObject, dateTime) {
    let sendMessageObj = {
      "MessageAction": "Send",
      "textFlow": {
        "data": messageObject.data,
        "title": messageObject.data,
        "dateTime": dateTime.substr(dateTime.indexOf(' ') + 1),
        "name": "Text",
      },
      BotId: this.botId,
      userID: this.userId,
      message: messageObject.data,
      isLuisCall: 0,
      "dateTime": dateTime
    }
    this.messageFlowTemp = [];
    this.startFlow(sendMessageObj, 'apiHeader', 'redirect')
  }

  async jsonGetRequest(message, url, requestBody, content_type, header, callback) {
    try {
      let getRequest = {
        "apiType": "GET",
        "url": url,
        "requestBody": requestBody,
        "authorizationKey": content_type.authorizationKey,
        "content_type": content_type.content_type,
        "answer_attributes": message.answer_attributes,
        "json_card": message
      }
      console.log("final json get request:", getRequest);
      let jsonApiResponse = await this.jsonGetApi(getRequest);
      message['data'] = jsonApiResponse;
      this.parseJsonApiResponse(message, (response => {
        console.log("final json get response:", response);
        this.sendJsonResultToUI(response, message);
        callback(jsonApiResponse)
      }))
    } catch (error) {
      // console.log("Error occure in get catch")
      let dateTime = this.getDateTimeForSendMessage()
      this.deleteTypingFromMessageFlow();
      if (message.defaultAnswer != "") {
        var attribute = {
          "question": message.defaultAnswer
        }
        this.showSendMessage({ "MessageAction": "Received", "textFlow": message, "sendMessage": attribute, "dateTime": dateTime });
      }
      callback(attribute)
    }
  }
  async jsonPostRquest(message, url, requestBody, content_type, header, callback) {
    try {
      let postRequest = {
        "apiType": "POST",
        "url": url,
        "requestBody": requestBody,
        "authorizationKey": content_type,
        "content_type": content_type.content_type,
        "answer_attributes": message.answer_attributes,
        "json_card": message,
        "header": header
      }
      console.log("final json post request:", postRequest);
      let jsonApiResponse = await this.jsonPostApi(postRequest);
      message['data'] = jsonApiResponse;
      this.parseJsonApiResponse(message, (response => {
        console.log("final json post response:", response);
        this.sendJsonResultToUI(response, message);
        callback(jsonApiResponse)
      }))
    } catch (error) {
      // console.log("Error occure in post catch")
      let dateTime = this.getDateTimeForSendMessage()
      this.deleteTypingFromMessageFlow();
      if (message.defaultAnswer != "") {
        var attribute = {
          "question": message.defaultAnswer
        }
        this.showSendMessage({ "MessageAction": "Received", "textFlow": message, "sendMessage": attribute, "dateTime": dateTime });
      }
      callback(attribute)
    }
  }
  sendJsonResultToUI(userAnswer, message) {
    // // // console.log("sendJsonResultToUI :", userAnswer);
    let dateTime = this.getDateTimeForSendMessage()
    var msgChunk = userAnswer.match(/.{1,639}/g);
    // // // console.log("msgChunk :", msgChunk);
    msgChunk.forEach(element => {
      var attribute = {
        "question": element
      }
      // this.showTypingDots = false;
      this.deleteTypingFromMessageFlow();
      this.showSendMessage({ "MessageAction": "Received", "textFlow": message, "sendMessage": attribute, "dateTime": dateTime });
    });
  }
  jsonPostApi(data) {
    return new Promise((resolve, reject) => {
      this.apiService.jsonPostRequest(data)
        .subscribe(res => {
          if (res) {
            resolve(res)
          } else {
            reject(null)
          }
        }, err => {
          if (err) {
            console.log("Error is occured jsonPostApi :", err);
            reject(err)
          }
        })
    })
  }

  jsonGetApi(data) {
    return new Promise((resolve, reject) => {
      this.apiService.jsonGetRequest(data)
        .subscribe(res => {
          if (res) {
            resolve(res)
          } else {
            reject(null)
          }
        }, err => {
          if (err) {
            reject(err)
          }
        })
    })
  }

  // getAndParseJSONApi(data) {
  //   return new Promise((resolve, reject) => {
  //     this.apiService.jsonRequest(data)
  //       .subscribe(res => {
  //         if (res.status === 200) {
  //           resolve(res.result)
  //         } else {
  //           reject(res.result)
  //         }
  //       }, err => {
  //         if (err) {
  //           // // // console.log("Error is occured....");
  //           reject(err)
  //         }
  //       })
  //   })
  // }


  /**
 * This block the flow for specific amount of time,and show typing during timeout
 * @param {*} FilteredMessageArray 
 */
  waitForTimeout(FilteredMessageArray) {
    this.deleteTypingFromMessageFlow();
    this.showSendMessage(this.sendTypingMessage);
    setTimeout(() => {
      FilteredMessageArray.isSent = 1;
      this.messageFlowTemp.push(FilteredMessageArray)
      this.deleteTypingFromMessageFlow();
      this.menageFlow();
    }, +FilteredMessageArray.data * 1000);

  }

  menageFlow() {
    // // console.log("ManageFlows");
    var MessageArray = this.messageFlowTemp;
    var FilteredMessageArray = this.filterArray(MessageArray);
    if (FilteredMessageArray.length > 0) {

      //now check if this is a timeout card
      if (FilteredMessageArray[0].name == this.messageType.TIMEOUT) {
        this.waitForTimeout(FilteredMessageArray[0]);
        return;
      }
      this.manageReceivedMessaged(FilteredMessageArray[0].name, FilteredMessageArray[0]);

      // UPDATE FLAG IN ARRAY
      FilteredMessageArray[0].isSent = 1;
      //json api rule
      if (FilteredMessageArray[0].name === this.messageType.JSON_API && this.checkIfAllAttribSent(FilteredMessageArray[0])) {
        return;
      }

      // UPDATE TO CONTEXT
      this.messageFlowTemp = FilteredMessageArray
      // // console.log("UPDATE MessageArray :", MessageArray)
      if (FilteredMessageArray[0].name !== this.messageType.USER_INPUT &&
        FilteredMessageArray[0].name !== this.messageType.JSON_API &&
        FilteredMessageArray[0].name !== this.messageType.QUICK_REPLIES) {
        setTimeout(() => {
          this.menageFlow();
        }, 1000);
        // setTimeout(function () {
        //   // console.log("RECURSION CALLED - " + FilteredMessageArray[0].name)
        //   this.menageFlow();
        // }, 1000);
      }
    }
    else {
      // console.log("FilteredMessageArray.length <= 0");
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
        if (element.name === 'JSON API' && element.answer_sent != 1) {
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
  showMenuTrigger(menutrigger) {
    let dateTime = this.getDateTimeForSendMessage()
    let defaultMessage = {
      "MessageAction": "Received",
      "textFlow": {
        "data": menutrigger.defaultMessage,
        "title":menutrigger.defaultMessage,
        "date": dateTime,
        "name": this.messageType.TEXT
      },
      BotId: this.botId,
      message: menutrigger.defaultMessage,
      isLuisCall: 0,
      "dateTime": dateTime
    }
    if(menutrigger.defaultBlock.length > 0){
      defaultMessage.textFlow['buttons'] = []
      menutrigger.defaultBlock.forEach(element => {
        let button = {
          'title':element,
          'selectedBlock':element
        }
        defaultMessage.textFlow['buttons'].push(button)
      });
    }
    this.deleteTypingFromMessageFlow();
    this.showSendMessage(defaultMessage)
    // this.messageFlow.push(defaultMessage);
    // this.scrollIntoView();
  }

  // send message when server get crash and user say exit
  showDefaultResponce(message) {
    let dateTime = this.getDateTimeForSendMessage()
    let defaultMessage = {
      "MessageAction": "Received",
      "textFlow": {
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

  // Get botIntent flow from backend 
  getFlowFromServer(data, header) {
    let details = "?dialogId=" + data.BotId + "&&userId=" + data.userID + "&&message=" + data.textFlow.data + "&&wildcard=1&&channelName=conveeChat";
    return new Promise((resolve, reject) => {
      this.apiService.getResponseFlowV2(details, header)
        .subscribe(res => {
          if (res.result) {
            resolve(res.result)
          }
        }, err => {
          if (err) {
            // console.log("Error is occured....: ", err);
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
      "textFlow": {
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

  //check incoming message is exit or another message
  checkExitMessage(messageObj) {
    if (messageObj.message == 'Exit' || messageObj.message == 'exit') {
      // this.showTypingDots = false;
      this.deleteTypingFromMessageFlow();
      this.showSendMessage(messageObj);
      return true
    } else {
      return false
    }
  }

  // push message to messageflow send and received message
  showSendMessage(messageObj) {
    // // console.log("Send message :", sendMessageObj)
    this.messageFlow.push(messageObj);
    this.scrollIntoView();


    // this.logMessage(messageObj)
  }
  // scroll to new added message
  scrollIntoView() {
    setTimeout(() => {
      // document.getElementById('ChatView').scrollTo(0, document.getElementById('ChatView').scrollHeight);

      let objDiv = document.getElementById("ChatView");
      objDiv.scrollTop = objDiv.scrollHeight;

      // $('ChatView').scrollTop(Number.MAX_VALUE);

      // let el = document.getElementById('ChatView');
      // el.scrollIntoView();
      // // console.log("after 1000")
    });
  }
  getDateTimeForSendMessage() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    return dateTime
    // callback(time)
  }
  scrollCarousel() {
    setTimeout(() => {
      // document.getElementById('ChatView').scrollTo(0, document.getElementById('ChatView').scrollHeight);
      let objDiv = document.getElementById("ChatView");
      objDiv.scrollTop = objDiv.scrollHeight;

    }, 2000);
  }
  imgLoad(item) {
    // // console.log("image is load:", item)
    // this.scrollIntoView();
    if (item == 'carousel') {
      this.scrollCarousel();
    } else {
      this.scrollIntoView();
    }
  }
  checkIfQuickRepliesIsCorrect(text, SentMessage, ResultResponse) {
    /*
 * CHECK IF MESSAGE SENT TO USER IS valid or not, IF YES CHECK TEXT ENTERED BY USER 
 * RETURN "isValid" = "TRUE" IF OK ELSE  
 * RETURN "isValid" = "FALSE" AND WITH MESSAGE TO SEND TO USER "ReturnMessage"
 */
    let check = false;
    for (let index = 0; index < SentMessage.buttons.length; index++) {
      if (SentMessage.buttons[index].title == text || SentMessage.buttons[index].title.toLowerCase() == text.toLowerCase()) {
        check = true;
        break;
      } else {
        check = false;
      }
    }
    if (check) {
      ResultResponse.isValid = true;
      ResultResponse.StartMenuTrigger = false;
    } else {
      ResultResponse.ReturnMessage = "Please enter valid input";
      ResultResponse.isValid = false;
      ResultResponse.StartMenuTrigger = false;
    }
    return ResultResponse;
  }
  checkIfPromptInputIsCorrect(text, SentMessage, ResultResponse) {
    // console.log("text: ", text)
    /*
     * CHECK IF MESSAGE SENT TO USER WAS OF TYPE PROMPTS, IF YES CHECK TEXT ENTERED BY USER 
     * RETURN "isValid" = "TRUE" IF OK ELSE  
     * RETURN "isValid" = "FALSE" AND WITH MESSAGE TO SEND TO USER "ReturnMessage"
     */
    switch (SentMessage.entityType) {
      case '@sys.date':
        {
          let mystring = text.replace(/\./g, '/')
          var today = new Date(mystring);
          // debugger;
          // console.log("today: ", JSON.stringify(today))
          var tday = JSON.stringify(today)
          if (tday != "null") {
            ResultResponse.isValid = true
          } else {
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
          if (parseInt(text) >= 120 || isNaN(parseInt(text))) {
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

              ResultResponse.exitConversation = true;
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
      case '@sys.address':
        {
          ResultResponse.isValid = true;
          ResultResponse.ReturnMessage = "";
        }
        break;

      default:
      // console.log("Entity type not found..");
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
  createDynamicId() {
    var today = new Date();
    var date = today.getFullYear() + 'y' + (today.getMonth() + 1) + 'm' + today.getDate();
    var time = today.getHours() + "h" + today.getMinutes() + "s" + today.getSeconds() + today.getMilliseconds();
    var id = 'id' + date + time;
    return id
  }

  logMessage(messageObj) {

    var logBody =
    {
      UserId: this.userId,
      BotId: this.botId,
      MessageAction: messageObj.MessageAction,
      // EndUserId: "userId",
      EndUserId: this.userId,
      Platform: 'Web chat',
      MessageType: messageObj.textFlow.name,
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

  // delete typing dots from UI
  deleteTypingFromMessageFlow() {
    var removeIndex = this.messageFlow.map(function (item) { return item.MessageAction; }).indexOf("Common");
    // // console.log("remove index :", removeIndex);
    if (removeIndex != -1) {
      this.messageFlow.splice(removeIndex, 1);
    }

    // // console.log("in delete typing from messageflow :", this.messageFlow);
    // callback();
  }

  // remove space from card no
  removeSpace(text: any): any {
    if (text) {
      return text.replace(/ /g, '')
    } else {
      return text;
    }
  }
  sendPaymentDetails(event, amount) {
    // debugger;
    // console.log("sendPaymentDetails :", this.paymentOption.cardNumber)
    let tempnum: any = this.paymentOption.cardNumber;
    // console.log("sendPaymentDetails :", tempnum.replace(/(\d{4})/g, '$1 ').replace(/(^\s+|\s+$)/, ''));
    debugger;
    let dateTime = this.getDateTimeForSendMessage()
    let sendMessageObj = {
      "MessageAction": "Send",
      "textFlow": {
        "data": "Amount :" + amount + "#Card No :" + this.paymentOption.cardNumber + "#Expiry month :" + this.paymentOption.expiryMonth + "#Expiry year :" + this.paymentOption.expiryYear + "#CVV :" + this.paymentOption.cvvNumber,
        "dateTime": dateTime.substr(dateTime.indexOf(' ') + 1),
        "name": "Text",
      },
      BotId: this.botId,
      // userID: this.userId,
      message: "Amount :" + amount + "#Card No :" + this.paymentOption.cardNumber + "#Expiry month :" + this.paymentOption.expiryMonth + "#Expiry year :" + this.paymentOption.expiryYear + "#CVV :" + this.paymentOption.cvvNumber,
      isLuisCall: 0,
      "dateTime": dateTime
    }
    this.showSendMessage(sendMessageObj)

    let paymentDetails = {
      "BotId": this.botId,
      "amount": amount,
      "card": {
        "number": this.removeSpace(this.paymentOption.cardNumber),
        "exp_month": this.paymentOption.expiryMonth,
        "exp_year": this.paymentOption.expiryYear,
        "cvc": this.paymentOption.cvvNumber
      }
    }
    this.paymentOption = {}
    this.makeStripePayment(paymentDetails).then(data => {
      // // console.log("data in makeStripePayment :", data);
      let response: any = data
      let dateTime = this.getDateTimeForSendMessage()
      let paymentMessage = {
        "MessageAction": "Received",
        "textFlow": {
          "data": response.message,
          "dateTime": dateTime.substr(dateTime.indexOf(' ') + 1),
          "name": "Default",
        },
        "BotId": this.botId,
        "message": response.message,
        // userID: userId,
        "isLuisCall": 0,
        "dateTime": dateTime
      }
      this.showSendMessage(paymentMessage);
    }).catch(err => {
      // // console.log("2) errer in makepaymentOnStripe :", err);
      let paymentMessage = {
        "MessageAction": "Received",
        "textFlow": {
          "data": err.message,
          "dateTime": dateTime.substr(dateTime.indexOf(' ') + 1),
          "name": "Default",
        },
        "BotId": this.botId,
        "message": err.message,
        // userID: userId,
        "isLuisCall": 0,
        "dateTime": dateTime
      }
      this.showSendMessage(paymentMessage);
    })
  }

  makeStripePayment(data) {
    return new Promise((resolve, reject) => {
      this.apiService.makePayment(data)
        .subscribe(res => {
          // console.log("response in makeStripePayment :", res)
          if (res.status.code === '200') {
            resolve(res.status)
          } else {
            reject(res.status)
          }
        }, err => {
          if (err) {
            // console.log("1) Error is occured in makeStripePayemnt....: ", err);
            reject(err)
          }
        })
    })
  }


  parseJsonApiResponse(message, callback) {
    var userAnswer = message.answer;
    var answer_attributes = message.answer_attributes;
    var json = message.data;
    this.parseJsonAndReturnResult(answer_attributes, json, userAnswer, function (allAttributeAnswer) {
      callback(allAttributeAnswer);
    });
  }
  parseJsonAndReturnResult(answer_attributes, json, userAnswer, callback) {
    //assume that key is of type {name,path,value}
    //traverse through each element of an array
    each(answer_attributes,
      (element, next) => {
        var keyWithValue = this.getValueForAnswerAttribute(element, json);
        next(null, keyWithValue);
      },
      function (err, transformedItems) {
        //console.log("parseJsonAndReturnResult");
        //replace actual key with the key:value
        transformedItems.forEach(element => {
          userAnswer = userAnswer.replace(element.key,/*element.key +" : "+ */element.value + "\n");
        });
        callback(userAnswer)
      }
    );
  }
  getValueForAnswerAttribute(key, json) {
    var finalString = "";
    var answer = [];
    answer = jsonpath.query(json, key.path);
    if (answer && answer.length > 0) {
      //we got value for the path
      //now we have array of values convert this into the single string
      answer.forEach(element => {
        finalString = finalString + element + "\n"
      });
    } else {
      //we dont get value for the path
    }
    //assign value to the key
    key.value = finalString;
    return key;
  }
}







