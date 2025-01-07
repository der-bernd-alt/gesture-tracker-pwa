import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumanMeshBackgroundComponent } from './human-mesh-background.component';

describe('HumanMeshBackgroundComponent', () => {
  let component: HumanMeshBackgroundComponent;
  let fixture: ComponentFixture<HumanMeshBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HumanMeshBackgroundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HumanMeshBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
