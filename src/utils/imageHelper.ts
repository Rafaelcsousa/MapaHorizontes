/**
 * Utilitário para conversão de URLs de Imagens.
 * Converte automaticamente links de compartilhamento do Google Drive (ex: https://drive.google.com/file/d/FILE_ID/view?usp=sharing)
 * em links diretos de visualização de imagem embeddáveis em tags <img> HTML.
 */
export function convertDriveUrlToDirectImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Verifica se é um link do Google Drive
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    // Padrão 1: /file/d/FILE_ID/view...
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }

    // Padrão 2: id=FILE_ID
    const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (queryIdMatch && queryIdMatch[1]) {
      const fileId = queryIdMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  }

  return trimmed;
}
