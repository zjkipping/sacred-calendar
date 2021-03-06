import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatSortModule,
  MatTableModule,
  MatToolbarModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatSelectModule,
  MatRadioModule,
  MatPaginatorModule,
  MatGridListModule,
  MatExpansionModule
} from '@angular/material';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@NgModule({
  imports: [
    CommonModule,
    NgxMaterialTimepickerModule.forRoot(),
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatBadgeModule,
    MatSidenavModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDialogModule,
    MatRadioModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatGridListModule,
    MatExpansionModule
  ],
  exports: [
    NgxMaterialTimepickerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatToolbarModule,
    MatInputModule,
    MatSortModule,
    MatTableModule,
    MatCardModule,
    MatListModule,
    MatBadgeModule,
    MatSidenavModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDialogModule,
    MatRadioModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatGridListModule,
    MatExpansionModule
  ]
})

export class MaterialModule { }
