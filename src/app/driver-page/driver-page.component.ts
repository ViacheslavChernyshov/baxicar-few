import {AfterContentInit, Component, ElementRef, ViewChild} from '@angular/core';
import {} from 'googlemaps';
import {FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {RouteService} from '../shared/route.service';
import {Route} from '../shared/interfaces';


@Component({
  selector: 'app-driver-page',
  templateUrl: './driver-page.component.html',
  styleUrls: ['./driver-page.component.scss']
})
export class DriverPageComponent implements AfterContentInit {

  @ViewChild('googleMap', {static: true}) public gMapElement: ElementRef;

  @ViewChild('startAddress', {static: true}) startAddress: ElementRef;

  @ViewChild('endAddress', {static: true}) endAddress: ElementRef;

  @ViewChild('destinationAddress', {static: true}) destinationAddress: ElementRef;

  public searchControl: FormControl;

  map: google.maps.Map;

  startRouteMarker: google.maps.Marker;
  endRouteMarker: google.maps.Marker;

  isInitStartRouteMarker: boolean = false;
  isInitEndRouteMarker: boolean = false;

  startAddressAutocomplete: google.maps.places.Autocomplete;
  endAddressAutocomplete: google.maps.places.Autocomplete;

  geoCoder: google.maps.Geocoder;

  startAddressInput: string;
  endAddressInput: string;

  waypoints: [];

  directionsRenderer: google.maps.DirectionsRenderer;
  directionsService = new google.maps.DirectionsService();

  markers = [];
  routes$;
  routes: Route[];

  dataSource: Route[];

  submitted = false;

  displayedColumns: string[] = ['routeId', 'startAddress', 'endAddress', 'actions'];

  selectedRowIndex: number = -1;


  constructor(
    private httpClient: HttpClient,
    private routeService: RouteService,
    private router: Router) {
  }

  public ngAfterContentInit(): void {
    this.searchControl = new FormControl();
    this.geoCoder = new google.maps.Geocoder();

    this.initMap();
    this.initMarkers();
    this.initPlaces();

  }

  initMap() {
    const mapOptions = {
      center: new google.maps.LatLng(50.4501, 30.5234),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.gMapElement.nativeElement, mapOptions);
    this.directionsRenderer = new google.maps.DirectionsRenderer({map: this.map, draggable: true});

    this.getRoutesByDriverId(window.localStorage.getItem('user-id'));
  }

  private addStartRouteMarkerListeners() {
    this.startRouteMarker.addListener('dragend', () => this.refreshStartAddressInput());

    // this.endRouteMarker.addListener('dragend', mouseEvent => this.reverseGeocode(mouseEvent))
    // this.map.addListener('click', mouseEvent => this.changeMarkerLocation(mouseEvent.latLng))
    // this.map.addListener('click', () => this.notifyLocationChange())
    // this.map.addListener('click', mouseEvent => this.reverseGeocode(mouseEvent))
  }

  private addEndRouteMarkerListeners() {
    this.endRouteMarker.addListener('dragend', () => this.refreshEndAddressInput());
  }

  private refreshStartAddressInput() {
    console.log('this.startAddressInput =================' + this.startRouteMarker.getPosition());
    this.geoCoder.geocode({location: this.startRouteMarker.getPosition()}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {

          this.startAddressInput = results[0].formatted_address;

          // if (this.startRouteMarker != null && this.endRouteMarker != null) {
          //   console.log('2');
          //   this.routeTrip();
          // }
        }
      }
    });
  }

  private refreshEndAddressInput() {
    this.geoCoder.geocode({location: this.endRouteMarker.getPosition()}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          this.endAddressInput = results[0].formatted_address;

          // if (this.startRouteMarker != null && this.endRouteMarker != null) {
          //   console.log('2');
          //   this.routeTrip();
          // }
        }
      }
    });
  }

  initMarkers() {
    google.maps.event.addListener(this.map, 'click', (event) => {
      console.log('event' + event.latLng);

      if (!this.isInitStartRouteMarker) {
        this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
        this.startRouteMarker.setPosition(event.latLng);
        this.startRouteMarker.setVisible(true);
        this.addStartRouteMarkerListeners();
        this.isInitStartRouteMarker = true;
        this.refreshStartAddressInput();
      } else if (!this.isInitEndRouteMarker) {
        this.endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
        this.endRouteMarker.setPosition(event.latLng);
        this.endRouteMarker.setVisible(true);
        this.addEndRouteMarkerListeners();
        this.isInitEndRouteMarker = true;
        this.refreshEndAddressInput();
      }
      if (this.isInitStartRouteMarker && this.isInitEndRouteMarker) {
        this.routeTrip();
      }

    });
  }

  initPlaces() {
    this.startAddressAutocomplete = new google.maps.places.Autocomplete(this.startAddress.nativeElement);
    this.endAddressAutocomplete = new google.maps.places.Autocomplete(this.endAddress.nativeElement);

    this.startAddressAutocomplete.bindTo('bounds', this.map);

    google.maps.event.addListener(this.startAddressAutocomplete, 'place_changed', () => {
      console.log('ffffff');
      if (!this.isInitStartRouteMarker) {
        this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
        this.isInitStartRouteMarker = true;
      }

      const place = this.startAddressAutocomplete.getPlace();
      if (!place.geometry) {
        window.alert('No details available for input: ' + place.name);
        return;
      }

      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);

      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);
      }

      this.startRouteMarker.setPosition(place.geometry.location);
      this.startRouteMarker.setVisible(true);

      this.addStartRouteMarkerListeners();
      if (this.isInitStartRouteMarker && this.isInitEndRouteMarker) {
        this.routeTrip();
      }
    });

    google.maps.event.addListener(this.endAddressAutocomplete, 'place_changed', () => {
      if (!this.isInitEndRouteMarker) {
        this.endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
        this.isInitStartRouteMarker = true;
      }

      const place = this.endAddressAutocomplete.getPlace();
      if (!place.geometry) {
        window.alert('No details available for input: ' + place.name);
        return;
      }

      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);
      }

      this.endRouteMarker.setPosition(place.geometry.location);
      this.endRouteMarker.setVisible(true);

      this.addEndRouteMarkerListeners();

    });
    if (this.isInitStartRouteMarker && this.isInitEndRouteMarker) {
      this.routeTrip();
    }

    google.maps.event.addListener(this.map, 'directions_changed', (event) => {
      console.log(event);
      console.log('directionsDisplayzzzzz');
    });

  }

  calculateAndDisplayRoute() {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: this.startRouteMarker.getPosition(),
        destination: this.endRouteMarker.getPosition(),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );
  }

  routeTrip() {
    if (this.directionsRenderer != null) {
      this.directionsRenderer.setMap(null);
    }

    const rendererOptions = {map: this.map, draggable: true};
    this.directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);

    this.directionsRenderer.addListener('directions_changed', () => {

      this.computeTotalDistance(this.directionsRenderer.getDirections());
      console.log('dddddddddddddddddddddd');
      console.log('ggggggggggggggggggg' + this.directionsRenderer.getDirections().routes[0].legs[0].start_location);
      this.startRouteMarker.setPosition(this.directionsRenderer.getDirections().routes[0].legs[0].start_location);
      this.endRouteMarker.setPosition(this.directionsRenderer.getDirections().routes[0].legs[0].end_location);
      this.refreshStartAddressInput();
      this.refreshEndAddressInput();
    });
    this.calcRoute();

    this.startRouteMarker.setVisible(false);
    this.endRouteMarker.setVisible(false);
  }

  calcRoute() {
    console.log('---------------------');


    console.log(this.endRouteMarker.getPosition().lat());
    console.log(this.endRouteMarker.getPosition().lng());

    const request = {
      origin: this.startRouteMarker.getPosition(),
      destination: this.endRouteMarker.getPosition(),
      waypoints: this.waypoints,
      provideRouteAlternatives: true,
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.directionsService.route(request, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(response);
      }
    });
  }

  computeTotalDistance(result) {
    let total = 0;
    const myRoute = result.routes[0];
    for (let i = 0; i < myRoute.legs.length; i++) {
      total += myRoute.legs[i].distance.value;
    }
    total = total / 1000;
    console.log(total);
    // document.getElementById('total').innerHTML = total + ' km';
  }

  onKeyUpStartAddress(value) {
    this.startAddress = value;
  }

  onKeyUpEndAddress(value) {
    this.endAddress = value;
  }

 onSave($event) {
    this.submitted = true;
    console.log('Save button is clicked!', $event);
    const leg = this.directionsRenderer.getDirections().routes[0].legs[0];
    const wp = leg.via_waypoints;
    const w = [];
    for (let i = 0; i < wp.length; i++) {
      w[i] = {latitude: wp[i].lat(), longitude: wp[i].lng()};
    }

    console.log('ssss:', window.localStorage.getItem('user-id'));

    const route = {
      userId: window.localStorage.getItem('user-id'),
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      originLatitude: leg.start_location.lat(),
      originLongitude: leg.start_location.lng(),
      destinationLatitude: leg.end_location.lat(),
      destinationLongitude: leg.end_location.lng(),
      waypoints: w
    };

    console.log('Save button is clicked!', $event);
    console.log('request:', route);


    this.routeService.create(route).subscribe(
      data => {
        console.log('success', data);
        this.getRoutesByDriverId(window.localStorage.getItem('user-id'));
      },
      error => console.log('Oops', error)
    );
  }

  onRouteReset($event) {
    this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    this.endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});

    this.startRouteMarker.setMap(null);
    this.endRouteMarker.setMap(null);

    this.directionsRenderer.setMap(null);
    this.directionsRenderer.setMap(null);

    this.isInitStartRouteMarker = false;
    this.isInitEndRouteMarker = false;

    const id = window.sessionStorage.getItem('user-id');
    this.getRoutesByDriverId(id);
  }

  getRoutesByDriverId(id) {

    this.routeService.getRoutesByDriverId(id).subscribe((response: Route[]) => {
      this.routes = response;
      this.routes$ = response;
      this.dataSource = response;
      console.log('ziza:', this.routes);
      console.log('request routes:', this.routes$);

    });
  }

  initDriverRoutes() {
    const userId = window.sessionStorage.getItem('userId');
    this.getRoutesByDriverId(userId);
  }

  highlight(row) {
    console.log(row);
    this.selectedRowIndex = row.routeId;

    this.clearMarkers();

    if (this.directionsRenderer != null) {
      this.directionsRenderer.setMap(null);
    }

    const rendererOptions = {map: this.map, draggable: true};
    this.directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);

    console.log(row.originLatitude);

    this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    this.startRouteMarker.setPosition(new google.maps.LatLng(row.originLatitude, row.originLongitude));
    this.startRouteMarker.setVisible(true);

    this.endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    this.endRouteMarker.setPosition(new google.maps.LatLng(row.destinationLatitude, row.destinationLongitude));
    this.endRouteMarker.setVisible(true);

    this.refreshStartAddressInput();
    this.refreshEndAddressInput();

    this.calcRoute();

    this.startRouteMarker.setVisible(false);
    this.endRouteMarker.setVisible(false);
    this.isInitStartRouteMarker = true;
    this.isInitEndRouteMarker = true;
  }

  highlightRow(row) {
    console.log(row);
    this.selectedRowIndex = row.routeId;
  }

  clearMarkers() {
    this.startRouteMarker = null;
    this.endRouteMarker = null;

    this.isInitStartRouteMarker = false;
    this.isInitEndRouteMarker = false;

    this.startAddressInput = null;
    this.endAddressInput = null;

    this.waypoints = [];
    this.markers = [];
  }

  deleteRoute(element) {
    console.log('ddddd ' + element.routeId);
    console.log('ddddd ' + element.waypoints);
    const route = {
      userId: window.localStorage.getItem('user-id'),
      routeId: element.routeId,
      waypoints: element.waypoints
    };

    this.deleteRouteByRouteId(element.routeId);
  }

  deleteRouteByRouteId(id) {

    console.log('delete route:', this.routeService.deleteRouteByRouteId(id));
    this.routeService.deleteRouteByRouteId(id).subscribe(res => {
      console.log(res);
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
      this.getRoutesByDriverId(window.localStorage.getItem('user-id'));
    });
  }
}
