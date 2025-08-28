export interface ZakatNisabType {
    code: number,
    status: string,
    calculation_standard: string,
    currency: string,
    weight_unit: string,
    updated_at: string,
    data: {
        nisab_thresholds: {
            gold: {
                weight: number,
                unit_price: number,
                nisab_amount: number
            },
            silver: {
                weight: number,
                unit_price: number,
                nisab_amount: number
            }
        },
        zakat_rate: string,
        notes: string
    }

}