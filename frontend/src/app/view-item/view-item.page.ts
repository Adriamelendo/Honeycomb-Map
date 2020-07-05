import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService, Item } from '../services/data.service';

@Component({
  selector: 'app-view-item',
  templateUrl: './view-item.page.html',
  styleUrls: ['./view-item.page.scss'],
})
export class ViewItemPage implements OnInit {
  public item: Item;

  constructor(
    private data: DataService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.item = this.data.getItemById(id);
    if(this.item !== undefined) {
      this.item.read=true;
    } else { 
      console.log('Item '+id+' is not inside current data, retriving from backend');
      this.item = await this.data.getItemByIdFromBackend(id);
      if(this.item !== undefined) {
        this.item.read=true;
      } else { 
        console.log('Item '+id+' do not exist in backend');
      }
    }
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Inbox' : '';
  }
}
