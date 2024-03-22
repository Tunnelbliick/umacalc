import { Injectable } from '@angular/core';
import { Track, Location, LocationEnum } from '../../track/track';
import { Observable } from 'rxjs';
import { kyotoData } from './track_data/kyoto';
import { hakodate } from './track_data/hakodate';
import { niigataData } from './track_data/niigata';
import { sapporoData } from './track_data/sapporo';
import { chukyoData } from './track_data/chukyo';
import { fukishimaData } from './track_data/fukushima';
import { funabashiData } from './track_data/funabashi';
import { hanshinData } from './track_data/hanshin';
import { kawasakiData } from './track_data/kawasaki';
import { kokuraData } from './track_data/kokura';
import { longchampData } from './track_data/longchamp';
import { moriokaData } from './track_data/morioka';
import { nakayamaData } from './track_data/nakayama';
import { ooiData } from './track_data/ooi';
import { tokyoData } from './track_data/tokyo';

@Injectable({
  providedIn: 'root'
})
export class LoadTracksService {

  static LocationArray = [
    { name: "Sapporo", internal: LocationEnum.Sapporo },
    { name: "Hakodate", internal: LocationEnum.Hakodate },
    { name: "Niigata", internal: LocationEnum.Niigata },
    { name: "Fukushima", internal: LocationEnum.Fukushima },
    { name: "Nakayama", internal: LocationEnum.Nakayama },
    { name: "Tokyo", internal: LocationEnum.Tokyo },
    { name: "Chukyo", internal: LocationEnum.Chukyo },
    { name: "Kyoto", internal: LocationEnum.Kyoto },
    { name: "Hanshin", internal: LocationEnum.Hanshin },
    { name: "Kokura", internal: LocationEnum.Kokura },
    { name: "Ooi", internal: LocationEnum.Ooi },
    { name: "Kawasaki", internal: LocationEnum.Kawasaki },
    { name: "Chukyo", internal: LocationEnum.Kyoto },
    { name: "Funabashi", internal: LocationEnum.Funabashi },
    { name: "Morioka", internal: LocationEnum.Morioka },
    { name: "Longchamp", internal: LocationEnum.Longchamp },
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
      case LocationEnum.Chukyo:
        return chukyoData;
      case LocationEnum.Fukushima:
        return fukishimaData;
      case LocationEnum.Funabashi:
        return funabashiData;
      case LocationEnum.Hanshin:
        return hanshinData;
      case LocationEnum.Kawasaki:
        return kawasakiData;
      case LocationEnum.Kokura:
        return kokuraData;
      case LocationEnum.Longchamp:
        return longchampData;
      case LocationEnum.Morioka:
        return moriokaData;
      case LocationEnum.Nakayama:
        return nakayamaData;
      case LocationEnum.Ooi:
        return ooiData;
      case LocationEnum.Tokyo:
        return tokyoData;
      default:
        return kyotoData;
    }

  }

}