/**
 * Sale Number Generation Service
 * Genera números de venta únicos con formato específico
 */
export class SaleNumberGenerationService {
  /**
   * Genera un número de venta con formato: YYYYMMDD-OUTLET-SEQUENCE
   * Ejemplo: 20251010-OUT001-00042
   */
  generate(outletId: string, sequence: number, date: Date = new Date()): string {
    // Formato de fecha: YYYYMMDD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}${month}${day}`

    // Outlet ID truncado/formateado (primeros 6 caracteres)
    const outletCode = this.formatOutletCode(outletId)

    // Secuencia con padding (5 dígitos)
    const sequenceStr = String(sequence).padStart(5, '0')

    return `${dateStr}-${outletCode}-${sequenceStr}`
  }

  /**
   * Genera un número de venta corto para recibos
   * Formato: OUTLET-SEQUENCE
   * Ejemplo: OUT1-042
   */
  generateShort(outletId: string, sequence: number): string {
    const outletCode = this.formatOutletCode(outletId, 4)
    const sequenceStr = String(sequence).padStart(3, '0')
    return `${outletCode}-${sequenceStr}`
  }

  /**
   * Genera un número de venta con prefijo personalizado
   */
  generateWithPrefix(
    prefix: string,
    outletId: string,
    sequence: number,
    date: Date = new Date()
  ): string {
    const baseSaleNumber = this.generate(outletId, sequence, date)
    return `${prefix}-${baseSaleNumber}`
  }

  /**
   * Extrae la fecha de un número de venta
   */
  extractDate(saleNumber: string): Date | null {
    const parts = saleNumber.split('-')
    if (parts.length < 3) return null

    const dateStr = parts[0]
    if (dateStr.length !== 8) return null

    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))

    const date = new Date(year, month, day)
    return isNaN(date.getTime()) ? null : date
  }

  /**
   * Extrae el outlet ID de un número de venta
   */
  extractOutletCode(saleNumber: string): string | null {
    const parts = saleNumber.split('-')
    return parts.length >= 3 ? parts[1] : null
  }

  /**
   * Extrae la secuencia de un número de venta
   */
  extractSequence(saleNumber: string): number | null {
    const parts = saleNumber.split('-')
    if (parts.length < 3) return null

    const sequenceStr = parts[parts.length - 1]
    const sequence = parseInt(sequenceStr)
    return isNaN(sequence) ? null : sequence
  }

  /**
   * Valida el formato de un número de venta
   */
  validate(saleNumber: string): boolean {
    // Formato esperado: YYYYMMDD-OUTLET-NNNNN
    const pattern = /^\d{8}-[A-Z0-9]{4,6}-\d{5}$/
    return pattern.test(saleNumber)
  }

  /**
   * Valida el formato de un número de venta corto
   */
  validateShort(saleNumber: string): boolean {
    // Formato esperado: OUTLET-NNN
    const pattern = /^[A-Z0-9]{4}-\d{3}$/
    return pattern.test(saleNumber)
  }

  /**
   * Calcula el siguiente número de secuencia
   * Esta es una implementación simple. En producción, esto debería
   * consultar la base de datos para obtener el último número usado.
   */
  calculateNextSequence(lastSequence: number, resetDaily: boolean = true): number {
    if (!resetDaily) {
      // Si no se resetea diariamente, se puede implementar una lógica diferente
    }
    // En un sistema real, verificaría si es un nuevo día y resetearía
    return lastSequence + 1
  }

  /**
   * Genera múltiples números de venta consecutivos
   */
  generateBatch(
    outletId: string,
    startSequence: number,
    count: number,
    date: Date = new Date()
  ): string[] {
    const saleNumbers: string[] = []

    for (let i = 0; i < count; i++) {
      const sequence = startSequence + i
      saleNumbers.push(this.generate(outletId, sequence, date))
    }

    return saleNumbers
  }

  /**
   * Formatea el código del outlet
   */
  private formatOutletCode(outletId: string, maxLength: number = 6): string {
    // Convertir a uppercase y tomar solo caracteres alfanuméricos
    const cleaned = outletId.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // Si es más corto que maxLength, padding con ceros
    if (cleaned.length < maxLength) {
      return cleaned.padEnd(maxLength, '0')
    }

    // Si es más largo, truncar
    return cleaned.substring(0, maxLength)
  }

  /**
   * Genera un número de venta con checksum para validación
   */
  generateWithChecksum(
    outletId: string,
    sequence: number,
    date: Date = new Date()
  ): string {
    const baseSaleNumber = this.generate(outletId, sequence, date)
    const checksum = this.calculateChecksum(baseSaleNumber)
    return `${baseSaleNumber}-${checksum}`
  }

  /**
   * Calcula un checksum simple para un número de venta
   */
  private calculateChecksum(saleNumber: string): string {
    // Algoritmo simple de checksum: suma de códigos ASCII módulo 36
    let sum = 0
    for (let i = 0; i < saleNumber.length; i++) {
      sum += saleNumber.charCodeAt(i)
    }
    return (sum % 36).toString(36).toUpperCase()
  }

  /**
   * Verifica el checksum de un número de venta
   */
  verifyChecksum(saleNumberWithChecksum: string): boolean {
    const parts = saleNumberWithChecksum.split('-')
    if (parts.length !== 4) return false

    const checksum = parts[3]
    const baseSaleNumber = parts.slice(0, 3).join('-')
    const expectedChecksum = this.calculateChecksum(baseSaleNumber)

    return checksum === expectedChecksum
  }
}
