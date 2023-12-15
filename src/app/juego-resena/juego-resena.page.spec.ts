import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JuegoResenaPage } from './juego-resena.page';

describe('JuegoResenaPage', () => {
  let component: JuegoResenaPage;
  let fixture: ComponentFixture<JuegoResenaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(JuegoResenaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
