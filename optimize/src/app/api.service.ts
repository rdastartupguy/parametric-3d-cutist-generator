import { Injectable } from '@angular/core';

import { HttpClient,HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public  localUrl = 'http://173.212.206.191:5000/';
  
  constructor(private http: HttpClient) { }

  getStock(param) {
      let header = new HttpHeaders();
      header.set('Access-Control-Allow-Origin', '*');
      return this.http.get(this.localUrl+'cutlist/'+param,{ headers: header });
  }
}
