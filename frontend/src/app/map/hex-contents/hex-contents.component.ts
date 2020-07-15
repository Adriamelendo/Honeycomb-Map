import { Component, OnInit, Input } from '@angular/core';
import { HexContents } from '../../services/hcmap-data.service';

@Component({
  selector: 'app-hex-contents',
  templateUrl: './hex-contents.component.html',
  styleUrls: ['./hex-contents.component.scss'],
})
export class HexContentsComponent implements OnInit {

  @Input() hexContents: HexContents;
  @Input() isHexSelected:boolean = false;

  constructor() {}

  ngOnInit() {}

}
