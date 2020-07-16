import { Component, OnInit, Input } from '@angular/core';
import { HCMapResource } from '../../services/hcmap-data.service';
import * as h3 from 'h3-js';

@Component({
  selector: 'app-resources-card',
  templateUrl: './resources-card.component.html',
  styleUrls: ['./resources-card.component.scss'],
})
export class ResourcesCardComponent implements OnInit {

  @Input() resources: HCMapResource[];

  constructor() {}

  ngOnInit() {}

  hexSize() {
    if (this.resources.length > 0) {
      const length = h3.edgeLength(this.resources[0].level, 'km');
      return Math.round(length * 10) / 10;
    } else {
      return '0';
    }
  }
}
