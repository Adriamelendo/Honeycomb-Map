import { Component, OnChanges, Input } from '@angular/core';
import { HCMapRegion, HexContents } from '../../services/hcmap-data.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-hex-contents',
  templateUrl: './hex-contents.component.html',
  styleUrls: ['./hex-contents.component.scss'],
})
export class HexContentsComponent implements OnChanges {

  @Input() hexContents: HexContents;
  @Input() isOpen: boolean = false;
  towns: HCMapRegion[] = [];
  provinces: HCMapRegion[] = [];
  showNoResult: boolean = true;

  layout1:boolean = true;
  layout2:boolean = false;
  layout3:boolean = false;
  layout4:boolean = false;



  constructor() { }

  ngOnChanges() {
    console.log('HexContents');
    this.showNoResult = true;
    let numPanels = 0;
    if (this.hexContents) {
      console.log('regions:', this.hexContents.regions);
      console.log('resources:', this.hexContents.resources);
      if (this.hexContents.resources.length !== 0) {
        this.showNoResult = false;
        numPanels++;
      }

      this.towns = [];
      this.provinces = [];

      this.hexContents.regions.forEach(reg => {
        if (reg.resources.length !== 0) {
          if (reg.type === 'town') {
            this.towns.push(reg);
            this.showNoResult = false;
            numPanels++;
          }
          if (reg.type === 'province') {
            this.provinces.push(reg);
            this.showNoResult = false;
            numPanels++;
          }
        }
      });
      console.log('We must draw '+numPanels+' panels');
      this.layout1=false;
      this.layout2=false;
      this.layout3=false;
      this.layout4=false;
      switch(numPanels) { 
        case 3: { 
           this.layout1=true;
           console.log('layout1');
           break; 
        } 
        case 2: { 
          if (this.hexContents.resources.length == 0) {
            this.layout2=true;
            console.log('layout2');
          } else {
            this.layout3=true;
            console.log('layout3');
          }
           break; 
        } 
        case 1: { 
          this.layout4=true; 
          console.log('layout4');
          break; 
       }
     } 

    } else {
      console.log('empty');
    }

  }

}
