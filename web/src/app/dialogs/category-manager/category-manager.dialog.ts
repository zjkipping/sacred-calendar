import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';

import { Category, CategoryFormValue } from '@types';
import { DataService } from '@services/data.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-category-manager-dialog',
  templateUrl: './category-manager.dialog.html',
  styleUrls: ['./category.manager.dialog.scss']
})
export class CategoryManagerDialogComponent {
  categoriesForm?: FormArray;
  categories: Category[] = [];

  constructor(private fb: FormBuilder, ds: DataService, private ref: MatDialogRef<CategoryManagerDialogComponent>) {
    ds.getCategories().subscribe(data => {
      this.categories = data;
      this.categoriesForm = fb.array(data.map(category => fb.group({
        name: [category.name, Validators.required],
        color: [category.color, Validators.required],
        new: [false],
        delete: [false],
        id: [category.id]
      })));
    });
  }

  submitCategories() {
    if (this.categoriesForm) {
      const formValues: CategoryFormValue[] = [];
      this.categoriesForm.controls.forEach(control => {
        const group = control as FormGroup;
        if (group.dirty) {
          formValues.push(group.value);
        }
      });
      this.ref.close(formValues);
    } else {
      this.ref.close([]);
    }
  }

  addCategory() {
    if (this.categoriesForm) {
      this.categoriesForm.push(this.fb.group({
        name: ['', Validators.required],
        color: ['#ffffff', Validators.required],
        new: [true],
        delete: [false]
      }));
    }
  }

  deleteCategory(index: number) {
    if (this.categoriesForm) {
      if ((this.categoriesForm.at(index) as FormGroup).value.new) {
        this.categoriesForm.removeAt(index);
      } else {
        ((this.categoriesForm.at(index) as FormGroup).get('delete') as FormControl).setValue(true);
        (this.categoriesForm.at(index) as FormGroup).markAsDirty();
      }
    }
  }

  setColor(hex: string, category: FormGroup) {
    const color = category.get('color');
    if (color && hex !== color.value) {
      (category.get('color') as FormControl).setValue(hex);
      (category.get('color') as FormControl).markAsDirty();
    }
  }
}
