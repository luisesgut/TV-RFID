"use client"

import React, { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Package2, Scale, Hash, MapPin, Clock, Timer, User, Volume2 } from 'lucide-react'
import { useSignalRConnection } from '../hooks/useSIgnalRConnection'
import { useProductStore } from '../store/productStore'
import { formatDate } from '../utils/dateUtils'

export default function ProductDisplay() {
    // Iniciar la conexión SignalR
    const connection = useSignalRConnection();

    // Obtener el store
    const productStore = useProductStore();

    // Estado local para controlar la visibilidad
    const [showProduct, setShowProduct] = useState<boolean>(!!productStore.currentProduct);

    // Verificar si hay un producto para mostrar
    const hasProduct = !!productStore.currentProduct && showProduct;

    // Estado para controlar el tiempo de inactividad
    const [lastActivityTime, setLastActivityTime] = useState<number>(0);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Referencia para el elemento de audio
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Estado para controlar el sonido
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

    // Configuración del tiempo de inactividad (15 segundos)
    const INACTIVITY_TIMEOUT = 15000;

    // Efecto para detectar cuando llega un nuevo producto y actualizar el tiempo de actividad
    useEffect(() => {
        if (productStore.currentProduct) {
            // Actualizar el tiempo de última actividad cuando llega un nuevo producto
            setLastActivityTime(Date.now());
            setShowProduct(true);

            // Reproducir sonido de notificación (solo intentar si soundEnabled está activo)
            if (soundEnabled && audioRef.current) {
                // Usar un contexto de audio para evitar restricciones de reproducción automática
                try {
                    // Para navegadores que lo soportan, creamos un AudioContext
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioContext) {
                        const audioContext = new AudioContext();
                        // Este paso puede "desbloquear" el audio en algunos navegadores
                        if (audioContext.state === 'suspended') {
                            audioContext.resume();
                        }
                    }

                    // Configurar volumen y reproducir sonido
                    audioRef.current.volume = 0.5;

                    // Intentar reproducir (puede fallar si el usuario no ha interactuado con la página)
                    const playPromise = audioRef.current.play();

                    // Manejar el error silenciosamente (no mostrar error en consola)
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            // Los errores de reproducción automática son esperados, no los mostramos
                            console.log("No se pudo reproducir automáticamente el sonido (requiere interacción del usuario)");
                        });
                    }
                } catch (err) {
                    console.log("No se pudo inicializar el audio");
                }
            }
        }
    }, [productStore.currentProduct, soundEnabled]);

    // Efecto para verificar el tiempo de inactividad
    useEffect(() => {
        // Función para verificar la inactividad
        const checkInactivity = () => {
            if (productStore.currentProduct && showProduct && (Date.now() - lastActivityTime > INACTIVITY_TIMEOUT)) {
                console.log('Inactividad detectada - volviendo a pantalla de espera');
                setShowProduct(false);
            }
        };

        // Iniciar el temporizador
        inactivityTimerRef.current = setInterval(checkInactivity, 1000);

        // Limpiar el temporizador al desmontar
        return () => {
            if (inactivityTimerRef.current) {
                clearInterval(inactivityTimerRef.current);
            }
        };
    }, [productStore.currentProduct, lastActivityTime, showProduct]);

    // Función para cambiar el estado del sonido
    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
    };

    // Datos del producto (solo cuando hay un producto activo)
    const productData = productStore.currentProduct ? {
        date: formatDate(productStore.currentProduct.product.fechaEntrada),
        name: productStore.currentProduct.product.name,
        code: productStore.currentProduct.product.claveProducto,
        weight: `${productStore.currentProduct.product.netWeight} ${productStore.currentProduct.product.unitOfMeasure}`,
        pieces: productStore.currentProduct.product.pieces || "N/A",
        area: productStore.currentProduct.product.area,
        shift: "TURNO NEGRO", // Este dato no viene de la API, se mantiene por defecto
        image: productStore.currentProduct.product.imageUrl || "/placeholder.svg?height=300&width=300",
        entryTime: productStore.currentProduct.product.horaEntrada,
        operator: productStore.currentProduct.product.operator
    } : null;

    function ProductDetail({
                               icon,
                               label,
                               value,
                               highlight = false,
                           }: {
        icon: React.ReactNode;
        label: string;
        value: string;
        highlight?: boolean;
    }) {
        return (
            <div className={`rounded-md p-5 ${highlight ? 'bg-[#00A859]' : 'bg-gray-50 border-l-4 border-[#006341]'}`}>
                <div className="flex items-center gap-4">
                    <div className="shrink-0">{icon}</div>
                    <div className="flex-1">
                        <p className={`text-lg font-medium ${highlight ? 'text-white' : 'text-[#006341]'}`}>{label}</p>
                        <p className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-[#333333]'}`}>{value}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex min-h-screen flex-col bg-white">
            {/* Elemento de audio para sonido de notificación */}
            <audio ref={audioRef} preload="auto">
                <source src="/mixkit-bell-notification-933.wav" type="audio/wav" />
                Tu navegador no soporta el elemento de audio.
            </audio>

            {/* Cabecera corporativa */}
            <header className="w-full bg-[#006341] py-4 px-6 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="bg-white p-2 rounded-md mr-4">
                            {/* Logo placeholder */}
                        </div>
                        <h1 className="text-white text-2xl font-bold">Sistema de Monitoreo RFID</h1>
                    </div>
                    <div className="flex items-center">
                        <Badge variant="outline" className="bg-[#00A859] text-white px-4 py-2 text-lg">
                            {connection ? 'Conectado' : 'Desconectado'}
                        </Badge>
                        <button
                            onClick={toggleSound}
                            className="ml-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                            aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
                        >
                            <Volume2 className={`h-6 w-6 ${soundEnabled ? 'text-[#00A859]' : 'text-gray-400'}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Barra de hora de entrada */}
            <div className="w-full bg-[#00A859] py-3 px-6 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {hasProduct && productData ? (
                        <>
                            <div className="flex items-center">
                                <Timer className="h-8 w-8 text-white mr-2" />
                                <h2 className="text-white text-2xl font-bold">HORA DE ENTRADA: {productData.entryTime}</h2>
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-6 w-6 text-white mr-2" />
                                <span className="text-white text-xl">{productData.shift}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center w-full justify-center">
                            <Timer className="h-8 w-8 text-white mr-2" />
                            <h2 className="text-white text-2xl font-bold">EN ESPERA DE NUEVO PRODUCTO</h2>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10">
                <div className="max-w-7xl mx-auto">
                    {hasProduct && productData ? (
                        <>
                            {/* Fecha y información del producto */}
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-md bg-gray-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="w-2 h-16 bg-[#006341] mr-4"></div>
                                            <div>
                                                <p className="text-[#006341] text-lg font-medium">FECHA</p>
                                                <p className="text-3xl font-bold text-[#333333]">{productData.date}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-md bg-[#00A859]">
                                    <CardContent className="p-6">
                                        <p className="text-white text-lg font-medium mb-2">PRODUCTO</p>
                                        <p className="text-2xl font-bold text-white">{productData.name}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Imagen del producto */}
                                <div>
                                    <Card className="border-none shadow-xl h-full overflow-hidden">
                                        <div className="h-12 bg-[#006341] flex items-center px-6">
                                            <h3 className="text-white font-bold">IMAGEN DEL PRODUCTO</h3>
                                        </div>
                                        <CardContent className="p-6 flex items-center justify-center h-[calc(100%-3rem)]">
                                            <Image
                                                src={productData.image}
                                                alt={productData.name}
                                                width={300}
                                                height={300}
                                                className="object-contain"
                                                priority
                                                unoptimized
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Detalles del producto */}
                                <div className="lg:col-span-2">
                                    <Card className="border-none shadow-xl h-full overflow-hidden">
                                        <div className="h-12 bg-[#006341] flex items-center px-6">
                                            <h3 className="text-white font-bold">DETALLES DEL PRODUCTO</h3>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <ProductDetail
                                                    icon={<Hash className="h-10 w-10 text-[#006341]" />}
                                                    label="CÓDIGO DE PRODUCTO"
                                                    value={productData.code}
                                                />

                                                <ProductDetail
                                                    icon={<Scale className="h-10 w-10 text-white" />}
                                                    label="PESO NETO"
                                                    value={productData.weight}
                                                    highlight
                                                />

                                                <ProductDetail
                                                    icon={<Package2 className="h-10 w-10 text-[#006341]" />}
                                                    label="PIEZAS"
                                                    value={productData.pieces}
                                                />

                                                <ProductDetail
                                                    icon={<MapPin className="h-10 w-10 text-[#006341]" />}
                                                    label="ÁREA"
                                                    value={productData.area}
                                                />
                                            </div>

                                            {/* Operador */}
                                            <div className="mt-6">
                                                <ProductDetail
                                                    icon={<User className="h-10 w-10 text-[#006341]" />}
                                                    label="OPERADOR"
                                                    value={productData.operator}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Pantalla de espera */
                        <div className="flex flex-col items-center justify-center h-[60vh]">
                            <Card className="w-full max-w-2xl border-none shadow-xl overflow-hidden">
                                <div className="h-12 bg-[#006341] flex items-center px-6">
                                    <h3 className="text-white font-bold">SISTEMA DE MONITOREO RFID</h3>
                                </div>
                                <CardContent className="p-10 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                        <Package2 className="h-14 w-14 text-[#006341]" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-[#006341] mb-4">EN ESPERA DE PRODUCTO</h2>
                                    <p className="text-lg text-gray-600 mb-8">
                                        El sistema está esperando la detección de un nuevo producto a través del lector RFID.
                                        {lastActivityTime > 0 && (
                                            <span className="block mt-2 text-amber-600">
                        Último producto detectado hace {Math.floor((Date.now() - lastActivityTime)/1000)} segundos.
                      </span>
                                        )}
                                    </p>

                                    <div className="flex items-center justify-center w-16 h-16 relative">
                                        <div className="absolute w-16 h-16 border-t-4 border-[#00A859] border-solid rounded-full animate-spin"></div>
                                        <div className="absolute w-12 h-12 border-r-4 border-[#006341] border-solid rounded-full animate-spin"></div>
                                    </div>

                                    <div className="mt-8 flex items-center">
                                        <Badge variant="outline" className={`${connection ? 'bg-[#00A859] text-white' : 'bg-red-500 text-white'} px-4 py-2 text-lg flex items-center`}>
                                            {connection ? 'Conectado al servidor' : 'Desconectado'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Pie de página */}
            <footer className="w-full bg-gray-100 py-3 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
                    Sistema RFID de Monitoreo de Productos © {new Date().getFullYear()}
                </div>
            </footer>
        </main>
    )
}