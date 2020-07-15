import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HCMapResource, HCMapDataService } from '../services/hcmap-data.service';
import { Item } from '../interfaces/item';

@Component({
  selector: 'app-view-item',
  templateUrl: './view-item.page.html',
  styleUrls: ['./view-item.page.scss'],
})
export class ViewItemPage implements OnInit {
  public item: HCMapResource;

  constructor(
    private data: HCMapDataService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.item = this.data.getResourceOfId(parseInt(id));
    if(this.item == undefined) {
      console.log('Item '+id+' is not inside current data, retriving from backend');
      // this.item = await this.data.getItemByIdFromBackend(id);
      // if(this.item !== undefined) {
      //   this.item.read=true;
      // } else { 
      //   console.log('Item '+id+' do not exist in backend');
      // }
    }
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Inbox' : '';
  }
}
