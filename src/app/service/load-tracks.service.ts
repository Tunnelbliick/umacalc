import { Injectable } from '@angular/core';
import { Track, Location, LocationEnum } from '../../track/track';
import { Observable } from 'rxjs';
import { kyotoData } from './track_data/kyoto';
import { hakodate } from './track_data/hakodate';
import { niigataData } from './track_data/niigata';
import { sapporoData } from './track_data/sapporo';

@Injectable({
  providedIn: 'root'
})
export class LoadTracksService {

  static LocationArray = [
    { name: "Kyoto", internal: LocationEnum.Kyoto },
    { name: "Hakodate", internal: LocationEnum.Hakodate },
    { name: "Niigata", internal: LocationEnum.Niigata },
    { name: "Sapporo", internal: LocationEnum.Sapporo },
  ]

  constructor() { }

  public getTrackData(track: string, index: number): Track | undefined {

    let track_data: Track[] = [];

    switch (track) {
      case "kyoto":
        track_data = kyotoData;
    }

    return track_data[index];

  }

  public getSelect(): Location[] {
    return LoadTracksService.LocationArray;
  }

  public findLocationByEnum(location: LocationEnum) {

    const foundLocation = LoadTracksService.LocationArray.find(l => l.internal == location);

    return foundLocation ? foundLocation : LoadTracksService.LocationArray[0];

  }

  public getLocationData(location: LocationEnum): Track[] {

    switch (location) {
      case LocationEnum.Kyoto:
        return kyotoData;
      case LocationEnum.Hakodate:
        return hakodate;
      case LocationEnum.Niigata:
        return niigataData;
      case LocationEnum.Sapporo:
        return sapporoData;
      default:
        return kyotoData;
    }

  }

}