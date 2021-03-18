import {AfterContentInit, Component, ElementRef, ViewChild} from '@angular/core';
import {} from 'googlemaps';
// import { } from '@types/googlemaps';
import {FormControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {RouteService} from '../shared/route.service';
import {Route} from '../shared/interfaces';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'app-driver-page',
  templateUrl: './driver-page.component.html',
  styleUrls: ['./driver-page.component.scss']
})
export class DriverPageComponent implements AfterContentInit {

  @ViewChild('googleMap', {static: true}) public gMapElement: ElementRef;

  // @ViewChild('googleMapPanel', {static: false}) public gMapPanelElement: ElementRef;

  @ViewChild('startAddress', {static: true}) startAddress: ElementRef;

  @ViewChild('endAddress', {static: true}) endAddress: ElementRef;

  @ViewChild('destinationAddress', {static: true}) destinationAddress: ElementRef;

  public searchControl: FormControl;

  map: google.maps.Map;

  // startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
  //  endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
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

  displayedColumns: string[] = ['routeId', 'startAddress', 'endAddress'];

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
    // this.initDirections();
    // this.initDriverRoutes();


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

      // console.log('countMarkers1' + this.countMarkers);
      // console.log(this.startRouteMarker);

      if (!this.isInitStartRouteMarker) {
        this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
        this.startRouteMarker.setPosition(event.latLng);
        this.startRouteMarker.setVisible(true);
        this.addStartRouteMarkerListeners();
        // this.countMarkers = this.countMarkers + 1;
        this.isInitStartRouteMarker = true;
        this.refreshStartAddressInput();
      } else if (!this.isInitEndRouteMarker) {
        this.endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
        this.endRouteMarker.setPosition(event.latLng);
        this.endRouteMarker.setVisible(true);
        this.addEndRouteMarkerListeners();
        // this.countMarkers = this.countMarkers + 1;
        this.isInitEndRouteMarker = true;
        this.refreshEndAddressInput();
      }
      // this.refreshStartAddressInput();
      // this.refreshEndAddressInput();
      if (this.isInitStartRouteMarker && this.isInitEndRouteMarker) {
        this.routeTrip();
      }

