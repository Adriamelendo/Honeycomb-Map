import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';

@Component({
  selector: 'app-map-header',
  templateUrl: './map-header.component.html',
  styleUrls: ['./map-header.component.scss'],
})
export class MapHeaderComponent implements OnInit {
  @Output() newSearch = new EventEmitter<string>();
  @Output() changeCategory = new EventEmitter<string>();

  @ViewChild(IonSearchbar) searchbar: IonSearchbar;

  public showSearchbar = false;
  public searchText = '';
  public category = '';

  public constructor() { }

  public ngOnInit() {}

  public openSearchbar() {
    this.showSearchbar = true;
    setTimeout(() => this.searchbar.setFocus(), 500);
  }

  public closeSearchbar() {
    this.showSearchbar = false;
    this.searchText = '';
    this.updateSearch();
  }

  public updateSearch() {
    if (this.searchText.length === 0 ||
        this.searchText.length > 3) {
      this.newSearch.emit(this.searchText);
    }
  }

  public updateCategory() {
    this.changeCategory.emit(this.category);
  }
}
