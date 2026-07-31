export type ThicknessOption = {
  value: number;
  label: string;
};

export type StandardMattressSize = {
  name: string;
  width: number;
  lengths: number[];
};

export const thicknessOptions: ThicknessOption[] = [
  {
    value: 10,
    label: "10 cm",
  },
  {
    value: 15,
    label: "15 cm",
  },
  {
    value: 20,
    label: "20 cm",
  },
];

export const standardMattressSizes: StandardMattressSize[] = [
  {
    name: "1 Plaza",
    width: 90,
    lengths: [190, 200],
  },
  {
    name: "1½ Plaza",
    width: 105,
    lengths: [190, 200],
  },
  {
    name: "2 Plazas",
    width: 150,
    lengths: [190, 200],
  },
  {
    name: "Queen",
    width: 160,
    lengths: [200],
  },
  {
    name: "King",
    width: 180,
    lengths: [200],
  },
  {
    name: "Super King",
    width: 200,
    lengths: [200],
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function recognizeMattressSize(
  length: number,
  width: number,
) {
  if (!length || !width) {
    return null;
  }

  const tolerance = 2;

  return (
    standardMattressSizes.find((size) => {
      const widthMatches =
        Math.abs(width - size.width) <= tolerance;

      const lengthMatches = size.lengths.some(
        (standardLength) =>
          Math.abs(length - standardLength) <=
          tolerance,
      );

      return widthMatches && lengthMatches;
    }) ?? null
  );
}

export function calculateMattressPrice({
  length,
  width,
  thickness,
}: {
  length: number;
  width: number;
  thickness: number;
}) {
  if (
    !length ||
    !width ||
    length <= 0 ||
    width <= 0
  ) {
    return 0;
  }

  const areaFactor =
    (length * width) / 10000;

  const thicknessFactor =
    thickness / 10;

  // Fórmula provisional.
  // Luego se reemplazará por la tabla real de Incal.
  const calculatedPrice =
    72000 *
    areaFactor *
    thicknessFactor;

  return (
    Math.round(calculatedPrice / 1000) *
    1000
  );
}