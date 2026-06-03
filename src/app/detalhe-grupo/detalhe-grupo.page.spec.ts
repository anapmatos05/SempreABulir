import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalheGrupoPage } from './detalhe-grupo.page';

describe('DetalheGrupoPage', () => {
  let component: DetalheGrupoPage;
  let fixture: ComponentFixture<DetalheGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalheGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
