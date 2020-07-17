import { Component, OnChanges, OnInit, Input, HostListener, ViewChild } from '@angular/core';
import { HexContents, HCMapRegion, HCMapResource } from '../../services/hcmap-data.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { IonSlides, Platform } from '@ionic/angular';



@Component({
  selector: 'app-hex-contents',
  templateUrl: './hex-contents.component.html',
  styleUrls: ['./hex-contents.component.scss'],
})
export class HexContentsComponent implements OnChanges, OnInit {

  @Input() hexContents: HexContents;
  
  public towns: HCMapRegion[];
  public provinces: HCMapRegion[];
  public resources: HCMapResource[];

  biggerThan680: boolean = false;
  lower680Class:string = 'right-panel mobile-panel';

  showNext:boolean = false;
  showPrev:boolean = false;

  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  constructor(public platform: Platform) {}
  
  ngOnInit() {
    console.log(this.platform.width());
    if (this.platform.width() > 680) {
      this.biggerThan680 = true;
    } else {
      this.biggerThan680 = false;
    }    
  }  
  @ViewChild(IonSlides) slides: IonSlides;
  slidePrev() {
    this.slides.slidePrev();
  }
  slideNext() {
    this.slides.slideNext();
  }

  @HostListener('window:resize', ['$event'])onResize(event) {
    console.log(this.platform.width());
    if (this.platform.width() > 680) {
      this.biggerThan680 = true;
    } else {
      this.biggerThan680 = false;
    }
  }


  calculateArrows() {  
    console.log('calculating arrows')  
    this.slides.isEnd().then(isEnd => {
      this.showNext = !isEnd;
    });
    this.slides.isBeginning().then(isBeginning => {
      this.showPrev = !isBeginning;
    });
  }

  ngOnChanges() {
    console.log('HexContents');
    
    if (this.hexContents) {
      this.towns = this.hexContents.regions.filter(
        (region) => (region.type === 'town' &&
          region.resources.length > 0)
      );
      this.provinces = this.hexContents.regions.filter(
        (region) => (region.type === 'province' &&
          region.resources.length > 0)
      );
      this.resources = this.hexContents.resources;

      if( this.slides) this.slides.slideTo(0);
      this.showPrev = false;
      this.showNext = false;
      let count = 0;
      if(this.hasResources()) count++;
      if(this.hasTowns()) count++;
      if(this.hasProvinces()) count++;
      if(count>1) this.showNext = true;
      
      
    } else {
      this.towns = [];
      this.provinces = [];
      this.resources = [];
      this.showNext = false;
      this.showPrev = false;
    }

    console.log('towns:', this.towns);
    console.log('provinces:', this.towns);
    console.log('resources:', this.resources);
    
  }

  public hasTowns() {
    return (this.towns.length > 0);
  }

  public hasProvinces() {
    return (this.provinces.length > 0);
  }

  public hasResources() {
    return (this.resources.length > 0);
  }

  public resourcesClass() {
    let position;
    if (!this.hasTowns() && !this.hasProvinces()) {
      position = 'unique-panel';
    } else if (this.hasTowns() && this.hasProvinces()) {
      position = 'first-panel';
    } else {
      position = 'second-upper-panel';
    }
    return 'right-panel ' + position;
  }

  public townsClass() {
    let position;
    if (!this.hasResources() && !this.hasProvinces()) {
      position = 'unique-panel';
    } else if (this.hasResources() && !this.hasProvinces()) {
      position = 'second-lower-panel';
    } else {
      position = 'second-upper-panel';
    }
    return 'right-panel ' + position;
  }

  public provincesClass() {
    let position;
    if (!this.hasResources() && !this.hasTowns()) {
      position = 'unique-panel';
    } else {
      position = 'second-lower-panel';
    }
    return 'right-panel ' + position;
  }
}
