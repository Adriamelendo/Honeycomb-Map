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
  public resource: HCMapResource;

  constructor(
    private data: HCMapDataService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.data.getResourceById(parseInt(id))
      .subscribe((resource) => {
        this.resource = resource;
      });
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Inbox' : '';
  }
}
