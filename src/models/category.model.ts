import { Category } from "../types";
import { categories } from "../data/categories";

export class CategoryModel {
  /**
   * Mengambil semua kategori yang ada.
   */
  static findAll(): Category[] {
    return categories;
  }
}
