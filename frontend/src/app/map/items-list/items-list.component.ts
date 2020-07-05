import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../interfaces/item';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent implements OnInit {

  @Input() itemsList : Item[]=[];
  @Input() isHexSelected:boolean=false;

  constructor() { }

  ngOnInit() {}

}
