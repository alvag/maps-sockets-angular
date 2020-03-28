import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable( {
    providedIn: 'root'
} )
export class MapService {

    constructor( private http: HttpClient ) { }

    getMaps() {
        return this.http.get<any[]>( 'http://localhost:3000/api/map' );
    }
}
