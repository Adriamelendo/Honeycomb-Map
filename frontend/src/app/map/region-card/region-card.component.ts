import { Component, OnInit, Input } from '@angular/core';
import { HCMapRegion } from '../../services/hcmap-data.service';

@Component({
  selector: 'app-region-card',
  templateUrl: './region-card.component.html',
  styleUrls: ['./region-card.component.scss'],
})
export class RegionCardComponent implements OnInit {

  @Input() region: HCMapRegion;

  constructor() {}

  ngOnInit() {}

  public regionTitle() {
    if (this.region.type === 'province') {
      return `En la provincia de`;
    } else if (this.region.type === 'town') {
      return `En el municipio de`;
    } else {
      throw new Error('Unknown region type');
    }
  }
}
