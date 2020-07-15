import { Component, OnChanges, Input } from '@angular/core';
import { HexContents } from '../../services/hcmap-data.service';

@Component({
  selector: 'app-hex-contents',
  templateUrl: './hex-contents.component.html',
  styleUrls: ['./hex-contents.component.scss'],
})
export class HexContentsComponent implements OnChanges {

  @Input() hexContents: HexContents;
  @Input() isOpen:boolean = false;

  constructor() {}

  ngOnChanges() {
    /* console.log('HexContents'); */
    /* if (this.hexContents) { */
    /*   console.log('regions:', this.hexContents.regions); */
    /*   console.log('resources:', this.hexContents.resources); */
    /* } else { */
    /*   console.log('empty'); */
    /* } */
  }

}
