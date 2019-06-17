import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpClientModule  } from '@angular/common/http';
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
      // baseUrl: String = 'https://convee.ai:1992/home/';      // production URL
      // baseUrl:String="http://192.168.9.99:9090/home/"; //deepak machine
      baseUrl:String="https://868914a4.ngrok.io/home/";

  constructor(private httpClient: HttpClient) { }

  makePayment(data): Observable<any>{
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'makePayment', data)
    .pipe(catchError(this.handleErrorObservable));
  }

  getResponseFlow(data, header): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .append('botId', header.botId)
      .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'getMessagesForIntentV2', data, {headers})
      .pipe(catchError(this.handleErrorObservable));
  }
  getEntityFromLuis(data): Observable<any>{
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'getEntityForMessage', data)
    .pipe(catchError(this.handleErrorObservable));
  }

  // JsonPostRequest(url,data,content_type): Observable<any>{
  //   let headers = new HttpHeaders()
  //   .set('Content-Type', 'application/json')
  //   .append('Authorization', content_type.authorizationKey)
  //   return this.httpClient.post(url , data, {headers})
  //   .pipe(catchError(this.handleErrorObservable));
  // }
  // JsonGetRequest(url,data, content_type): Observable<any>{
  //   let headers = new HttpHeaders()
  //   .set('Content-Type', 'application/json')
  //   .append('Authorization', content_type.authorizationKey)
  //   // .append('Accept', "*/*")
  //   .set("Access-Control-Allow-Origin", "*")
  //   // .append("Access-Control-Allow-Credentials", "tre")
  //   // .append("Access-Control-Allow-Methods", "GET")
  //   // .append("Access-Control-Request-Headers", "Content-type,X-Requested-With,Origin,accept")
  //   return this.httpClient.get(url , {headers})
  //   .pipe(catchError(this.handleErrorObservable));
  // }
  // JsonParse(data): Observable<any>{
  //   // let headers = new HttpHeaders()
  //   // .set('Content-Type', 'application/json')
  //   // .append('botId', header.botId)
  //   // .append('tokenId', header.tokenId)
  //   return this.httpClient.post(this.baseUrl + 'parseJson', data)
  //   .pipe(catchError(this.handleErrorObservable));
  // }
  logMessage(data): Observable<any>{
        // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'logRecord', data)
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