      // console.log('countMarkers1' + this.countMarkers);

    });
    // google.maps.event.addListener(this.startAddressAutocomplete, 'place_changed', () => {
    //   if (!this.startRouteMarker) {
    //     this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    //   }
    //
    //   const place = this.startAddressAutocomplete.getPlace();
    //   if (!place.geometry) {
    //     window.alert('No details available for input: ' + place.name);
    //     return;
    //   }
    //
    //   if (place.geometry.viewport) {
    //     this.map.fitBounds(place.geometry.viewport);
    //
    //   } else {
    //     this.map.setCenter(place.geometry.location);
    //     this.map.setZoom(17);
    //   }
    //
    //   this.startRouteMarker.setPosition(place.geometry.location);
    //   this.startRouteMarker.setVisible(true);
    //
    //   // if (this.startRouteMarker != null && this.endRouteMarker != null) {
    //   //   this.routeTrip();
    //   // }
    //
    //
    // });
    // google.maps.event.addListener(this.startRouteMarker, 'dragend', () => {
    //   console.log(this.startRouteMarker.getPosition());
    //
    //   this.geoCoder = new google.maps.Geocoder();
    //   this.geoCoder.geocode({'location': this.addStartRouteMarker().getPosition()}, (results, status) => {
    //     if (status === google.maps.GeocoderStatus.OK) {
    //       if (results[0]) {
    //         this.startAddressInput = results[0].formatted_address;
    //
    //
    //         // if (this.startRouteMarker != null && this.endRouteMarker != null) {
    //         //   console.log('2');
    //         //   this.routeTrip();
    //         // }
    //       }
    //     }
    //   });
    // });
  }

  initPlaces() {
    // const autocompleteOptions: google.maps.places.AutocompleteOptions = {fields: ['place_id', 'name', 'types', '']};
    // this.originAutocomplete = new google.maps.places.Autocomplete(this.startAddress.nativeElement, autocompleteOptions);
    //  this.destinationAutocomplete = new google.maps.places.Autocomplete(this.destinationAddress.nativeElement, autocompleteOptions);

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
      // if (this.startRouteMarker != null && this.endRouteMarker != null) {
      //   this.routeTrip();
      // }

      // google.maps.event.addListener(this.startRouteMarker, 'dragend', () => {
      //   this.geoCoder = new google.maps.Geocoder();
      //   this.geoCoder.geocode({location: this.startRouteMarker.getPosition()}, (results, status) => {
      //     if (status === google.maps.GeocoderStatus.OK) {
      //       if (results[0]) {
      //         this.startAddressInput = results[0].formatted_address;
      //
      //
      //         // if (this.startRouteMarker != null && this.endRouteMarker != null) {
      //         //   console.log('2');
      //         //   this.routeTrip();
      //         // }
      //       }
      //     }
      //   });
      // });
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
    // google.maps.event.addListener(this.map, 'click', (event) => {
    //   console.log('event' + event.latLng);
    //   // --
    //   // if (!this.startRouteMarker) {
    //   //   this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    //   // }
    //   //
    //   // new google.maps.places.
    //   //
    //   // const place = this.startAddressAutocomplete.getPlace();
    //   // if (!place.geometry) {
    //   //   window.alert('No details available for input: ' + place.name);
    //   //   return;
    //   // }
    //   //
    //   // if (place.geometry.viewport) {
    //   //   this.map.fitBounds(place.geometry.viewport);
    //   //
    //   // } else {
    //   //   this.map.setCenter(place.geometry.location);
    //   //   this.map.setZoom(17);
    //   // }
    //   //
    //   // this.startRouteMarker.setPosition(place.geometry.location);
    //   // this.startRouteMarker.setVisible(true);
    //
    //   // --
    //   console.log(this.startRouteMarker);
    //   console.log(!this.startRouteMarker === null);
    //
    //   if (this.countMarkers === 0) {
    //     this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    //     this.geoCoder = new google.maps.Geocoder();
    //     this.geoCoder.geocode({location: this.startRouteMarker.getPosition()}, (results, status) => {
    //       if (status === google.maps.GeocoderStatus.OK) {
    //         if (results[0]) {
    //           this.startAddressInput = results[0].formatted_address;
    //
    //           console.log(this.startAddressInput);
    //           console.log(this.startAddressAutocomplete);
    //
    //
    //
    //           // if (this.startRouteMarker != null && this.endRouteMarker != null) {
    //           //   console.log('2');
    //           //   this.routeTrip();
    //           // }
    //         }
    //       }
    //     });
    //   } else {
    //     this.endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    //
    //   }
    //
    //   // if (this.markers.length < 2) {
    //   //   this.addMarker(event.latLng);
    //   //
    //   // }
    // });

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

    // this.directionsDisplay.setMap(this.map);
    // this.directionsDisplay.setPanel(this.gMapPanelElement.nativeElement);
    // this.calculateAndDisplayRoute();


    this.directionsRenderer.addListener('directions_changed', () => {

      this.computeTotalDistance(this.directionsRenderer.getDirections());
      console.log('dddddddddddddddddddddd');
      console.log('ggggggggggggggggggg' + this.directionsRenderer.getDirections().routes[0].legs[0].start_location);
      this.startRouteMarker.setPosition(this.directionsRenderer.getDirections().routes[0].legs[0].start_location);
      this.endRouteMarker.setPosition(this.directionsRenderer.getDirections().routes[0].legs[0].end_location);
      this.refreshStartAddressInput();
      this.refreshEndAddressInput();
      // console.log('directionsDisplay1' + this.directionsRenderer.getDirections().routes[0].legs[0].start_address);
      // console.log('directionsDisplay2' + this.directionsRenderer.getDirections().routes[0].legs[0].distance.text);
      // console.log('directionsDisplay2' + this.directionsRenderer.getDirections().routes[0].legs[0].duration.text);
      // console.log('directionsDisplay2' + this.directionsRenderer.getDirections().routes[0].legs[0].duration_in_traffic.text);
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


  // initDirections() {
  //
  //
  //   google.maps.event.addListener(this.map, 'directions_changed', (event) => {
  //     console.log(event);
  //     console.log('directionsDisplay');
  //     // this.computeTotalDistance(this.directionsDisplay.getDirections());
  //     // this.calcRoute();
  //   });
  // }


  onSave($event) {
    this.submitted = true;
    console.log('Save button is clicked!', $event);
    const leg = this.directionsRenderer.getDirections().routes[0].legs[0];
    const wp = leg.via_waypoints;
    const w = [];
    for (let i = 0; i < wp.length; i++) {
      w[i] = {latitude: wp[i].lat(), longitude: wp[i].lng()};
    }

    // const route = {
    //   originLat: leg.start_location.lat(),
    //   originLng: leg.start_location.lng(),
    //   destinationLat: leg.end_location.lat(),
    //   destinationLng: leg.end_location.lng(),
    //   waypoints: w
    // };

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

    // this.routeService.create(route).subscribe(res => {
    //     console.log('statusCode' + res.statusCode);
    //     console.log(route);
    //     console.log(res);
    //
    //     this.getRoutesByDriverId(window.localStorage.getItem('user-id'));
    //     this.router.navigate(['/', 'driver']);
    //     this.submitted = false;
    //   },
    //   () => {
    //     this.submitted = false;
    //   }
    // );

    this.routeService.create(route).subscribe(
      data => {
        console.log('success', data);
        this.getRoutesByDriverId(window.localStorage.getItem('user-id'));
      },
      error => console.log('Oops', error)
    );


    // const objectObservable = this.httpClient.post('http://localhost:8080/api/v1/driver/addUserRoute?access_token=' +
    //   JSON.parse(window.sessionStorage.getItem('fb-token')).access_token, route).toPromise();
    //
    // console.log('request objectObservable:', objectObservable);

    // return objectObservable;
  }

  onRouteReset($event) {
    this.startRouteMarker.setMap(null);
    this.endRouteMarker.setMap(null);

    this.startRouteMarker = new google.maps.Marker({map: this.map, draggable: true});
    this.endRouteMarker = new google.maps.Marker({map: this.map, draggable: true});

    this.directionsRenderer.setMap(null);
    this.directionsRenderer.setMap(null);

    this.isInitStartRouteMarker = false;
    this.isInitEndRouteMarker = false;

    const id = window.sessionStorage.getItem('userId');
    this.getRoutesByDriverId(id);
  }

  getRoutesByDriverId(id) {


    // console.log('request routeses:', this.routeService.getRoutesByDriverId(id));

    this.routeService.getRoutesByDriverId(id).subscribe((response: Route[]) => {
      this.routes = response;
      this.routes$ = response;
      this.dataSource = response;
      console.log('ziza:', this.routes);
      console.log('request routes:', this.routes$);
      // console.log('request routes:', this.routes$);
    });

    // .
    //   subscribe((response: Route) => {
    //     this.route = response;
    //   });

    // this.routes$ = this.routeService.getRoutesByDriverId(id);

    // const userId = window.sessionStorage.getItem('editUserId');
    // console.log('request userId:', userId);
    // const routes = this.httpClient.post('http://localhost:8080/driver/getRoutesByUserId?access_token=' +
    //   JSON.parse(window.sessionStorage.getItem('token')).access_token, id).toPromise();
    // console.log('request routes:', routes);
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

}
