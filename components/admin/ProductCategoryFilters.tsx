"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

type Props = {
  categories: Category[];
  initialCategoryId: string;
  initialSubcategoryId: string;
};

export default function ProductCategoryFilters({
  categories,
  initialCategoryId,
  initialSubcategoryId,
}: Props) {
  const [categoryId, setCategoryId] = useState(
    initialCategoryId,
  );

  const [subcategoryId, setSubcategoryId] = useState(
    initialSubcategoryId,
  );

  const mainCategories = categories.filter(
    category => category.parentId === null,
  );

  const subcategories = categories.filter(
    category =>
      category.parentId !== null &&
      (!categoryId || category.parentId === categoryId),
  );

  const selectClass =
    "h-11 w-full rounded-lg border border-[#E8E5DF] bg-white px-3 text-sm outline-none focus:border-[#C3AA84] disabled:opacity-50";

  return (
    <>
      <select
        name="categoryId"
        aria-label="Categoría"
        value={categoryId}
        onChange={event => {
          setCategoryId(event.target.value);
          setSubcategoryId("");
        }}
        className={selectClass}
      >
        <option value="">Todas las categorías</option>

        {mainCategories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        name="subcategoryId"
        aria-label="Subcategoría"
        value={subcategoryId}
        onChange={event =>
          setSubcategoryId(event.target.value)
        }
        disabled={subcategories.length === 0}
        className={selectClass}
      >
        <option value="">Todas las subcategorías</option>

        {subcategories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </>
  );
}
