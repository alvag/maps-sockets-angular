import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapService } from '../services/map.service';
import { WebsocketService } from '../services/websocket.service';

interface Lugar {
    id?: string;
    name: string;
    lat: number;
    lng: number;
}

@Component( {
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
} )
export class MapComponent implements OnInit {

    @ViewChild( 'map', { static: true } ) mapElement: ElementRef;
    map: google.maps.Map;
    markers: google.maps.Marker[] = [];
    infoWindows: google.maps.InfoWindow[] = [];
    lugares: Lugar[] = [];

    constructor( private mapService: MapService,
                 private wsService: WebsocketService ) { }

    ngOnInit() {

        this.mapService.getMaps().subscribe( ( lugares: Lugar[] ) => {
            console.log( lugares );
            this.lugares = lugares;
            this.loadMap();
        } );

        this.listenSockets();
    }

    listenSockets() {
        this.wsService.listen( 'add-marker' ).subscribe( ( marker: Lugar ) => {
            this.addMarker( marker );
        } );

        this.wsService.listen( 'delete-marker' ).subscribe( ( id: string ) => {
            for ( const i in this.markers ) {
                if ( this.markers[ i ].getTitle() === id ) {
                    this.markers[ i ].setMap( null );
                    break;
                }
            }
        } );

        this.wsService.listen( 'move-marker' ).subscribe( ( marker: Lugar ) => {
            for ( const i in this.markers ) {
                if ( this.markers[ i ].getTitle() === marker.id ) {
                    const latLng = new google.maps.LatLng(marker.lat, marker.lng);
                    this.markers[ i ].setPosition(latLng);
                    break;
                }
            }
        } );
    }

    private loadMap() {
        const latLng = new google.maps.LatLng( 37.784679, -122.395936 );

        const mapOptions: google.maps.MapOptions = {
            center: latLng,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map<Element>( this.mapElement.nativeElement, mapOptions );

        this.map.addListener( 'click', ( e ) => {
            const newMarker: Lugar = {
                name: 'Test',
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                id: new Date().toISOString()
            };

            this.addMarker( newMarker );

            this.wsService.emit( 'add-marker', newMarker );
        } );

        for ( const lugar of this.lugares ) {
            this.addMarker( lugar );
        }
    }

    addMarker( lugar: Lugar ) {
        const latLng = new google.maps.LatLng( lugar.lat, lugar.lng );
        const marker = new google.maps.Marker( {
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: latLng,
            draggable: true,
            title: lugar.id
        } );

        this.markers.push( marker );

        const content = `<b>${lugar.name}</b>`;
        const info = new google.maps.InfoWindow( {
            content,
        } );

        this.infoWindows.push( info );

        google.maps.event.addDomListener( marker, 'click', ( e ) => {
            this.infoWindows.forEach( i => i.close() );
            info.open( this.map, marker );
        } );

        google.maps.event.addDomListener( marker, 'dblclick', ( e ) => {
            marker.setMap( null );
            this.wsService.emit( 'delete-marker', lugar.id );
        } );

        google.maps.event.addDomListener( marker, 'drag', ( e: any ) => {
            const newMarker: Lugar = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                name: lugar.name,
                id: lugar.id
            };

            this.wsService.emit('move-marker', newMarker);
        } );
    }
}
