export interface TRMData {
  valor: number;
  valorFormateado: string;
  vigencia: string;
}

export const ENDPOINT_TRM = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciahasta%20DESC';

export async function fetchLiveTRM(): Promise<TRMData> {
  try {
    const response = await fetch(ENDPOINT_TRM);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.length > 0) {
      const record = data[0];
      const numericValue = parseFloat(record.valor);
      
      const valorFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericValue);

      const rawDate = record.vigenciahasta || record.vigenciadesde;
      let vigencia = rawDate;
      if (rawDate) {
        const parts = rawDate.split('T')[0].split('-');
        if (parts.length === 3) {
          const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          vigencia = dateObj.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
      }

      return {
        valor: numericValue,
        valorFormateado: `${valorFormateado} COP`,
        vigencia
      };
    }
    throw new Error('No data received from TRM API');
  } catch (err) {
    return {
      valor: 4150.00,
      valorFormateado: '$ 4.150,00 COP',
      vigencia: new Date().toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  }
}
