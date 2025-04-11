
"use client"
// types/productStore.ts

export interface Product {
    id: string;
    name: string;
    epc: string;
    status: 'pending' | 'success' | 'error';
    imageUrl: string;
    netWeight: string;
    pieces: string;
    unitOfMeasure: string;
    printCard: string;
    operator: string;
    tipoEtiqueta: string;
    area: string;
    claveProducto: string;
    pesoBruto: string;
    pesoTarima: string;
    fechaEntrada: string;
    horaEntrada: string;
    rfid: string;
}

export interface OperatorInfo {
    nombreOperador?: string;
}



export interface ProductData {
    success: boolean;
    product: Product;
    operatorInfo: OperatorInfo | null;
    rssi: number;
    antennaPort: number;
    timestamp: string;
}