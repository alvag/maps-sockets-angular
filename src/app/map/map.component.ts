import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

interface Lugar {
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
    lugares: Lugar[] = [
        {
            name: 'Udemy',
            lat: 37.784679,
            lng: -122.395936
        },
        {
            name: 'BahÃ­a de San Francisco',
            lat: 37.798933,
            lng: -122.377732
        },
        {
            name: 'The Palace Hotel',
            lat: 37.788578,
            lng: -122.401745
        }
    ];

    constructor() { }

    ngOnInit() {
        this.loadMap();
    }

    private loadMap() {
        const latLng = new google.maps.LatLng( 37.784679, -122.395936 );

        const mapOptions: google.maps.MapOptions = {
            center: latLng,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map<Element>( this.mapElement.nativeElement, mapOptions );

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
            draggable: true
        } );

        this.markers.push( marker );

        google.maps.event.addDomListener( marker, 'dblclick', ( e ) => {
            marker.setMap( null );
        } );

        google.maps.event.addDomListener( marker, 'drag', ( e: any ) => {
            const newMarker = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };

            console.log(newMarker);
        } );
    }
}
