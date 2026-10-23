/**
 * Utility to remove accents / tildes from text while preserving capitalization.
 * Specifically converts:
 * Á -> A, É -> E, Í -> I, Ó -> O, Ú -> U
 * á -> a, é -> e, í -> i, ó -> o, ú -> u
 */
export const removeAccents = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};
