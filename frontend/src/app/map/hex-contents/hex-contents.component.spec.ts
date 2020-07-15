import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HexContentsComponent } from './hex-contents.component';

describe('HexContentsComponent', () => {
  let component: HexContentsComponent;
  let fixture: ComponentFixture<HexContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HexContentsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HexContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
