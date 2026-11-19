export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Case- and accent-insensitive: "gonzalez" finds "González". */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export const filterOptions = (options: ComboboxOption[], query: string) => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return options.filter((option) => {
    const label = normalize(option.label);
    return words.every((word) => label.includes(word));
  });
};
