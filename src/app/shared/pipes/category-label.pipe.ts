import { Pipe, PipeTransform } from '@angular/core';
import { CategoryService } from '../../core/category.service';

@Pipe({
  name: 'categoryLabel',
  standalone: true
})
export class CategoryLabelPipe implements PipeTransform {
  constructor(private categoryService: CategoryService) {}

  transform(value: number | null | undefined): string {
    return this.categoryService.getLabel(value);
  }
}
