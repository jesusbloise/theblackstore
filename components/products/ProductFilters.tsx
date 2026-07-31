"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

export type CatalogFilters = {
  types: string[];
  sizes: string[];
  minPrice: string;
  maxPrice: string;
};

type ProductFiltersProps = {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
  className?: string;
  showCard?: boolean;
};

const typeOptions = [
  {
    value: "espuma",
    label: "Espuma",
  },
  {
    value: "resortes",
    label: "Resortes",
  },
  {
    value: "a-medida",
    label: "A medida",
  },
];

const sizeOptions = [
  {
    value: "1-plaza",
    label: "1 plaza",
  },
  {
    value: "1-5-plazas",
    label: "1,5 plazas",
  },
  {
    value: "2-plazas",
    label: "2 plazas",
  },
  {
    value: "queen",
    label: "Queen",
  },
  {
    value: "king",
    label: "King",
  },
];

function toggleValue(
  values: string[],
  value: string,
): string[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

export function ProductFilters({
  filters,
  onChange,
  onReset,
  className = "",
  showCard = true,
}: ProductFiltersProps) {
  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.sizes.length > 0 ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "";

  const content = (
    <>
      <div>
        <h3 className="font-bold text-brand-950">
          Tipo de colchón
        </h3>

        <div className="mt-4 space-y-3">
          {typeOptions.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={filters.types.includes(option.value)}
              onChange={() =>
                onChange({
                  ...filters,
                  types: toggleValue(
                    filters.types,
                    option.value,
                  ),
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="font-bold text-brand-950">
          Tamaño
        </h3>

        <div className="mt-4 space-y-3">
          {sizeOptions.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={filters.sizes.includes(option.value)}
              onChange={() =>
                onChange({
                  ...filters,
                  sizes: toggleValue(
                    filters.sizes,
                    option.value,
                  ),
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="font-bold text-brand-950">
          Precio
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={filters.minPrice}
            placeholder="Desde"
            aria-label="Precio mínimo"
            onChange={(event) =>
              onChange({
                ...filters,
                minPrice: event.target.value,
              })
            }
          />

          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={filters.maxPrice}
            placeholder="Hasta"
            aria-label="Precio máximo"
            onChange={(event) =>
              onChange({
                ...filters,
                maxPrice: event.target.value,
              })
            }
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="border-t border-slate-200 pt-6">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onReset}
          >
            <RotateCcw size={17} />
            Limpiar filtros
          </Button>
        </div>
      )}
    </>
  );

  if (!showCard) {
    return (
      <div
        className={[
          "space-y-7",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {content}
      </div>
    );
  }

  return (
    <Card
      variant="outlined"
      padding="md"
      className={className}
    >
      <CardHeader>
        <CardTitle>Filtrar productos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-7">
        {content}
      </CardContent>
    </Card>
  );
}