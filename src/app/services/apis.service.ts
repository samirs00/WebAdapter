import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/throw';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApisService {

  // baseUrl:String="http://ec2-54-86-110-104.compute-1.amazonaws.com:5011/home/"  
  // baseUrl: String = 'https://convee.ai:9090/api/';      // production URL
  baseUrl:String="http://192.168.9.101:9090/api/"; //deepak machine
  // ABhijeetUserId:String="http://localhost:4200/#/?dialogid=5df21b2da1d4c27935f87909&&userid=5d7238d0b1b66127bf82579c";

  constructor(private httpClient: HttpClient) { }

  makePayment(data): Observable<any> {
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'makePayment', data)
      .pipe(catchError(this.handleErrorObservable));
  }
  getResponseFlowV2(data, header): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .append('botId', header.botId)
      .append('tokenId', header.tokenId)
    return this.httpClient.get(this.baseUrl + 'block/getBlockOfMessage' + data)
      .pipe(catchError(this.handleErrorObservable));
  }
  getResponseFlowFromAgent(data, header): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .append('botId', header.botId)
      .append('tokenId', header.tokenId)
    return this.httpClient.get(this.baseUrl + 'sample/sendMessageToLiveAgent' + data)
      .pipe(catchError(this.handleErrorObservable));
  }
  getStyles(data, header): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .append('botId', header.botId)
      .append('tokenId', header.tokenId)
    return this.httpClient.get(this.baseUrl + 'getStyles' + data)
      .pipe(catchError(this.handleErrorObservable));
  }
  jsonGetRequest(data): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', data.content_type)
    if (data.header) {
      headers.append(data.authorizationKey.key, data.authorizationKey.value)
    }
    return this.httpClient.get(data.url, { headers })
      .pipe(catchError(this.handleErrorObservable));
  }
  jsonPostRequest(data): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', data.content_type)
    if (data.header) {
      headers.append(data.authorizationKey.key, data.authorizationKey.value)
    }

    return this.httpClient.post(data.url, data.requestBody, { headers })
      .pipe(catchError(this.handleErrorObservable));
  }
  getResponseFlow(data, header): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .append('botId', header.botId)
      .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'getMessagesForIntentV2', data, { headers })
      .pipe(catchError(this.handleErrorObservable));
  }
  getEntityFromMessage(data): Observable<any> {
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.get(this.baseUrl + 'entity/getEntityFromMessage'+ data)
      .pipe(catchError(this.handleErrorObservable));
  }
  logMessage(data): Observable<any> {
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'conversation/logConversationMessage', data)
      .pipe(catchError(this.handleErrorObservable));
  }
  logBlockData(data): Observable<any> {
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'blockLogs/logBlockData', data)
      .pipe(catchError(this.handleErrorObservable));
  }
  jsonRequest(data): Observable<any> {
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'getAndParseJSONApi', data)
      .pipe(catchError(this.handleErrorObservable));
  }

  private handleErrorObservable(error: Response | any) {
    // 401 - unAuthorized
    if (error.status === 401) {
      var message = "error";
      // this._tostrservice.showCustom();
      return throwError(new Error(error.status));
      // alert("Server error please try again!");
    }
    // 500 - internal server error
    else if (error.status === 500) {
      return throwError(new Error(error.status));
    }
    // 400 - bad request
    else if (error.status === 400) {
      return throwError(new Error(error.status));
    }
    // 409 - conflict
    else if (error.status === 409) {
      return throwError(new Error(error.status));
    }
    // 408 - request timeout
    else if (error.status === 408) {
      return throwError(new Error(error.status));
    }
    else {
      // console.error(error.message || error);
      return throwError(error.message || error);
    }

  }
}
