// types/signalr.ts

export interface SignalRMessage {
    success: boolean;
    product: {
        id?: string;
        name?: string;
        epc?: string;
        imageUrl?: string;
        netWeight?: string;
        pieces?: string;
        unitOfMeasure?: string;
        printCard?: string;
        tipoEtiqueta?: string;
        area?: string;
        claveProducto?: string;
        pesoBruto?: string;
        pesoTarima?: string;
        fechaEntrada?: string;
        horaEntrada?: string;
        rfid?: string;
    };
    operatorInfo?: {
        nombreOperador?: string;
    } | null;
    rssi?: number;
    antennaPort?: number;
    timestamp?: string;
}
