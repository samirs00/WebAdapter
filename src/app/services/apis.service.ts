import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpClientModule  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApisService {

  // baseUrl: string = 'http://localhost:3000/home';
      baseUrl:String="http://ec2-54-86-110-104.compute-1.amazonaws.com:5011/home/"  
      // luisUrl:String="",
      // baseUrl:String="http://192.168.9.99:9090/home/";

  constructor(private httpClient: HttpClient) { }


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

  JsonPostRequest(url,data,content_type): Observable<any>{
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .append('Authorization', content_type.authorizationKey)
    return this.httpClient.post(url , data, {headers})
    .pipe(catchError(this.handleErrorObservable));
  }
  JsonGetRequest(url,data, content_type): Observable<any>{
    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .append('Authorization', content_type.authorizationKey)
    return this.httpClient.get(url , {headers})
    .pipe(catchError(this.handleErrorObservable));
  }
  JsonParse(data): Observable<any>{
    // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'parseJson', data)
    .pipe(catchError(this.handleErrorObservable));
  }
  logMessage(data): Observable<any>{
        // let headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .append('botId', header.botId)
    // .append('tokenId', header.tokenId)
    return this.httpClient.post(this.baseUrl + 'logRecord', data)
    .pipe(catchError(this.handleErrorObservable));
  }

  private handleErrorObservable(error: Response | any) {
    // 401 - unAuthorized
    if (error.status === 401) {
      var message = "error";
      // this._tostrservice.showCustom();
      return Observable.throw(new Error(error.status));
      // alert("Server error please try again!");
    }
    // 500 - internal server error
    else if (error.status === 500) {
      return Observable.throw(new Error(error.status));
    }
    // 400 - bad request
    else if (error.status === 400) {
      return Observable.throw(new Error(error.status));
    }
    // 409 - conflict
    else if (error.status === 409) {
      return Observable.throw(new Error(error.status));
    }
    // 408 - request timeout
    else if (error.status === 408) {
      return Observable.throw(new Error(error.status));
    }
    else {
      // console.error(error.message || error);
      return Observable.throw(error.message || error);
    }

  }
}
