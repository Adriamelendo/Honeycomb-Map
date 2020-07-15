import { Component, OnInit, Input } from '@angular/core';
import { HCMapResource } from '../../services/hcmap-data.service';

@Component({
  selector: 'app-resources-card',
  templateUrl: './resources-card.component.html',
  styleUrls: ['./resources-card.component.scss'],
})
export class ResourcesCardComponent implements OnInit {

  @Input() resources: HCMapResource[];

  constructor() {}

  ngOnInit() {}
}
