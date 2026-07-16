import { Pipe, PipeTransform } from '@angular/core';
import { CategoryService } from '../../core/category.service';

@Pipe({
  name: 'categoryLabel',
  standalone: true
})
export class CategoryLabelPipe implements PipeTransform {
  constructor(private categoryService: CategoryService) {}

  transform(value: any, key?: string): string {
    if (key === 'categoryId' || key === 'category_id') {
      return this.categoryService.getCookieLabel(value);
    }
    return this.categoryService.getLabel(value);
  }
}
