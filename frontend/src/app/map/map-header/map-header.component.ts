import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { ModalController, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-map-header',
  templateUrl: './map-header.component.html',
  styleUrls: ['./map-header.component.scss'],
})
export class MapHeaderComponent implements OnInit {
  @Input() isHexSelected:boolean=false;
  @Output() newSearch = new EventEmitter<string>();
  @Output() changeCategory = new EventEmitter<string>();

  howSearchbar: boolean;
  searchText = '';
  category = 'all';

  constructor() { }
  // constructor(
  //   public modalCtrl: ModalController,
  //   public routerOutlet: IonRouterOutlet
  // ) { }

  ngOnInit() {}

  updateSearch() {
    this.newSearch.emit(this.searchText);
  }
  updateCategory() {
    this.changeCategory.emit(this.category);
  }

    // async createModelWithReturn() {
  //   const modal = await this.modalCtrl.create({
  //     component:  YourComponent ,
  //     swipeToClose: true,
  //     mode: 'ios', //to show as stack over
  //     presentingElement: this.routerOutlet.nativeEl,
  //     componentProps: { excludedTracks: this.excludeTracks }
  //   });
  //   await modal.present();

  //   const { data } = await modal.onWillDismiss();
  //   if (data) {
  //     this.excludeTracks = data;
  //     // this.updateWhatever();
  //   }
  // }

}
